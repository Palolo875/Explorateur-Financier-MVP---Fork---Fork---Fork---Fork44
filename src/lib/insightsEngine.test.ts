import { describe, it, expect, vi } from 'vitest';
import { generateInsights, calculateRevelationScore } from './insightsEngine';
import * as insightsService from '@/services/insights';
import { supabase } from '@/lib/supabaseClient';

vi.mock('@/services/insights');
vi.mock('@/lib/supabaseClient');

const mockTransactions = [
  { id: '1', user_id: '1', date: '2023-10-26', amount: -5.5, category: 'Food and Drink', description: 'Coffee Shop' },
  { id: '2', user_id: '1', date: '2023-10-25', amount: -75.2, category: 'Food and Drink', description: 'Grocery Store' },
];
const mockGoals = [
  { id: 1, user_id: '1', title: 'Fonds d\'urgence', target_amount: 10000, current_amount: 5000, deadline: '2024-12-31' },
];
const mockEmotions = [
  { id: 1, user_id: '1', date: '2023-10-01', mood: 7, note: 'Stressé par le travail' },
];

describe('insightsEngine', () => {
  describe('generateInsights', () => {
    it('should generate insights based on user data', async () => {
      vi.spyOn(insightsService, 'fetchZenQuote').mockResolvedValue('A quote');
      vi.spyOn(insightsService, 'fetchNumberTrivia').mockResolvedValue('A trivia');

      const insights = await generateInsights(mockTransactions, mockGoals, mockEmotions);
      expect(insights).toBeDefined();
      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('calculateRevelationScore', () => {
    it('should calculate a revelation score', async () => {
      const score = await calculateRevelationScore(mockTransactions, mockGoals);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
