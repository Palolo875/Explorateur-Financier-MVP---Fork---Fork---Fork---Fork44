import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

// Service for open banking integration (e.g., Plaid).
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export interface Transaction {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
  category: string[];
}

export async function fetchTransactions(): Promise<Transaction[]> {
  if (USE_MOCK_DATA) {
    return [
      { transaction_id: '1', name: 'Coffee Shop', amount: 5.5, date: '2023-10-26', category: ['Food and Drink', 'Restaurants'] },
      { transaction_id: '2', name: 'Grocery Store', amount: 75.2, date: '2023-10-25', category: ['Food and Drink', 'Groceries'] },
      { transaction_id: '3', name: 'Gas Station', amount: 45.0, date: '2023-10-24', category: ['Transportation', 'Gas'] },
      { transaction_id: '4', name: 'Online Shopping', amount: 120.0, date: '2023-10-23', category: ['Shopping', 'Online'] },
      { transaction_id: '5', name: 'Gym Membership', amount: 30.0, date: '2023-10-22', category: ['Health and Fitness', 'Gyms'] },
    ];
  }

  try {
    const { data, error } = await supabase.functions.invoke('getPlaidTransactions');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    toast.error('Erreur lors de la récupération des transactions.');
    return [];
  }
}
