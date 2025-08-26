import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.module';
import fetch from 'node-fetch';

export interface CognitiveBias {
  name: string;
  type: 'spending' | 'saving' | 'planning' | 'emotional';
  description: string;
  psychologicalFact: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  category: 'spending' | 'saving' | 'goals' | 'emotional' | 'behavioral';
  severity: 'positive' | 'neutral' | 'warning' | 'critical';
  value: number;
  comparison?: {
    previous: number;
    change: number;
    period: string;
  };
  bias?: CognitiveBias;
  quote?: {
    text: string;
    author: string;
  };
  psychologicalFact?: string;
  actionable: {
    title: string;
    description: string;
    impact: string;
  };
}

export interface RevelationScore {
  overall: number;
  financialHealth: number;
  behavioralDiscipline: number;
  goalProgress: number;
  breakdown: {
    cashflow: number;
    spending_control: number;
    saving_rate: number;
    goal_achievement: number;
    bias_awareness: number;
  };
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);
  
  // Base de données des biais cognitifs
  private readonly cognitiveBiases: Record<string, CognitiveBias> = {
    status_quo: {
      name: 'Biais du statu quo',
      type: 'planning',
      description: 'Tendance à maintenir des habitudes coûteuses par inertie',
      psychologicalFact: 'Notre cerveau préfère éviter les décisions difficiles, même si elles nous coûtent de l\'argent',
      severity: 'medium',
      recommendation: 'Planifiez une révision mensuelle de vos abonnements et dépenses récurrentes'
    },
    availability_heuristic: {
      name: 'Heuristique de disponibilité',
      type: 'spending',
      description: 'Surestimation des dépenses récentes et marquantes',
      psychologicalFact: 'Nous jugeons la probabilité d\'un événement par la facilité avec laquelle nous pouvons nous en souvenir',
      severity: 'low',
      recommendation: 'Utilisez des moyennes sur 3 mois plutôt que les dernières dépenses pour budgéter'
    },
    optimism_bias: {
      name: 'Biais d\'optimisme',
      type: 'planning',
      description: 'Surestimation systématique de vos revenus futurs',
      psychologicalFact: '80% des gens pensent être au-dessus de la moyenne en matière financière',
      severity: 'high',
      recommendation: 'Basez vos objectifs sur vos performances passées, pas sur vos espoirs'
    },
    mental_accounting: {
      name: 'Comptabilité mentale',
      type: 'spending',
      description: 'Traitement différent de l\'argent selon sa source',
      psychologicalFact: 'Nous dépensons plus facilement l\'argent "bonus" que notre salaire régulier',
      severity: 'medium',
      recommendation: 'Traitez tous vos revenus de la même manière dans votre budget'
    },
    loss_aversion: {
      name: 'Aversion aux pertes',
      type: 'emotional',
      description: 'Peur excessive de perdre de l\'argent qui bloque les investissements',
      psychologicalFact: 'La douleur de perdre 100€ est 2x plus intense que le plaisir d\'en gagner 100€',
      severity: 'medium',
      recommendation: 'Concentrez-vous sur les gains à long terme plutôt que les pertes à court terme'
    },
    present_bias: {
      name: 'Biais du présent',
      type: 'saving',
      description: 'Préférence excessive pour les récompenses immédiates',
      psychologicalFact: 'Notre cerveau évalue les récompenses futures 50% moins que les récompenses immédiates',
      severity: 'high',
      recommendation: 'Automatisez vos épargnes pour contourner la tentation de dépenser'
    }
  };

  constructor(private prisma: PrismaService) {}

  async generateSmartInsights(userId: string): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    
    // Récupérer les données utilisateur
    const [transactions, goals, emotions] = await Promise.all([
      this.getRecentTransactions(userId),
      this.getUserGoals(userId),
      this.getRecentEmotions(userId)
    ]);

    // Générer les insights
    insights.push(...await this.analyzeSpendingPatterns(transactions));
    insights.push(...await this.analyzeGoalProgress(goals, transactions));
    insights.push(...await this.detectCognitiveBiases(transactions, goals));
    insights.push(...await this.analyzeEmotionalSpending(transactions, emotions));

    // Ajouter des citations et faits psychologiques
    for (const insight of insights) {
      if (Math.random() > 0.5) { // 50% de chance d'avoir une citation
        insight.quote = await this.getRelevantQuote(insight.category);
      }
    }

    return insights.sort((a, b) => {
      const severityOrder = { critical: 4, warning: 3, neutral: 2, positive: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  async calculateRevelationScore(userId: string): Promise<RevelationScore> {
    const [transactions, goals, emotions] = await Promise.all([
      this.getRecentTransactions(userId, 90), // 3 mois
      this.getUserGoals(userId),
      this.getRecentEmotions(userId, 30) // 1 mois
    ]);

    // Calculer les sous-scores
    const cashflow = this.calculateCashflowScore(transactions);
    const spending_control = this.calculateSpendingControlScore(transactions);
    const saving_rate = this.calculateSavingRateScore(transactions);
    const goal_achievement = this.calculateGoalAchievementScore(goals);
    const bias_awareness = await this.calculateBiasAwarenessScore(transactions, goals);

    const breakdown = {
      cashflow,
      spending_control,
      saving_rate,
      goal_achievement,
      bias_awareness
    };

    // Score composite
    const financialHealth = Math.round((cashflow + saving_rate) / 2);
    const behavioralDiscipline = Math.round((spending_control + bias_awareness) / 2);
    const goalProgress = goal_achievement;
    const overall = Math.round((financialHealth + behavioralDiscipline + goalProgress) / 3);

    return {
      overall,
      financialHealth,
      behavioralDiscipline,
      goalProgress,
      breakdown
    };
  }

  private async analyzeSpendingPatterns(transactions: any[]): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    
    if (transactions.length === 0) return insights;

    // Analyser les tendances par catégorie
    const categorySpending = this.groupTransactionsByCategory(transactions);
    const previousPeriodTransactions = transactions.filter(t => 
      new Date(t.date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const currentPeriodTransactions = transactions.filter(t => 
      new Date(t.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    for (const [category, amount] of Object.entries(categorySpending)) {
      const previousAmount = this.getCategoryAmount(previousPeriodTransactions, category);
      const change = previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : 0;

      if (Math.abs(change) > 15) { // Changement significatif
        const insight: SmartInsight = {
          id: `spending-${category}`,
          title: `${change > 0 ? 'Augmentation' : 'Réduction'} des dépenses en ${category}`,
          description: `${change > 0 ? '+' : ''}${change.toFixed(1)}% par rapport au mois dernier`,
          category: 'spending',
          severity: change > 25 ? 'warning' : change < -15 ? 'positive' : 'neutral',
          value: amount,
          comparison: {
            previous: previousAmount,
            change: change,
            period: 'mois dernier'
          },
          psychologicalFact: change > 0 
            ? 'Les dépenses impulsives augmentent de 40% quand nous sommes stressés'
            : 'Réduire une catégorie de dépenses améliore le contrôle sur toutes les autres',
          actionable: {
            title: change > 0 ? 'Analyser les déclencheurs' : 'Maintenir cette discipline',
            description: change > 0 
              ? `Identifiez ce qui a causé cette augmentation de ${change.toFixed(1)}% en ${category}`
              : `Votre réduction de ${Math.abs(change).toFixed(1)}% en ${category} est excellente`,
            impact: change > 0 
              ? `Économie potentielle: ${(amount * 0.2).toFixed(0)}€/mois`
              : `Économie réalisée: ${(previousAmount - amount).toFixed(0)}€`
          }
        };

        insights.push(insight);
      }
    }

    return insights;
  }

  private async detectCognitiveBiases(transactions: any[], goals: any[]): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    
    // Détecter le biais du statu quo (abonnements non utilisés)
    const subscriptions = transactions.filter(t => 
      t.description?.toLowerCase().includes('abonnement') || 
      t.category?.toLowerCase().includes('abonnement')
    );
    
    if (subscriptions.length > 3) {
      insights.push({
        id: 'bias-status-quo',
        title: 'Biais du statu quo détecté',
        description: `${subscriptions.length} abonnements actifs - certains sont peut-être inutilisés`,
        category: 'behavioral',
        severity: 'warning',
        value: subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
        bias: this.cognitiveBiases.status_quo,
        actionable: {
          title: 'Audit des abonnements',
          description: 'Révisez vos abonnements et résiliez ceux non utilisés',
          impact: `Économie potentielle: ${(subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0) * 0.3).toFixed(0)}€/mois`
        }
      });
    }

    // Détecter le biais d'optimisme (objectifs irréalistes)
    const unrealisticGoals = goals.filter(goal => {
      const monthsToDeadline = goal.deadline ? 
        (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30) : 12;
      const requiredMonthlySaving = (goal.targetAmount - goal.currentAmount) / monthsToDeadline;
      const averageIncome = this.calculateAverageIncome(transactions);
      return requiredMonthlySaving > (averageIncome * 0.3); // Plus de 30% du revenu
    });

    if (unrealisticGoals.length > 0) {
      insights.push({
        id: 'bias-optimism',
        title: 'Biais d\'optimisme dans vos objectifs',
        description: `${unrealisticGoals.length} objectifs nécessitent plus de 30% de vos revenus`,
        category: 'behavioral',
        severity: 'warning',
        value: unrealisticGoals.length,
        bias: this.cognitiveBiases.optimism_bias,
        actionable: {
          title: 'Réévaluer les objectifs',
          description: 'Ajustez vos objectifs pour qu\'ils soient plus réalistes et atteignables',
          impact: 'Taux de réussite +65% avec des objectifs réalistes'
        }
      });
    }

    return insights;
  }

  private async getRelevantQuote(category: string): Promise<{ text: string; author: string } | undefined> {
    try {
      // Utiliser ZenQuotes API (gratuite)
      const response = await fetch('https://zenquotes.io/api/random');
      const data = await response.json() as any[];
      
      if (data && data[0]) {
        return {
          text: data[0].q,
          author: data[0].a
        };
      }
    } catch (error) {
      this.logger.warn('Failed to fetch quote from ZenQuotes API');
    }

    // Fallback avec des citations financières locales
    const financialQuotes = {
      spending: [
        { text: "Ce n'est pas combien vous gagnez, mais combien vous économisez qui détermine votre richesse.", author: "Benjamin Franklin" },
        { text: "Un sou économisé vaut deux sous gagnés.", author: "Proverbe" }
      ],
      saving: [
        { text: "Ne sauvez pas ce qui reste après avoir dépensé, mais dépensez ce qui reste après avoir sauvé.", author: "Warren Buffett" },
        { text: "La richesse consiste davantage à ne pas vouloir qu'à avoir.", author: "Épictète" }
      ],
      goals: [
        { text: "Un objectif sans plan n'est qu'un souhait.", author: "Antoine de Saint-Exupéry" },
        { text: "Le succès, c'est se fixer des objectifs et les atteindre.", author: "Zig Ziglar" }
      ]
    };

    const categoryQuotes = financialQuotes[category] || financialQuotes.spending;
    return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
  }

  // Méthodes utilitaires
  private async getRecentTransactions(userId: string, days = 60) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  private async getUserGoals(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId, status: 'active' }
    });
  }

  private async getRecentEmotions(userId: string, days = 30) {
    return this.prisma.emotion.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  private groupTransactionsByCategory(transactions: any[]) {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Autre';
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});
  }

  private getCategoryAmount(transactions: any[], category: string) {
    return transactions
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  private calculateAverageIncome(transactions: any[]) {
    const incomes = transactions.filter(t => t.amount > 0);
    return incomes.length > 0 ? incomes.reduce((sum, t) => sum + t.amount, 0) / incomes.length : 0;
  }

  private calculateCashflowScore(transactions: any[]): number {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const ratio = income > 0 ? (income - expenses) / income : 0;
    return Math.max(0, Math.min(100, Math.round(ratio * 100 + 50)));
  }

  private calculateSpendingControlScore(transactions: any[]): number {
    // Calculer la régularité des dépenses (moins de variance = meilleur score)
    const monthlyExpenses = this.getMonthlyExpenses(transactions);
    if (monthlyExpenses.length < 2) return 50;
    
    const average = monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length;
    const variance = monthlyExpenses.reduce((sum, expense) => sum + Math.pow(expense - average, 2), 0) / monthlyExpenses.length;
    const coefficient = variance > 0 ? Math.sqrt(variance) / average : 0;
    
    return Math.max(0, Math.min(100, Math.round(100 - coefficient * 100)));
  }

  private calculateSavingRateScore(transactions: any[]): number {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingRate = income > 0 ? (income - expenses) / income : 0;
    return Math.max(0, Math.min(100, Math.round(savingRate * 100)));
  }

  private calculateGoalAchievementScore(goals: any[]): number {
    if (goals.length === 0) return 50;
    
    const progressScores = goals.map(goal => {
      const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
      return Math.min(100, progress * 100);
    });
    
    return Math.round(progressScores.reduce((a, b) => a + b, 0) / progressScores.length);
  }

  private async calculateBiasAwarenessScore(transactions: any[], goals: any[]): number {
    const biases = await this.detectCognitiveBiases(transactions, goals);
    const severityPenalty = biases.reduce((penalty, bias) => {
      switch (bias.severity) {
        case 'critical': return penalty + 30;
        case 'warning': return penalty + 20;
        case 'neutral': return penalty + 10;
        default: return penalty;
      }
    }, 0);
    
    return Math.max(0, 100 - severityPenalty);
  }

  private getMonthlyExpenses(transactions: any[]): number[] {
    const monthlyData = {};
    transactions.filter(t => t.amount < 0).forEach(transaction => {
      const month = new Date(transaction.date).toISOString().substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + Math.abs(transaction.amount);
    });
    return Object.values(monthlyData);
  }

  private async analyzeGoalProgress(goals: any[], transactions: any[]): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    
    for (const goal of goals) {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const monthsToDeadline = goal.deadline ? 
        Math.max(1, (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)) : 12;
      const requiredMonthlySaving = (goal.targetAmount - goal.currentAmount) / monthsToDeadline;
      
      let severity: 'positive' | 'neutral' | 'warning' | 'critical' = 'neutral';
      let description = `${progress.toFixed(1)}% atteint`;
      
      if (progress >= 80) {
        severity = 'positive';
        description += ' - Excellent progrès !';
      } else if (requiredMonthlySaving > this.calculateAverageIncome(transactions) * 0.3) {
        severity = 'warning';
        description += ' - Rythme à accélérer';
      }

      insights.push({
        id: `goal-${goal.id}`,
        title: goal.title,
        description,
        category: 'goals',
        severity,
        value: progress,
        psychologicalFact: progress > 50 
          ? 'Les personnes qui atteignent 50% de leurs objectifs ont 90% de chances de les terminer'
          : 'Visualiser quotidiennement ses objectifs augmente les chances de réussite de 42%',
        actionable: {
          title: progress > 80 ? 'Finaliser l\'objectif' : 'Accélérer le progrès',
          description: `Il vous faut ${requiredMonthlySaving.toFixed(0)}€/mois pour atteindre cet objectif`,
          impact: `${monthsToDeadline.toFixed(0)} mois restants`
        }
      });
    }
    
    return insights;
  }

  private async analyzeEmotionalSpending(transactions: any[], emotions: any[]): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    
    if (emotions.length === 0) return insights;

    // Analyser la corrélation entre humeur et dépenses
    const stressfulDays = emotions.filter(e => ['stressed', 'anxious', 'sad'].includes(e.mood.toLowerCase()));
    const happyDays = emotions.filter(e => ['happy', 'excited', 'optimistic'].includes(e.mood.toLowerCase()));
    
    const stressSpending = this.calculateSpendingOnDays(transactions, stressfulDays.map(e => e.date));
    const happySpending = this.calculateSpendingOnDays(transactions, happyDays.map(e => e.date));
    
    if (stressSpending > happySpending * 1.3) {
      insights.push({
        id: 'emotional-stress-spending',
        title: 'Dépenses émotionnelles détectées',
        description: `+${((stressSpending / happySpending - 1) * 100).toFixed(0)}% de dépenses les jours de stress`,
        category: 'emotional',
        severity: 'warning',
        value: stressSpending - happySpending,
        psychologicalFact: 'Le stress augmente les achats impulsifs de 79% en moyenne',
        actionable: {
          title: 'Stratégie anti-stress',
          description: 'Identifiez des alternatives aux achats quand vous êtes stressé',
          impact: `Économie potentielle: ${(stressSpending * 0.3).toFixed(0)}€/mois`
        }
      });
    }

    return insights;
  }

  private calculateSpendingOnDays(transactions: any[], dates: Date[]): number {
    const dateStrings = dates.map(d => new Date(d).toDateString());
    return transactions
      .filter(t => t.amount < 0 && dateStrings.includes(new Date(t.date).toDateString()))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }
}