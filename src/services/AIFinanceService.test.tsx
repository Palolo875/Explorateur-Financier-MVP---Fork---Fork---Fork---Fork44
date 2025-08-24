import { describe, it, expect, vi } from 'vitest';
import { AIFinanceService } from './AIFinanceService';
import * as economy from './economy';
import * as banking from './banking';
import * as ml from './ml';

vi.mock('./economy');
vi.mock('./banking');
vi.mock('./ml');

describe('AIFinanceService', () => {
  it('should initialize successfully', async () => {
    const aiFinanceService = new AIFinanceService();
    const result = await aiFinanceService.initialize();
    expect(result).toBe(true);
  });

  it('should run a simulation with fetched inflation data', async () => {
    const aiFinanceService = new AIFinanceService();
    vi.spyOn(economy, 'fetchInflationData').mockResolvedValue([{ year: 2023, value: 3 }]);
    const result = await aiFinanceService.runSimulation({
      name: 'test',
      initialSavings: 10000,
      monthlyInvestment: 500,
      investmentReturn: 5,
      years: 10,
      incomeGrowth: 2,
      expenseReduction: 1,
      savingsRate: 50,
      incomes: [{ id: '1', name: 'Salary', value: 5000, category: 'salary' }],
      expenses: [{ id: '1', name: 'Rent', value: 1500, category: 'housing' }],
    });
    expect(result.params.name).toBe('test');
    expect(result.netWorth.length).toBe(10);
    expect(economy.fetchInflationData).toHaveBeenCalled();
  });
});
