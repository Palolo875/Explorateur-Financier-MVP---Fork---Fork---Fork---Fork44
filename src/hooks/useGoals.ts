import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Goal {
  id?: number;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getGoals() {
      if (USE_MOCK_DATA) {
        setGoals([
          { id: 1, title: 'Fonds d\'urgence', target_amount: 10000, current_amount: 5000, deadline: '2024-12-31' },
          { id: 2, title: 'Voyage au Japon', target_amount: 5000, current_amount: 2500, deadline: '2025-06-30' },
        ]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching goals:', error);
      } else {
        setGoals(data);
      }
      setLoading(false);
    }

    getGoals();
  }, []);

  async function addGoal(goal: Goal) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user.id })
      .select();

    if (error) {
      console.error('Error adding goal:', error);
    } else {
      setGoals([...goals, data[0]]);
    }
  }

  async function updateGoal(id: number, updatedGoal: Partial<Goal>) {
    const { data, error } = await supabase
      .from('goals')
      .update(updatedGoal)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating goal:', error);
    } else {
      setGoals(goals.map(g => g.id === id ? data[0] : g));
    }
  }

  async function deleteGoal(id: number) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
    } else {
      setGoals(goals.filter(g => g.id !== id));
    }
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal };
}
