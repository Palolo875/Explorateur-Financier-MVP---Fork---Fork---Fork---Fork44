import * as tf from '@tensorflow/tfjs';
import { LinearRegression } from 'linear-regression-ts';

// Service for machine learning tasks like categorization and prediction.
export const USE_MOCK_DATA = true;

export function predictCashflow(transactions: { date: string, amount: number }[]): number {
  if (USE_MOCK_DATA) {
    if (transactions.length < 2) {
      return 0;
    }
    const inputs = transactions.map(t => new Date(t.date).getTime());
    const labels = transactions.map(t => t.amount);

    const lr = new LinearRegression({ inputs: [inputs], labels });
    lr.fit({
      iterations: 100,
      learningRate: 0.001,
    });

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const prediction = lr.predict([nextMonth.getTime()]);

    return prediction[0];
  }

  // In a real app, you would use a more sophisticated model to predict cashflow.
  // For this MVP, we'll use a simple linear regression model.
  return 0;
}
