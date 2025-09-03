// Feature flags for optional modules
export const USE_CURRENCY_MODULE = true;
export const USE_EDUCATION_MODULE = true;
export const USE_QUOTES_MODULE = true;

// External API configuration
// Currency: we default to exchangerate.host (no key required). If you want to use CurrencyFreaks,
// set VITE_CURRENCYFREAKS_KEY in env and the service will prefer it.
export const CURRENCY_CONFIG = {
  preferCurrencyFreaks: false,
  currencyFreaksKey: import.meta?.env?.VITE_CURRENCYFREAKS_KEY as string | undefined,
};

// Locale defaults
export const DEFAULT_LOCALE = 'fr';
