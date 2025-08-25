import { useState, useEffect } from 'react';
import { Transaction } from './useTransactions';

interface Insight {
  bias: string;
  fact: string;
  quote: string;
  recommendation: string;
}

export function useInsights(transactions: Transaction[]) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateInsight() {
      if (transactions.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Analyze transactions for biases
      const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageSpending = totalSpending / transactions.length;
      let bias = 'Status Quo';
      let fact = `Your average spending is ${averageSpending.toFixed(2)}€ per transaction.`;
      let recommendation = 'Review your recurring expenses to see if you can optimize them.';

      if (averageSpending > 100) {
        bias = 'Procrastination';
        fact = `You have some high value transactions. Have you considered breaking them down into smaller payments?`;
        recommendation = 'For large purchases, consider setting up a dedicated savings goal.';
      }

      // 2. Fetch a motivational quote
      let quote = 'The secret of getting ahead is getting started.';
      try {
        const response = await fetch('https://zenquotes.io/api/random');
        const data = await response.json();
        quote = `"${data[0].q}" - ${data[0].a}`;
      } catch (error) {
        console.error('Error fetching quote:', error);
      }

      // 3. Generate insight object
      setInsight({
        bias,
        fact,
        quote,
        recommendation,
      });

      setLoading(false);
    }

    generateInsight();
  }, [transactions]);

  return { insight, loading };
}
