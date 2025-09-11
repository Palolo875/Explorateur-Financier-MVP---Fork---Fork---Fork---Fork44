import { supabase } from '@/lib/supabaseClient';
import { Transaction } from '@/hooks/useTransactions';
import { Goal } from '@/hooks/useGoals';
import { Emotion } from '@/hooks/useEmotions';
import { cognitiveBiases, psychologicalFacts } from '@/data/psychology';
import { fetchZenQuote, fetchNumberTrivia } from '@/services/insights';

export interface Insight {
  type: "finance" | "goal" | "emotion";
  message: string;
  bias?: string;
  fact?: string;
  quote?: string;
  recommendation?: string;
  trivia?: string;
}

export async function generateInsights(
  transactions: Transaction[] | null,
  goals: Goal[] | null,
  emotions: Emotion[] | null
): Promise<Insight[]> {
  const insights: Insight[] = [];

  // 2. Analyze data and generate insights
  if (transactions && transactions.length > 0) {
    // Example: Detect 'Ease Effect' bias
    const recentTransactions = transactions.filter(t => new Date(t.date) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
    const totalRecentSpending = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    if (totalRecentSpending > 500) { // Arbitrary threshold
      const bias = cognitiveBiases.find(b => b.id === 'ease_effect');
      const fact = psychologicalFacts.find(f => f.id === 'future_discounting');
      const quote = await fetchZenQuote();
      insights.push({
        type: 'finance',
        message: 'You have spent a significant amount of money in the last 5 days.',
        bias: bias?.name,
        fact: fact?.fact,
        quote,
        recommendation: bias?.recommendation,
      });
    }
  }

  if (goals && goals.length > 0) {
    // Example: Detect 'Procrastination' bias
    const untouchedGoals = goals.filter(g => new Date(g.deadline) < new Date());
    if (untouchedGoals.length > 0) {
      const bias = cognitiveBiases.find(b => b.id === 'procrastination');
      const fact = psychologicalFacts.find(f => f.id === 'habit_power');
      const quote = await fetchZenQuote();
      insights.push({
        type: 'goal',
        message: 'Some of your goals are past their deadline. It might be time to review them.',
        bias: bias?.name,
        fact: fact?.fact,
        quote,
        recommendation: bias?.recommendation,
      });
    }
  }

  // Add a general insight with a trivia
  const trivia = await fetchNumberTrivia();
  insights.push({
    type: 'finance',
    message: 'Did you know?',
    trivia,
    recommendation: 'Keep learning about finance to improve your skills.',
  });

  return insights;
}

export async function calculateRevelationScore(
  transactions: Transaction[] | null,
  goals: Goal[] | null
): Promise<number> {
  let financialHealthScore = 50;
  if (transactions) {
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    financialHealthScore = Math.max(0, Math.min(100, savingsRate * 200)); // Normalize to 0-100
  }

  let behavioralDisciplineScore = 50;
  if (transactions) {
    const recentTransactions = transactions.filter(t => new Date(t.date) > new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
    const totalRecentSpending = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    if (totalRecentSpending > 500) {
      behavioralDisciplineScore -= 25;
    }
  }

  let goalProgressionScore = 50;
  if (goals && goals.length > 0) {
    const totalProgress = goals.reduce((sum, g) => sum + (g.current_amount / g.target_amount), 0);
    goalProgressionScore = Math.max(0, Math.min(100, (totalProgress / goals.length) * 100));
  }

  const finalScore = (financialHealthScore * 0.5) + (behavioralDisciplineScore * 0.25) + (goalProgressionScore * 0.25);

  return Math.round(finalScore);
}
