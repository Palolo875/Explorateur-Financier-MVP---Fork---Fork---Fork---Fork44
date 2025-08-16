import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FinancialData } from '../types/finance';

// Define default financial data
const defaultFinancialData: FinancialData = {
  incomes: [],
  expenses: [],
  savings: [],
  debts: [],
  investments: []
};
interface FinanceStore {
  financialData: FinancialData;
  setFinancialData: (data: FinancialData) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
}
export const useFinanceStore = create<FinanceStore>()(persist(set => ({
  financialData: defaultFinancialData,
  setFinancialData: data => set({
    financialData: data
  }),
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: value => set({
    hasCompletedOnboarding: value
  })
}), {
  name: 'finance-store'
}));