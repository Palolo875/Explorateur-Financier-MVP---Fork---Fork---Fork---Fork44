// Simplified version without tensorflow dependency
let modelLoaded = false;
// Simplified categorization without ML model
export async function categorizeTransaction(description: string, type: 'income' | 'expense' | 'saving' | 'debt', amount: number): Promise<string> {
  if (!description) {
    return 'other_' + type;
  }
  // Normalize text for simple pattern matching
  const normalizedText = description.toLowerCase().trim();
  if (type === 'income') {
    if (normalizedText.includes('salaire') || normalizedText.includes('paie')) {
      return 'salary';
    } else if (normalizedText.includes('freelance') || normalizedText.includes('client')) {
      return 'freelance';
    } else if (normalizedText.includes('dividende') || normalizedText.includes('intérêt')) {
      return 'investments';
    } else if (normalizedText.includes('loyer') || normalizedText.includes('location')) {
      return 'rental';
    } else {
      return 'other_income';
    }
  } else if (type === 'expense') {
    if (normalizedText.includes('loyer') || normalizedText.includes('hypothèque')) {
      return 'housing';
    } else if (normalizedText.includes('restaurant') || normalizedText.includes('supermarché')) {
      return 'food';
    } else if (normalizedText.includes('transport') || normalizedText.includes('essence')) {
      return 'transport';
    } else if (normalizedText.includes('facture') || normalizedText.includes('électricité')) {
      return 'utilities';
    } else {
      return 'other_expense';
    }
  } else if (type === 'saving') {
    if (normalizedText.includes('urgence')) {
      return 'emergency';
    } else if (normalizedText.includes('retraite')) {
      return 'retirement';
    } else {
      return 'savings';
    }
  } else if (type === 'debt') {
    if (normalizedText.includes('immobilier')) {
      return 'mortgage';
    } else if (normalizedText.includes('crédit')) {
      return 'credit_card';
    } else {
      return 'loan';
    }
  }
  return 'other_' + type;
}
// Simplified feedback system
export async function improveModelWithFeedback(description: string, correctCategory: string, type: 'income' | 'expense' | 'saving' | 'debt') {
  console.log('Feedback received:', {
    description,
    correctCategory,
    type
  });
  return true;
}