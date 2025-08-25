import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchTransactions as fetchMockTransactions, Transaction } from '@/services/banking';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTransactions() {
      if (USE_MOCK_DATA) {
        const mockTransactions = await fetchMockTransactions();
        setTransactions(mockTransactions);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data);
      }
      setLoading(false);
    }

    getTransactions();
  }, []);

  return { transactions, loading };
}
