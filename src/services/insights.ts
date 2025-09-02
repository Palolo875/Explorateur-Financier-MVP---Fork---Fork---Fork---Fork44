import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

export async function fetchZenQuote(): Promise<string> {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    if (!response.ok) {
      throw new Error('Failed to fetch ZenQuote');
    }
    const data = await response.json();
    return `"${data[0].q}" - ${data[0].a}`;
  } catch (error) {
    console.error('Error fetching ZenQuote:', error);
    return fetchQuotableQuote(); // Fallback to Quotable
  }
}

export async function fetchQuotableQuote(): Promise<string> {
  try {
    const response = await fetch('https://api.quotable.io/random');
    if (!response.ok) {
      throw new Error('Failed to fetch Quotable quote');
    }
    const data = await response.json();
    return `"${data.content}" - ${data.author}`;
  } catch (error) {
    console.error('Error fetching Quotable quote:', error);
    toast.error('Erreur lors de la récupération de la citation.');
    return 'The best way to predict the future is to create it.';
  }
}

export async function fetchNumberTrivia(): Promise<string> {
  try {
    const response = await fetch('http://numbersapi.com/random/trivia');
    if (!response.ok) {
      throw new Error('Failed to fetch number trivia');
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching number trivia:', error);
    return '';
  }
}

export const saveAnonymousInsight = async (userId: string, insightData: any) => {
  const { data, error } = await supabase
    .from('financial_insights')
    .insert([
      {
        user_id: userId,
        insight: insightData,
      }
    ])
    .select();

  if (error) {
    console.error('Error saving insight:', error);
    toast.error('Erreur lors de la sauvegarde des données.');
    return null;
  }

  toast.success('Données sauvegardées avec succès !');
  return data;
};
