import type React from 'react';
import { SimulationParams, SimulationResult } from './finance';

// From src/api_modules/currency/currencyService.ts
export interface ConversionResult {
  base: string;
  target: string;
  rate: number;
  value: number;
}
export interface RatesMap {
  [key: string]: number;
}

// From src/api_modules/education/educationService.ts
export interface MicroLesson {
  id: string;
  locale: 'en' | 'fr';
  title: string;
  content: string;
}

// From src/api_modules/quotes/quoteService.ts
export interface QuoteItem {
  id: string;
  text: string;
  author?: string;
  locale: 'en' | 'fr';
}

// From src/components/AdvancedSimulation.tsx
export interface GoalSimulation {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  interestRate: number;
  inflationRate: number;
  years: number;
  results: {
    years: number[];
    amounts: number[];
    adjustedForInflation: number[];
  };
}
export interface ScenarioComparison {
  name: string;
  description: string;
  params: SimulationParams;
  results: SimulationResult;
}

// From src/components/Dashboard.tsx
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  date: Date;
  read: boolean;
}

// From src/components/EmotionalJournal.tsx
export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  tags: string[];
  text: string;
  financialContext?: {
    income?: number;
    expenses?: number;
    balance?: number;
  };
}

// From src/components/HiddenFeesDetector.tsx
export interface HiddenFee {
  id: string;
  category: string;
  amount: number;
  description: string;
  potentialSaving: number;
  actionable: boolean;
  actionType?: 'call' | 'email' | 'cancel' | 'negotiate' | 'switch';
  actionDetails?: string;
  recurrenceType?: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
}

// From src/components/Layout.tsx
export interface LayoutProps {
  children: React.ReactNode;
}

// From src/components/Lessons.tsx
export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'débutant' | 'intermédiaire' | 'avancé';
  duration: number; // minutes
  image: string;
  url: string;
  completed?: boolean;
  progress?: number; // 0-100
  lastUpdated: string;
  source: string;
  rating: number; // 1-5
}

// From src/components/Library.tsx
export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'guide' | 'rapport' | 'outil';
  source: string;
  url: string;
  image?: string;
  date: string;
  featured?: boolean;
  tags: string[];
  rating?: number; // 1-5
}

// From src/components/MappingScreen.tsx
export interface CategoryOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

// From src/components/QuestionScreen.tsx
export interface QuestionHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  emotionalContext?: {
    mood: number;
    tags: string[];
  };
}
export interface ContextualTag {
  id: string;
  label: string;
  category: 'work' | 'family' | 'health' | 'finance' | 'other';
}
export interface MoodArchetype {
  id: string;
  animal: string;
  label: string;
  description: string;
  moodValue: number;
  emoji: string;
}

// From src/components/Reports.tsx
export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: 'income' | 'expense' | 'saving' | 'debt' | 'general';
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
}
export interface SimulationResults {
  netWorth: number[];
  income: number[];
  expenses: number[];
  savings: number[];
}
export interface FinancialReport {
  id: string;
  title: string;
  date: string;
  insights: FinancialInsight[];
  summary: string;
  recommendations: string[];
  simulationResults: SimulationResults;
}

// From src/components/RevealScreen.tsx
export interface AnalysisSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
}

// From src/services/education.ts
export interface EducationResource {
  key: string;
  title: string;
  author_name: string[];
  first_publish_year: number;
}
