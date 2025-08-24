import { toast } from 'react-hot-toast';

// Service for open banking integration (e.g., Plaid).
export const USE_MOCK_DATA = true;

const PLAID_CLIENT_ID = 'YOUR_CLIENT_ID';
const PLAID_SECRET = 'YOUR_SECRET';
const PLAID_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

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
    const response = await fetch('https://sandbox.plaid.com/transactions/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: PLAID_ACCESS_TOKEN,
        start_date: '2023-01-01',
        end_date: '2023-10-26',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transactions.map((t: any) => ({
      transaction_id: t.transaction_id,
      name: t.name,
      amount: t.amount,
      date: t.date,
      category: t.category,
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    toast.error('Erreur lors de la récupération des transactions.');
    return [];
  }
}
