import { useState, useEffect } from 'react';
import { getUserId, selectAll, insertOne } from '@/services/api';

export interface Emotion {
  id?: number;
  user_id?: string;
  date: string;
  mood: number;
  note: string;
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useEmotions() {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEmotions() {
      if (USE_MOCK_DATA) {
        setEmotions([
          { date: '2023-10-01', mood: 7, note: 'Stressé par le travail' },
          { date: '2023-10-15', mood: 3, note: 'Content de mes économies' },
        ]);
        setLoading(false);
        return;
      }

      const userId = await getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await selectAll<Emotion>('emotions', userId);
        setEmotions(data);
      } catch (error) {
        console.error('Error fetching emotions:', error);
      }
      setLoading(false);
    }

    getEmotions();
  }, []);

  async function addEmotion(emotion: Emotion) {
    const userId = await getUserId();
    if (!userId) return;

    try {
      const created = await insertOne('emotions', { ...emotion, user_id: userId });
      setEmotions([...emotions, created]);
    } catch (error) {
      console.error('Error adding emotion:', error);
    }
  }

  return { emotions, loading, addEmotion };
}
