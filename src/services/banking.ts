import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

export interface Transaction {
  transaction_id: string;
  name: string;
  amount: number;
  date: string;
  category: string[];
}

export async function fetchTransactions(): Promise<Transaction[]> {
  // TODO: Connect to real API
  // The code below is an example of how to call a Supabase function.
  // It should be adapted to the real implementation.
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
