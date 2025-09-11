import { DEFAULT_LOCALE, USE_EDUCATION_MODULE } from '@/config';
import { MicroLesson } from '@/types/domain';

async function fetchRemoteMicroLessons(): Promise<MicroLesson[]> {
  // Placeholder open resource: we will attempt to fetch from a public JSON as demo.
  // Fallback to local if it fails.
  const url = 'https://raw.githubusercontent.com/public-datasets-finance/micro-lessons/main/personal_finance.json';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`remote lessons error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchLocalMicroLessons(): Promise<MicroLesson[]> {
  const res = await fetch('/data/microLessons.json');
  if (!res.ok) return [];
  return (await res.json()) as MicroLesson[];
}

export async function getDailyMicroLesson(locale: 'en' | 'fr' = DEFAULT_LOCALE as 'en' | 'fr'): Promise<MicroLesson | null> {
  if (!USE_EDUCATION_MODULE) return null;

  const [remote, local] = await Promise.all([fetchRemoteMicroLessons(), fetchLocalMicroLessons()]);
  const pool = (remote.length ? remote : local).filter(l => l.locale === locale);
  if (!pool.length) return local.find(l => l.locale === 'en') || null;
  // Deterministic pick by day
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const idx = dayIndex % pool.length;
  return pool[idx];
}
