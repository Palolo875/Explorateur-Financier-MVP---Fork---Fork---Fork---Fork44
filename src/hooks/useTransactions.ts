import { useState, useEffect } from 'react';
import { fetchTransactions as fetchMockTransactions, Transaction } from '@/services/banking';
import { getUserId, selectAll } from '@/services/api';

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

      const userId = await getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await selectAll<Transaction>('transactions', userId);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
      setLoading(false);
    }

    getTransactions();
  }, []);

  return { transactions, loading };
}
