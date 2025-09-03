import React, { useState, createContext, useContext } from 'react';
import { useFinanceStore } from '../stores/financeStore';
import { FinancialData, FinancialInsight, EmotionalContext, Simulation, GoalSimulation } from '../types/finance';
import { runSimulation as runSimulationUtil } from '../utils/financialCalculations';

interface FinanceContextType {
  userQuestion: string;
  setUserQuestion: (question: string) => void;
  financialData: FinancialData;
  setFinancialData: (data: FinancialData | ((prev: FinancialData) => FinancialData)) => void;
  emotionalContext: EmotionalContext;
  setEmotionalContext: (context: EmotionalContext) => void;
  generateInsights: () => Promise<FinancialInsight[]>;
  runSimulation: (params: Simulation) => Promise<GoalSimulation>;
  getFinancialHealth: () => Promise<{
    score: number;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  }>;
  detectHiddenFees: () => Promise<any[]>;
  getHistoricalData: () => Promise<any[]>;
  getPredictions: () => Promise<any>;
  getFinancialScore: () => number;
  calculateTotalIncome: () => number;
  calculateTotalExpenses: () => number;
  calculateNetWorth: () => number;
  refreshData: () => Promise<void>;
}

// Default values for financial data
const defaultFinancialData: FinancialData = {
  incomes: [],
  expenses: [],
  savings: [],
  debts: [],
  investments: []
};
// Default emotional context
const defaultEmotionalContext: EmotionalContext = {
  mood: 5,
  tags: ['Neutre']
};
// Create the context with default values
const FinanceContext = createContext<FinanceContextType>({
  userQuestion: '',
  setUserQuestion: () => {
    // TODO: Implement user question setting
  },
  financialData: defaultFinancialData,
  setFinancialData: () => {
    // TODO: Implement financial data setting
  },
  emotionalContext: defaultEmotionalContext,
  setEmotionalContext: () => {
    // TODO: Implement emotional context setting
  },
  generateInsights: async () => [],
  runSimulation: async () => ({} as GoalSimulation),
  getFinancialHealth: async () => ({
    score: 0,
    recommendations: [],
    strengths: [],
    weaknesses: []
  }),
  detectHiddenFees: async () => [],
  getHistoricalData: async () => [],
  getPredictions: async () => (null),
  getFinancialScore: () => 0,
  calculateTotalIncome: () => 0,
  calculateTotalExpenses: () => 0,
  calculateNetWorth: () => 0,
  refreshData: async () => {
    // TODO: Implement data refresh
  }
});
export function FinanceProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [userQuestion, setUserQuestion] = useState('');
  const [emotionalContext, setEmotionalContext] = useState<EmotionalContext>(defaultEmotionalContext);
  const {
    financialData: storeFinancialData,
    setFinancialData: storeSetFinancialData
  } = useFinanceStore();

  // Ensure we always have valid financial data by merging with defaults
  const safeFinancialData = {
    ...defaultFinancialData,
    ...storeFinancialData,
    // Ensure all arrays exist
    incomes: Array.isArray(storeFinancialData?.incomes) ? storeFinancialData.incomes : [],
    expenses: Array.isArray(storeFinancialData?.expenses) ? storeFinancialData.expenses : [],
    savings: Array.isArray(storeFinancialData?.savings) ? storeFinancialData.savings : [],
    debts: Array.isArray(storeFinancialData?.debts) ? storeFinancialData.debts : [],
    investments: Array.isArray(storeFinancialData?.investments) ? storeFinancialData.investments : []
  };

  // Enhanced setFinancialData with error handling
  const setFinancialDataSafe = (data: FinancialData | ((prev: FinancialData) => FinancialData)) => {
    try {
      if (typeof data === 'function') {
        const newData = data(safeFinancialData);
        console.log('Updating financial data:', newData);
        storeSetFinancialData(newData);
      } else {
        console.log('Setting financial data:', data);
        storeSetFinancialData(data);
      }
    } catch (error) {
      console.error('Error updating financial data:', error);
      throw new Error('Failed to update financial data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  // Function to calculate total income
  const calculateTotalIncome = () => {
    if (!safeFinancialData.incomes || !Array.isArray(safeFinancialData.incomes)) return 0;
    return safeFinancialData.incomes.reduce((total, income) => total + (parseFloat(income.value as any) || 0), 0);
  };
  // Function to calculate total expenses
  const calculateTotalExpenses = () => {
    if (!safeFinancialData.expenses || !Array.isArray(safeFinancialData.expenses)) return 0;
    return safeFinancialData.expenses.reduce((total, expense) => total + (parseFloat(expense.value as any) || 0), 0);
  };
  const calculateTotalSavings = () => {
    if (!safeFinancialData.savings || !Array.isArray(safeFinancialData.savings)) return 0;
    return safeFinancialData.savings.reduce((total, item) => total + (parseFloat(item.value as any) || 0), 0);
  };
  const calculateTotalInvestments = () => {
    if (!safeFinancialData.investments || !Array.isArray(safeFinancialData.investments)) return 0;
    return safeFinancialData.investments.reduce((total, item) => total + (parseFloat(item.value as any) || 0), 0);
  };
  const calculateTotalDebts = () => {
    if (!safeFinancialData.debts || !Array.isArray(safeFinancialData.debts)) return 0;
    return safeFinancialData.debts.reduce((total, item) => total + (parseFloat(item.value as any) || 0), 0);
  };
  // Function to calculate net worth
  const calculateNetWorth = () => {
    const totalAssets = calculateTotalSavings() + calculateTotalInvestments();
    const totalLiabilities = calculateTotalDebts();
    return totalAssets - totalLiabilities;
  };
  const generateInsights = async (): Promise<FinancialInsight[]> => {
    // TODO: Connect to real API
    return [];
  };
  const getFinancialHealth = async () => {
    // TODO: Connect to real API
    return {
      score: 0,
      recommendations: [],
      strengths: [],
      weaknesses: []
    };
  };
  const runSimulation = async (params: Simulation): Promise<GoalSimulation> => {
    // This can remain a client-side calculation
    return runSimulationUtil(safeFinancialData, params);
  };
  // Mock functions for other finance operations
  const detectHiddenFees = async () => {
    // TODO: Connect to real API
    return [];
  }
  const getHistoricalData = async () => {
    // TODO: Connect to real API
    return [];
  }
  const getPredictions = async () => {
    // TODO: Connect to real API
    return null;
  }
  const getFinancialScore = () => {
    // TODO: Connect to real API
    return 0;
  }
  const refreshData = async () => {
    // TODO: Implement data refresh logic
  };

  return <FinanceContext.Provider value={{
    userQuestion,
    setUserQuestion,
    financialData: safeFinancialData,
    setFinancialData: setFinancialDataSafe,
    emotionalContext,
    setEmotionalContext,
    generateInsights,
    runSimulation,
    getFinancialHealth,
    detectHiddenFees,
    getHistoricalData,
    getPredictions,
    getFinancialScore,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateNetWorth,
    refreshData
  }}>
      {children}
    </FinanceContext.Provider>;
}
// Custom hook to use the finance context
export const useFinance = () => useContext(FinanceContext);