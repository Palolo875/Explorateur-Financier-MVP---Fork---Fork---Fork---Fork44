import { pipeline, QuestionAnsweringPipeline } from '@xenova/transformers';

// Define the structure for financial data that will be provided as context
export interface FinancialContext {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  netWorth: number;
  topExpenses: { category: string; amount: number }[];
  goals: { name: string; target: number; current: number }[];
}

class RevelationService {
  private static instance: RevelationService;
  private qaPipeline: QuestionAnsweringPipeline | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): RevelationService {
    if (!RevelationService.instance) {
      RevelationService.instance = new RevelationService();
    }
    return RevelationService.instance;
  }

  private async init() {
    try {
      // Load a question-answering model.
      // Using a distilled version for smaller size and faster inference.
      // Disable model loading in development to avoid network issues
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('RevelationService: Model loading disabled in development environment');
        this.qaPipeline = null;
        return;
      }
      
      this.qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
    } catch (error) {
      console.error('Failed to load QA pipeline:', error);
      this.qaPipeline = null;
    }
  }

  private formatContext(context: FinancialContext): string {
    // Convert the structured financial data into a natural language string.
    // This string will be the "context" in which the model searches for an answer.
    const topExpensesStr = context.topExpenses
      .map(e => `${e.category} at ${e.amount} euros`)
      .join(', ');

    const goalsStr = context.goals
      .map(g => `${g.name} (at ${g.current} of ${g.target} euros)`)
      .join(', ');

    return `
      User's financial summary:
      Total monthly income is ${context.totalIncome} euros.
      Total monthly expenses are ${context.totalExpenses} euros.
      The savings rate is ${context.savingsRate.toFixed(2)}%.
      The current net worth is ${context.netWorth} euros.
      The highest spending categories are: ${topExpensesStr || 'none'}.
      Current financial goals are: ${goalsStr || 'none'}.
    `;
  }

  public async getRevelation(question: string, financialContext: FinancialContext): Promise<string> {
    if (!this.qaPipeline) {
      await this.init(); // Ensure pipeline is loaded
      if (!this.qaPipeline) {
        // Fallback response when model is not available
        return this.generateFallbackRevelation(question, financialContext);
      }
    }

    const context = this.formatContext(financialContext);

    try {
      const result = await this.qaPipeline(question, context);
      if (result && result.score > 0.1) { // Filter out low-confidence answers
        return result.answer;
      }
      return "I couldn't find a specific answer in your financial data. Could you try rephrasing your question?";
    } catch (error) {
      console.error('Error during question answering:', error);
      return "I encountered an error while analyzing your question. Please try again.";
    }
  }

  private generateFallbackRevelation(question: string, financialContext: FinancialContext): string {
    // Generate a basic financial analysis without AI model
    const { totalIncome, totalExpenses, savingsRate, netWorth } = financialContext;
    const balance = totalIncome - totalExpenses;
    
    let response = `Basé sur votre situation financière actuelle:\n\n`;
    
    if (balance > 0) {
      response += `✅ Votre balance mensuelle est positive (${balance.toLocaleString('fr-FR')}€), ce qui est excellent.\n`;
    } else {
      response += `⚠️ Votre balance mensuelle est négative (${balance.toLocaleString('fr-FR')}€), il faut réduire vos dépenses.\n`;
    }
    
    if (savingsRate >= 20) {
      response += `✅ Votre taux d'épargne de ${savingsRate.toFixed(1)}% est excellent.\n`;
    } else if (savingsRate >= 10) {
      response += `📊 Votre taux d'épargne de ${savingsRate.toFixed(1)}% est correct mais peut être amélioré.\n`;
    } else {
      response += `⚠️ Votre taux d'épargne de ${savingsRate.toFixed(1)}% est insuffisant. Visez au moins 10%.\n`;
    }
    
    if (netWorth > 0) {
      response += `💰 Votre patrimoine net de ${netWorth.toLocaleString('fr-FR')}€ est positif.\n`;
    }
    
    response += `\nRecommandations personnalisées basées sur votre question: "${question}"`;
    
    return response;
  }
}

export const revelationService = RevelationService.getInstance();
