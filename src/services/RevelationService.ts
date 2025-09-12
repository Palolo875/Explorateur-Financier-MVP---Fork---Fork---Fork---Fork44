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
      this.qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
    } catch (error) {
      console.error('Failed to load QA pipeline:', error);
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
        return "The revelation engine is still warming up. Please try again in a moment.";
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
}

export const revelationService = RevelationService.getInstance();
