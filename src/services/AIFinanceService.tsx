import React from 'react';
import { FinancialItem, FinancialInsight, SimulationParams, SimulationResult } from '../types/finance';
import { fetchInflationData, fetchInterestRates } from './economy';
import { fetchStockData, fetchCryptoData } from './markets';
import { fetchTransactions } from './banking';
import { predictCashflow } from './ml';
import { categorizeTransaction } from '../utils/aiCategorization';
import { runSimulation as runFinancialSimulation } from '../utils/financialCalculations';

// Modèle de scoring IA pour l'analyse financière
interface AIModelParams {
  financialData: any;
  emotionalContext?: any;
  marketConditions?: any;
}
export class AIFinanceService {
  private static instance: AIFinanceService;
  private isInitialized: boolean = false;
  private modelLoaded: boolean = false;
  private lastUpdate: Date = new Date();
  // Singleton pattern
  public static getInstance(): AIFinanceService {
    if (!AIFinanceService.instance) {
      AIFinanceService.instance = new AIFinanceService();
    }
    return AIFinanceService.instance;
  }
  // Initialiser le service IA
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      // Simulation du chargement d'un modèle IA
      await new Promise(resolve => setTimeout(resolve, 500));
      this.modelLoaded = true;
      this.isInitialized = true;
      console.log('Service IA initialisé avec succès');
      return true;
    } catch (error) {
      console.error("Erreur lors de l'initialisation du service IA:", error);
      return false;
    }
  }
  // Analyser les données financières en temps réel
  public async analyzeFinancialHealth(params: AIModelParams): Promise<{
    score: number;
    status: string;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  }> {
    if (!this.isInitialized) await this.initialize();
    const {
      financialData,
      emotionalContext
    } = params;
    // Calculer le score financier avec un algorithme avancé
    let score = 50; // Score par défaut
    const recommendations: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    // Calculer les totaux
    const totalIncome = this.calculateTotalValue(financialData.incomes || []);
    const totalExpenses = this.calculateTotalValue(financialData.expenses || []);
    const totalSavings = this.calculateTotalValue(financialData.savings || []);
    const totalInvestments = this.calculateTotalValue(financialData.investments || []);
    const totalDebts = this.calculateTotalValue(financialData.debts || []);
    // Calculer le score en fonction de plusieurs facteurs
    const balance = totalIncome - totalExpenses;
    const savingsRatio = totalIncome > 0 ? totalSavings / totalIncome * 100 : 0;
    const debtToIncomeRatio = totalIncome > 0 ? totalDebts / totalIncome * 100 : 0;
    // Ajuster le score en fonction des ratios financiers
    if (balance > 0) score += 10;
    if (balance < 0) score -= 15;
    if (savingsRatio > 20) score += 15;
    if (savingsRatio < 10) score -= 10;
    if (debtToIncomeRatio < 30) score += 10;
    if (debtToIncomeRatio > 50) score -= 15;
    // Ajuster le score en fonction du contexte émotionnel
    if (emotionalContext) {
      if (emotionalContext.mood > 7) score -= 5; // Stress élevé
      if (emotionalContext.mood < 4) score += 5; // Faible stress
    }
    // Limiter le score entre 0 et 100
    score = Math.max(0, Math.min(100, score));

    // Ajout de la prédiction de cashflow au score
    const transactions = await fetchTransactions();
    const cashflowPrediction = predictCashflow(transactions.map(t => ({ date: t.date, amount: t.amount })));
    if (cashflowPrediction < 0) {
      score -= 10;
      weaknesses.push('Prévision de cashflow négative');
    }

    // Ajout des taux d'intérêt au score
    const interestRates = await fetchInterestRates();
    if (interestRates.length > 0 && interestRates[0].value > 5) {
      score -= 5;
      weaknesses.push('Taux d\'intérêt élevés');
    }


    // Définir le statut en fonction du score
    let status = 'Critique';
    if (score >= 80) status = 'Excellente';else if (score >= 60) status = 'Bonne';else if (score >= 40) status = 'Moyenne';else if (score >= 20) status = 'Faible';
    // Générer des recommandations personnalisées
    if (balance < 0) {
      recommendations.push('Réduisez vos dépenses non essentielles pour équilibrer votre budget');
      weaknesses.push('Balance mensuelle négative');
    } else {
      strengths.push('Balance mensuelle positive');
    }
    if (savingsRatio < 15) {
      recommendations.push("Essayez d'épargner au moins 15% de vos revenus");
      weaknesses.push("Taux d'épargne insuffisant");
    } else {
      strengths.push("Bon taux d'épargne");
    }
    if (debtToIncomeRatio > 40) {
      recommendations.push('Concentrez-vous sur le remboursement de vos dettes');
      weaknesses.push('Ratio dette/revenu élevé');
    } else if (totalDebts > 0) {
      strengths.push("Niveau d'endettement maîtrisé");
    }
    if (totalInvestments === 0 && totalIncome > 0) {
      recommendations.push("Envisagez d'investir une partie de votre épargne");
      weaknesses.push("Absence d'investissements");
    } else if (totalInvestments > 0) {
      strengths.push("Présence d'investissements");
    }
    this.lastUpdate = new Date();
    return {
      score,
      status,
      recommendations,
      strengths,
      weaknesses
    };
  }
  // Générer des insights financiers personnalisés
  public async generateInsights(financialData: any): Promise<FinancialInsight[]> {
    if (!this.isInitialized) await this.initialize();
    const insights: FinancialInsight[] = [];
    const totalIncome = this.calculateTotalValue(financialData.incomes || []);
    const totalExpenses = this.calculateTotalValue(financialData.expenses || []);
    // Analyser les dépenses par catégorie
    const expensesByCategory = this.groupByCategory(financialData.expenses || []);
    const topExpenses = Object.entries(expensesByCategory).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3);
    // Insight sur le ratio dépenses/revenus
    if (totalIncome > 0) {
      const expenseRatio = totalExpenses / totalIncome * 100;
      if (expenseRatio > 90) {
        insights.push({
          id: 'expense-ratio-high',
          title: 'Dépenses trop proches des revenus',
          description: `Vos dépenses représentent ${expenseRatio.toFixed(0)}% de vos revenus, ce qui laisse peu de marge pour l'épargne.`,
          category: 'expense',
          impact: 'high',
          action: "Essayez de réduire vos dépenses d'au moins 15%",
          potentialSavings: totalExpenses * 0.15
        });
      } else if (expenseRatio < 60) {
        insights.push({
          id: 'expense-ratio-good',
          title: 'Excellent ratio dépenses/revenus',
          description: `Vos dépenses représentent seulement ${expenseRatio.toFixed(0)}% de vos revenus, ce qui est très bon.`,
          category: 'expense',
          impact: 'low',
          action: "Envisagez d'investir votre surplus d'épargne"
        });
      }
    }
    // Insight sur les principales dépenses
    if (topExpenses.length > 0) {
      const [topCategory, topAmount] = topExpenses[0];
      const percentage = totalExpenses > 0 ? (topAmount as number) / totalExpenses * 100 : 0;
      if (percentage > 30) {
        insights.push({
          id: 'top-expense-category',
          title: `${topCategory} : poste de dépense majeur`,
          description: `${topCategory} représente ${percentage.toFixed(0)}% de vos dépenses totales.`,
          category: 'expense',
          impact: 'medium',
          action: `Analysez vos dépenses en ${topCategory.toString().toLowerCase()} pour identifier des économies potentielles`,
          potentialSavings: (topAmount as number) * 0.1
        });
      }
    }
    // Insight sur l'épargne
    const totalSavings = this.calculateTotalValue(financialData.savings || []);
    if (totalIncome > 0 && totalSavings > 0) {
      const savingsRatio = totalSavings / totalIncome * 100;
      if (savingsRatio < 10) {
        insights.push({
          id: 'savings-ratio-low',
          title: "Taux d'épargne insuffisant",
          description: `Votre taux d'épargne est de ${savingsRatio.toFixed(1)}%, ce qui est inférieur au minimum recommandé de 10%.`,
          category: 'savings',
          impact: 'high',
          action: 'Augmentez votre épargne à au moins 10% de vos revenus'
        });
      } else if (savingsRatio > 25) {
        insights.push({
          id: 'savings-ratio-high',
          title: "Excellent taux d'épargne",
          description: `Votre taux d'épargne est de ${savingsRatio.toFixed(1)}%, ce qui est très bon.`,
          category: 'savings',
          impact: 'low',
          action: 'Envisagez de diversifier votre épargne dans différents placements'
        });
      }
    }
    // Insight sur les investissements
    const totalInvestments = this.calculateTotalValue(financialData.investments || []);
    if (totalSavings > 0 && totalInvestments === 0) {
      insights.push({
        id: 'no-investments',
        title: "Absence d'investissements",
        description: "Vous avez de l'épargne mais aucun investissement, ce qui limite votre potentiel de croissance financière.",
        category: 'investment',
        impact: 'medium',
        action: "Envisagez d'investir une partie de votre épargne pour générer des rendements"
      });
    }
    // Insight sur les dettes
    const totalDebts = this.calculateTotalValue(financialData.debts || []);
    if (totalDebts > 0 && totalIncome > 0) {
      const debtToIncomeRatio = totalDebts / totalIncome * 100;
      if (debtToIncomeRatio > 40) {
        insights.push({
          id: 'high-debt-ratio',
          title: "Niveau d'endettement élevé",
          description: `Votre ratio dette/revenu est de ${debtToIncomeRatio.toFixed(0)}%, ce qui est considéré comme élevé.`,
          category: 'debts',
          impact: 'high',
          action: "Priorisez le remboursement des dettes à taux d'intérêt élevé"
        });
      }
    }

    // Cashflow prediction insight
    const transactions = await fetchTransactions();
    const cashflowPrediction = predictCashflow(transactions.map(t => ({ date: t.date, amount: t.amount })));
    if (cashflowPrediction < 0) {
      insights.push({
        id: 'cashflow-prediction-negative',
        title: 'Prévision de cashflow négative',
        description: `Notre modèle prédit un cashflow négatif de ${cashflowPrediction.toFixed(2)} pour le mois prochain.`,
        category: 'cashflow',
        impact: 'high',
        action: 'Analysez vos dépenses et revenus pour éviter un solde négatif.'
      });
    }


    this.lastUpdate = new Date();
    return insights;
  }
  // Exécuter des simulations financières avancées
  public async runSimulation(params: SimulationParams): Promise<SimulationResult> {
    if (!this.isInitialized) await this.initialize();

    const inflationData = await fetchInflationData();
    const inflationRate = inflationData.length > 0 ? inflationData[0].value : 2;

    const simulationResult = runFinancialSimulation(
      {
        incomes: params.incomes,
        expenses: params.expenses,
        savings: params.savings,
        investments: params.investments,
        debts: params.debts,
      },
      {
        ...params,
        inflationRate,
      }
    );

    this.lastUpdate = new Date();
    return simulationResult;
  }
  // Détecter les frais cachés et optimisations potentielles
  public async detectHiddenFees(financialData: any): Promise<{
    totalAmount: number;
    items: Array<{
      category: string;
      amount: number;
      description: string;
    }>;
  }> {
    if (!this.isInitialized) await this.initialize();

    const transactions = await fetchTransactions();
    const hiddenFees: Array<{
      category: string;
      amount: number;
      description: string;
    }> = [];
    let totalAmount = 0;

    for (const transaction of transactions) {
      const category = await categorizeTransaction(transaction.name, 'expense', transaction.amount);
      if (category === 'utilities' || category === 'transport' || category === 'other_expense') {
        hiddenFees.push({
          category: 'Frais cachés potentiels',
          amount: transaction.amount,
          description: transaction.name,
        });
        totalAmount += transaction.amount;
      }
    }

    this.lastUpdate = new Date();
    return {
      totalAmount,
      items: hiddenFees
    };
  }
  // Méthodes utilitaires
  private calculateTotalValue(items: FinancialItem[]): number {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      if (!item) return sum;
      const value = typeof item.value === 'number' ? item.value : parseFloat(String(item.value)) || 0;
      return sum + value;
    }, 0);
  }
  private groupByCategory(items: FinancialItem[]): Record<string, number> {
    if (!items || !Array.isArray(items)) return {};
    return items.reduce((acc, item) => {
      if (!item) return acc;
      const category = item.category || 'Non catégorisé';
      const value = typeof item.value === 'number' ? item.value : parseFloat(String(item.value)) || 0;
      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {} as Record<string, number>);
  }
}
export const aiFinanceService = AIFinanceService.getInstance();