import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

// Service for fetching financial market data (stocks, crypto).
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export async function fetchStockData(symbol: string): Promise<{ date: string; value: number }[]> {
  if (USE_MOCK_DATA) {
    // Generate mock data
    const data = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: 100 + Math.random() * 20 - 10,
      });
    }
    return data;
  }

  // First try Supabase Edge Function if available
  try {
    const { data, error } = await supabase.functions.invoke('getMarketData', {
      body: { symbol },
    });

    if (error) {
      throw error;
    }

    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    console.warn('Supabase function getMarketData not available or failed. Falling back to direct API.', error);
  }

  // Fallback: Direct Alpha Vantage TIME_SERIES_DAILY (requires client-side key; rate-limited)
  try {
    const apiKey = (import.meta as any).env?.VITE_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing VITE_ALPHA_VANTAGE_API_KEY');
    }
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}&outputsize=compact`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }
    const json = await response.json();

    const series = json['Time Series (Daily)'] || {};
    const result = Object.keys(series)
      .slice(0, 30)
      .map((date) => ({
        date,
        value: Number(series[date]['4. close']) || 0,
      }))
      .reverse();

    return result;
  } catch (error) {
    console.error('Error fetching stock data (fallback):', error);
    toast.error('Erreur lors de la récupération des données boursières.');
    return [];
  }
}

export async function fetchCryptoData(id: string = 'bitcoin'): Promise<{ date: string; value: number }[]> {
  if (USE_MOCK_DATA) {
    // Generate mock data
    const data = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: 40000 + Math.random() * 5000 - 2500,
      });
    }
    return data;
  }

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`);
    if (!response.ok) {
      throw new Error(`Failed to fetch crypto data: ${response.statusText}`);
    }
    const data = await response.json();

    const cryptoData = data.prices.map((price: [number, number]) => ({
      date: new Date(price[0]).toISOString().split('T')[0],
      value: price[1],
    }));

    return cryptoData;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    toast.error('Erreur lors de la récupération des données de crypto-monnaie.');
    return [];
  }
}
