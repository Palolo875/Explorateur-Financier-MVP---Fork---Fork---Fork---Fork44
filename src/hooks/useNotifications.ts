import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Notification {
  id: number;
  user_id: string;
  message: string;
  type: string;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data);
      }
      setLoading(false);
    }

    getNotifications();
  }, []);

  return { notifications, loading };
}
