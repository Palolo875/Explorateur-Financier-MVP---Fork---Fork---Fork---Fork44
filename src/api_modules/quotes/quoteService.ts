import { DEFAULT_LOCALE, USE_QUOTES_MODULE } from '@/config';

export interface QuoteItem {
  id: string;
  text: string;
  author?: string;
  locale: 'en' | 'fr';
}

async function fetchRemoteQuote(locale: 'en' | 'fr'): Promise<QuoteItem | null> {
  try {
    if (locale === 'en') {
      const res = await fetch('https://zenquotes.io/api/random');
      if (!res.ok) throw new Error('zenquotes error');
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.q) {
        return { id: `zen-${Date.now()}`, text: data[0].q, author: data[0].a, locale: 'en' };
      }
    }
    // No stable free FR API; fall back to local for FR
    return null;
  } catch {
    return null;
  }
}

async function fetchLocalQuotes(): Promise<QuoteItem[]> {
  const res = await fetch('/data/quotes.json');
  if (!res.ok) return [];
  return (await res.json()) as QuoteItem[];
}

export async function getRandomQuote(locale: 'en' | 'fr' = DEFAULT_LOCALE as 'en' | 'fr'): Promise<QuoteItem | null> {
  if (!USE_QUOTES_MODULE) return null;
  const [remote, local] = await Promise.all([fetchRemoteQuote(locale), fetchLocalQuotes()]);
  if (remote) return remote;
  const pool = local.filter(q => q.locale === locale);
  if (!pool.length) return local.find(q => q.locale === 'en') || null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
