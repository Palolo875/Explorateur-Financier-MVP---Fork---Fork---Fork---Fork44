import type React from 'react';
export interface FinancialItem {
  id?: string;
  value: number | string;
  category: string;
  description?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';
  isRecurring?: boolean;
}
export interface FinancialData {
  incomes: FinancialItem[];
  expenses: FinancialItem[];
  savings: FinancialItem[];
  debts: FinancialItem[];
  investments?: FinancialItem[];
}
export interface EmotionalContext {
  mood: number;
  tags: string[];
}
export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  action: string;
  potentialSavings?: number;
}
export interface Simulation {
  name: string;
  years: number;
  incomeGrowth: number;
  expenseReduction: number;
  savingsRate: number;
  investmentReturn: number;
  inflationRate: number;
  simulationType: 'normal' | 'optimistic' | 'pessimistic' | 'crisis';
}

export interface GoalSimulation {
  name?: string;
  years: number[];
  income: number[];
  expenses: number[];
  savings: number[];
  netWorth: number[];
  params: Simulation;
}
export interface QuestionSuggestion {
  id: string;
  text: string;
  category: 'budget' | 'investment' | 'saving' | 'debt' | 'general';
  icon: React.ReactNode;
}