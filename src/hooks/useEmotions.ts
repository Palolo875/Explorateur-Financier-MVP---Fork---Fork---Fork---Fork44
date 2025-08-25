import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Emotion {
  id?: number;
  user_id?: string;
  date: string;
  mood: number;
  note: string;
}

export function useEmotions() {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEmotions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('emotions')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching emotions:', error);
      } else {
        setEmotions(data);
      }
      setLoading(false);
    }

    getEmotions();
  }, []);

  async function addEmotion(emotion: Emotion) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('emotions')
      .insert({ ...emotion, user_id: user.id })
      .select();

    if (error) {
      console.error('Error adding emotion:', error);
    } else {
      setEmotions([...emotions, data[0]]);
    }
  }

  return { emotions, loading, addEmotion };
}
