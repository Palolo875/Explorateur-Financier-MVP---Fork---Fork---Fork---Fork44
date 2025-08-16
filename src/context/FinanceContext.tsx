import React, { useState, createContext, useContext } from 'react';
import { useFinanceStore } from '../stores/financeStore';
import { FinancialData, FinancialInsight, EmotionalContext } from '../types/finance';
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
const FinanceContext = createContext<any>({
  userQuestion: '',
  setUserQuestion: () => {},
  financialData: defaultFinancialData,
  setFinancialData: () => {},
  emotionalContext: defaultEmotionalContext,
  setEmotionalContext: () => {},
  generateInsights: async () => [],
  runSimulation: async () => {},
  getFinancialHealth: async () => ({
    score: 50,
    recommendations: [],
    strengths: [],
    weaknesses: []
  }),
  detectHiddenFees: async () => [],
  getHistoricalData: async () => [],
  getPredictions: async () => [],
  getFinancialScore: () => 50,
  calculateTotalIncome: () => 0,
  calculateTotalExpenses: () => 0,
  calculateNetWorth: () => 0,
  refreshData: async () => {}
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
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const insights: FinancialInsight[] = [];
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    // Insight 1: Savings rate
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome * 100 : 0;
    if (savingsRate < 10) {
      insights.push({
        id: 'insight-savings-rate-low',
        title: "Taux d'épargne faible",
        description: `Votre taux d'épargne est de ${savingsRate.toFixed(1)}%. Essayez de l'augmenter à au moins 15-20% pour accélérer l'atteinte de vos objectifs.`,
        category: 'Épargne',
        impact: 'high',
        action: "Augmenter l'épargne"
      });
    } else if (savingsRate > 20) {
      insights.push({
        id: 'insight-savings-rate-high',
        title: "Excellent taux d'épargne",
        description: `Félicitations ! Votre taux d'épargne de ${savingsRate.toFixed(1)}% est excellent et vous met sur la bonne voie pour votre avenir financier.`,
        category: 'Épargne',
        impact: 'low',
        action: "Maintenir l'épargne"
      });
    }
    // Insight 2: Emergency fund
    const emergencyFund = calculateTotalSavings();
    const monthlyExpenses = totalExpenses;
    if (monthlyExpenses > 0) {
      const monthsOfCoverage = emergencyFund / monthlyExpenses;
      if (monthsOfCoverage < 3) {
        insights.push({
          id: 'insight-emergency-fund-low',
          title: "Fonds d'urgence insuffisant",
          description: `Votre fonds d'urgence de ${emergencyFund.toLocaleString('fr-FR')}€ couvre moins de 3 mois de dépenses. Visez 3 à 6 mois pour plus de sécurité.`,
          category: 'Épargne',
          impact: 'high',
          action: "Constituer un fonds d'urgence"
        });
      }
    }
    // Insight 3: High spending category
    if (safeFinancialData.expenses.length > 0) {
      const highSpendingCategory = safeFinancialData.expenses.reduce((max, expense) => parseFloat(expense.value as string) > parseFloat(max.value as string) ? expense : max, safeFinancialData.expenses[0]);
      if (totalExpenses > 0 && parseFloat(highSpendingCategory.value as string) / totalExpenses > 0.3) {
        insights.push({
          id: 'insight-high-spending',
          title: `Dépense élevée en ${highSpendingCategory.category}`,
          description: `Votre catégorie "${highSpendingCategory.category}" représente plus de 30% de vos dépenses totales. Cherchez des moyens de réduire ces coûts.`,
          category: 'Dépenses',
          impact: 'medium',
          action: 'Analyser les dépenses'
        });
      }
    }
    return insights.length > 0 ? insights : [{
      id: 'no-insights',
      title: 'Tout semble en ordre',
      description: "Nous n'avons pas trouvé d'opportunités d'amélioration évidentes. Continuez comme ça !",
      category: 'Général',
      impact: 'low',
      action: 'Continuer'
    }];
  };
  const getFinancialHealth = async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const totalSavings = calculateTotalSavings();
    const totalDebts = calculateTotalDebts();
    const netWorth = calculateNetWorth();
    let score = 0;
    const recommendations: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    // Scoring logic (out of 100)
    // 1. Savings rate (30 pts)
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
    if (savingsRate >= 0.2) {
      score += 30;
      strengths.push("Taux d'épargne élevé (plus de 20%).");
    } else if (savingsRate >= 0.1) {
      score += 15;
      strengths.push("Taux d'épargne correct (plus de 10%).");
    } else {
      weaknesses.push("Taux d'épargne faible (moins de 10%).");
      recommendations.push("Essayez d'augmenter votre taux d'épargne à au moins 15%.");
    }
    // 2. Emergency fund (25 pts)
    const monthlyExpenses = totalExpenses;
    if (monthlyExpenses > 0) {
      const monthsOfCoverage = totalSavings / monthlyExpenses;
      if (monthsOfCoverage >= 6) {
        score += 25;
        strengths.push("Fonds d'urgence solide (plus de 6 mois de dépenses).");
      } else if (monthsOfCoverage >= 3) {
        score += 15;
        strengths.push("Fonds d'urgence en place (plus de 3 mois de dépenses).");
      } else {
        weaknesses.push("Fonds d'urgence insuffisant (moins de 3 mois de dépenses).");
        recommendations.push("Constituez un fonds d'urgence couvrant 3 à 6 mois de vos dépenses.");
      }
    } else {
      score += 25; // No expenses, so emergency fund is theoretically infinite
      strengths.push('Aucune dépense, situation financière très saine.');
    }
    // 3. Debt-to-income ratio (25 pts)
    if (totalIncome > 0) {
      const debtToIncomeRatio = totalDebts / (totalIncome * 12);
      if (debtToIncomeRatio <= 0.1) {
        score += 25;
        strengths.push('Faible endettement.');
      } else if (debtToIncomeRatio <= 0.36) {
        score += 15;
        strengths.push('Endettement maîtrisé.');
      } else {
        weaknesses.push("Ratio d'endettement élevé.");
        recommendations.push("Réduisez votre ratio d'endettement en remboursant vos dettes.");
      }
    } else if (totalDebts === 0) {
      score += 25;
      strengths.push('Aucune dette.');
    } else {
      weaknesses.push('Dettes sans revenus pour les couvrir.');
      recommendations.push('Trouvez des sources de revenus pour rembourser vos dettes.');
    }
    // 4. Net worth (20 pts)
    if (netWorth > 50000) {
      score += 20;
      strengths.push('Patrimoine net bien développé.');
    } else if (netWorth > 0) {
      score += 10;
      strengths.push('Patrimoine net positif.');
    } else {
      weaknesses.push('Patrimoine net négatif.');
      recommendations.push('Travaillez à augmenter votre patrimoine net en épargnant et investissant.');
    }
    return {
      score: Math.round(score),
      recommendations,
      strengths,
      weaknesses
    };
  };
  const runSimulation = async (params: any) => {
    const {
      years,
      incomeGrowth,
      expenseReduction,
      investmentReturn,
      inflationRate
    } = params;
    const initialIncome = calculateTotalIncome() * 12; // Annual income
    const initialExpenses = calculateTotalExpenses() * 12; // Annual expenses
    let currentNetWorth = calculateNetWorth();
    const result = {
      years: [] as number[],
      income: [] as number[],
      expenses: [] as number[],
      savings: [] as number[],
      netWorth: [] as number[]
    };
    let currentIncome = initialIncome;
    let currentExpenses = initialExpenses;
    for (let i = 0; i < years; i++) {
      const year = new Date().getFullYear() + i;
      result.years.push(year);
      // Apply growth/reduction for subsequent years
      if (i > 0) {
        currentIncome *= 1 + incomeGrowth / 100;
        currentExpenses *= 1 + inflationRate / 100 - expenseReduction / 100;
      }
      const annualSavings = currentIncome - currentExpenses;
      currentNetWorth += annualSavings;
      currentNetWorth *= 1 + investmentReturn / 100;
      result.income.push(currentIncome);
      result.expenses.push(currentExpenses);
      result.savings.push(annualSavings);
      result.netWorth.push(currentNetWorth);
    }
    return result;
  };
  // Mock functions for other finance operations
  const detectHiddenFees = async () => [];
  const getHistoricalData = async () => [];
  const getPredictions = async () => [];
  const getFinancialScore = () => 75;
  const refreshData = async () => {};
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