import { CURRENCY_CONFIG } from '@/config';

export interface ConversionResult {
  base: string;
  target: string;
  rate: number;
  value: number;
}

export interface RatesMap {
  [symbol: string]: number;
}

const EXCHANGERATE_HOST_BASE = 'https://api.exchangerate.host';

async function fetchRateExchangerateHost(base: string, symbols: string[]): Promise<RatesMap> {
  const url = `${EXCHANGERATE_HOST_BASE}/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols.join(','))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`exchangerate.host error: ${res.status}`);
  const data = await res.json();
  return data.rates as RatesMap;
}

async function fetchRateCurrencyFreaks(base: string, symbols: string[]): Promise<RatesMap> {
  const apiKey = CURRENCY_CONFIG.currencyFreaksKey;
  if (!apiKey) throw new Error('CurrencyFreaks API key missing');
  const url = `https://api.currencyfreaks.com/latest?apikey=${encodeURIComponent(apiKey)}&base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols.join(','))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CurrencyFreaks error: ${res.status}`);
  const data = await res.json();
  // CurrencyFreaks returns rates keyed by symbol
  return data.rates as RatesMap;
}

const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  TON: 'the-open-network',
  USDT: 'tether',
  USDC: 'usd-coin'
};

function mapSymbolsToIds(symbols: string[]): { ids: string[]; symbolById: Record<string, string> } {
  const ids: string[] = [];
  const symbolById: Record<string, string> = {};
  symbols.forEach(sym => {
    const normalized = sym.toUpperCase();
    const id = SYMBOL_TO_COINGECKO_ID[normalized];
    if (id) {
      ids.push(id);
      symbolById[id] = normalized;
    }
  });
  return { ids, symbolById };
}

async function fetchCryptoRates(vsCurrency = 'USD', symbols: string[]): Promise<RatesMap> {
  const { ids, symbolById } = mapSymbolsToIds(symbols);
  if (!ids.length) return {};
  // Use CoinGecko simple price (no key) for crypto spot rates
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=${encodeURIComponent(vsCurrency)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  const data = await res.json();
  const map: RatesMap = {};
  ids.forEach(id => {
    const value = data?.[id]?.[vsCurrency.toLowerCase()];
    if (typeof value === 'number') {
      const symbol = symbolById[id] ?? id.toUpperCase();
      map[symbol] = value;
    }
  });
  return map;
}

function isCrypto(symbol: string): boolean {
  return /^(BTC|ETH|SOL|USDT|USDC|BNB|XRP|ADA|DOGE|TON|\w{2,10}-CRYPTO)$/i.test(symbol);
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export async function getConversionRate(fromSymbol: string, toSymbol: string): Promise<number> {
  const from = normalizeSymbol(fromSymbol);
  const to = normalizeSymbol(toSymbol);

  if (from === to) return 1;

  const fromIsCrypto = isCrypto(from);
  const toIsCrypto = isCrypto(to);

  // Strategy: convert both through USD when needed
  const pivot = 'USD';

  // Helper to fetch fiat rates using preferred provider
  const fetchFiatRates = async (base: string, symbols: string[]) => {
    if (CURRENCY_CONFIG.preferCurrencyFreaks && CURRENCY_CONFIG.currencyFreaksKey) {
      return fetchRateCurrencyFreaks(base, symbols);
    }
    return fetchRateExchangerateHost(base, symbols);
  };

  if (!fromIsCrypto && !toIsCrypto) {
    const rates = await fetchFiatRates(from, [to]);
    const rate = rates[to];
    if (!rate) throw new Error('Rate not found');
    return rate;
  }

  if (fromIsCrypto && toIsCrypto) {
    // crypto -> crypto: get both vs USD
    const cryptoRates = await fetchCryptoRates(pivot, [from, to]);
    const fromUsd = cryptoRates[from];
    const toUsd = cryptoRates[to];
    if (!fromUsd || !toUsd) throw new Error('Crypto rate not found');
    return fromUsd / toUsd;
  }

  if (fromIsCrypto && !toIsCrypto) {
    const [cryptoMap, fiatMap] = await Promise.all([
      fetchCryptoRates(pivot, [from]),
      fetchFiatRates(pivot, [to])
    ]);
    const fromUsd = cryptoMap[from];
    const usdToTarget = fiatMap[to];
    if (!fromUsd || !usdToTarget) throw new Error('Rate not found');
    return fromUsd * usdToTarget;
  }

  // fiat -> crypto
  const [fiatMap, cryptoMap] = await Promise.all([
    fetchFiatRates(from, [pivot]),
    fetchCryptoRates(pivot, [to])
  ]);
  const fromToUsd = fiatMap[pivot];
  const targetUsd = cryptoMap[to];
  if (!fromToUsd || !targetUsd) throw new Error('Rate not found');
  return fromToUsd / targetUsd;
}

export async function convertAmount(amount: number, from: string, to: string): Promise<ConversionResult> {
  const rate = await getConversionRate(from, to);
  return { base: normalizeSymbol(from), target: normalizeSymbol(to), rate, value: amount * rate };
}

export async function compareRates(base: string, targets: string[]): Promise<RatesMap> {
  const normalizedBase = normalizeSymbol(base);
  const normalizedTargets = targets.map(normalizeSymbol);

  const baseIsCrypto = isCrypto(normalizedBase);
  const pivot = 'USD';

  if (!baseIsCrypto) {
    // Pure fiat compare
    return await fetchRateExchangerateHost(normalizedBase, normalizedTargets);
  }

  // Crypto base: compute vs fiat by dividing USD quotes
  const [cryptoMap, fiatMap] = await Promise.all([
    fetchCryptoRates(pivot, [normalizedBase]),
    fetchRateExchangerateHost(pivot, normalizedTargets)
  ]);

  const result: RatesMap = {};
  const baseUsd = cryptoMap[normalizedBase];
  normalizedTargets.forEach(symbol => {
    const usdToSymbol = fiatMap[symbol];
    if (baseUsd && usdToSymbol) {
      result[symbol] = baseUsd * usdToSymbol;
    }
  });
  return result;
}
