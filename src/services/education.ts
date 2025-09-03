import { toast } from 'react-hot-toast';

// Service for fetching educational content.
export const USE_MOCK_DATA = true;

export interface EducationResource {
  key: string;
  title: string;
  author_name: string[];
  first_publish_year: number;
}

export async function fetchEducationContent(query = 'personal finance'): Promise<EducationResource[]> {
  if (USE_MOCK_DATA) {
    return [
      { key: '1', title: 'The Intelligent Investor', author_name: ['Benjamin Graham'], first_publish_year: 1949 },
      { key: '2', title: 'A Random Walk Down Wall Street', author_name: ['Burton Malkiel'], first_publish_year: 1973 },
      { key: '3', title: 'The Simple Path to Wealth', author_name: ['JL Collins'], first_publish_year: 2016 },
      { key: '4', title: 'I Will Teach You to Be Rich', author_name: ['Ramit Sethi'], first_publish_year: 2009 },
    ];
  }

  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch education content: ${response.statusText}`);
    }
    const data = await response.json();
    return data.docs.map((doc: any) => ({
      key: doc.key,
      title: doc.title,
      author_name: doc.author_name,
      first_publish_year: doc.first_publish_year,
    }));
  } catch (error) {
    console.error('Error fetching education content:', error);
    toast.error('Erreur lors de la récupération du contenu éducatif.');
    return [];
  }
}
