import { useState, useEffect } from 'react';
import { getUserId, selectAll, insertOne, updateById, deleteById } from '@/services/api';

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

      const userId = await getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await selectAll<Goal>('goals', userId);
        setGoals(data);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
      setLoading(false);
    }

    getGoals();
  }, []);

  async function addGoal(goal: Goal) {
    const userId = await getUserId();
    if (!userId) return;

    try {
      const created = await insertOne('goals', { ...goal, user_id: userId });
      setGoals([...goals, created]);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  }

  async function updateGoal(id: number, updatedGoal: Partial<Goal>) {
    try {
      const updated = await updateById<Goal>('goals', id, updatedGoal);
      setGoals(goals.map(g => g.id === id ? updated : g));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  }

  async function deleteGoal(id: number) {
    try {
      await deleteById('goals', id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal };
}
