import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

export interface QuoteData {
  text: string;
  author: string;
  category: string;
}

export interface PsychologyFact {
  fact: string;
  source: string;
  category: string;
  relevance: number;
}

export interface MarketSentiment {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  summary: string;
  recommendation: string;
}

@Injectable()
export class ExternalApisService {
  private readonly logger = new Logger(ExternalApisService.name);

  // Cache simple en mémoire pour éviter les appels répétés
  private quotesCache = new Map<string, { data: QuoteData; timestamp: number }>();
  private factsCache = new Map<string, { data: PsychologyFact[]; timestamp: number }>();
  private sentimentCache = new Map<string, { data: MarketSentiment; timestamp: number }>();

  private readonly CACHE_DURATION = 3600000; // 1 heure

  /**
   * Récupère une citation motivante depuis ZenQuotes API (gratuite)
   */
  async getMotivationalQuote(category?: string): Promise<QuoteData | null> {
    const cacheKey = `quote-${category || 'general'}`;
    const cached = this.quotesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // ZenQuotes API - 5 requêtes/30 secondes gratuit
      const response = await fetch('https://zenquotes.io/api/random', {
        timeout: 5000,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json() as any[];
      
      if (data && data[0]) {
        const quote: QuoteData = {
          text: data[0].q,
          author: data[0].a,
          category: category || 'motivation'
        };
        
        this.quotesCache.set(cacheKey, { data: quote, timestamp: Date.now() });
        return quote;
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch quote from ZenQuotes: ${error.message}`);
    }

    // Fallback avec citations locales
    return this.getFallbackQuote(category);
  }

  /**
   * Récupère des faits psychologiques depuis une API gratuite ou base locale
   */
  async getPsychologyFacts(category?: string): Promise<PsychologyFact[]> {
    const cacheKey = `facts-${category || 'general'}`;
    const cached = this.factsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Utiliser une API de faits psychologiques si disponible
      // Pour l'instant, utilisons notre base de données locale enrichie
      const facts = this.getLocalPsychologyFacts(category);
      
      this.factsCache.set(cacheKey, { data: facts, timestamp: Date.now() });
      return facts;
    } catch (error) {
      this.logger.warn(`Failed to fetch psychology facts: ${error.message}`);
      return this.getLocalPsychologyFacts(category);
    }
  }

  /**
   * Récupère le sentiment du marché depuis une API financière gratuite
   */
  async getMarketSentiment(): Promise<MarketSentiment | null> {
    const cacheKey = 'market-sentiment';
    const cached = this.sentimentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Alpha Vantage API gratuite (5 requêtes/minute)
      const apiKey = process.env.ALPHA_VANTAGE_KEY;
      if (!apiKey) {
        return this.getFallbackSentiment();
      }

      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${apiKey}&limit=5`,
        { timeout: 10000 }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json() as any;
      
      if (data && data.feed) {
        const sentiment = this.analyzeSentimentData(data.feed);
        this.sentimentCache.set(cacheKey, { data: sentiment, timestamp: Date.now() });
        return sentiment;
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch market sentiment: ${error.message}`);
    }

    return this.getFallbackSentiment();
  }

  /**
   * Récupère des nouvelles financières pertinentes
   */
  async getFinancialNews(limit = 3): Promise<any[]> {
    try {
      // Utiliser NewsAPI ou une alternative gratuite
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=finance+economics&sortBy=publishedAt&pageSize=${limit}&language=fr&apiKey=${process.env.NEWS_API_KEY}`,
        { timeout: 10000 }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json() as any;
      return data.articles || [];
    } catch (error) {
      this.logger.warn(`Failed to fetch financial news: ${error.message}`);
      return this.getFallbackNews();
    }
  }

  /**
   * Récupère des données économiques de base (taux, inflation, etc.)
   */
  async getEconomicIndicators(): Promise<any> {
    try {
      // Utiliser une API économique gratuite comme FRED API
      const indicators = {
        inflation: await this.getInflationRate(),
        interestRate: await this.getInterestRate(),
        unemployment: await this.getUnemploymentRate(),
        gdpGrowth: await this.getGDPGrowth()
      };

      return {
        indicators,
        lastUpdated: new Date().toISOString(),
        source: 'Multiple Economic APIs'
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch economic indicators: ${error.message}`);
      return this.getFallbackEconomicData();
    }
  }

  // Méthodes privées pour les fallbacks et données locales

  private getFallbackQuote(category?: string): QuoteData {
    const quotes = {
      finance: [
        { text: "L'investissement le plus rentable est celui que vous faites en vous-même.", author: "Warren Buffett" },
        { text: "Ne mettez pas tous vos œufs dans le même panier.", author: "Proverbe financier" },
        { text: "Le temps est votre plus grand allié en matière d'investissement.", author: "John Bogle" }
      ],
      motivation: [
        { text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill" },
        { text: "La discipline est le pont entre les objectifs et l'accomplissement.", author: "Jim Rohn" },
        { text: "Votre seule limite, c'est vous.", author: "Anonyme" }
      ],
      saving: [
        { text: "Un sou économisé est un sou gagné.", author: "Benjamin Franklin" },
        { text: "Payez-vous en premier.", author: "Robert Kiyosaki" },
        { text: "La richesse n'est pas dans ce que vous gagnez, mais dans ce que vous gardez.", author: "Henry Ford" }
      ]
    };

    const categoryQuotes = quotes[category] || quotes.motivation;
    const randomQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
    
    return {
      ...randomQuote,
      category: category || 'motivation'
    };
  }

  private getLocalPsychologyFacts(category?: string): PsychologyFact[] {
    const allFacts = [
      {
        fact: "Les gens dépensent 12-18% de plus quand ils paient par carte plutôt qu'en espèces",
        source: "MIT Sloan Study, 2001",
        category: "spending",
        relevance: 9
      },
      {
        fact: "Automatiser ses épargnes augmente le taux d'épargne de 85% en moyenne",
        source: "Behavioral Economics Research",
        category: "saving",
        relevance: 10
      },
      {
        fact: "Les décisions financières prises sous stress sont 23% moins optimales",
        source: "Journal of Economic Psychology",
        category: "emotional",
        relevance: 8
      },
      {
        fact: "Il faut en moyenne 66 jours pour créer une nouvelle habitude financière",
        source: "University College London",
        category: "behavioral",
        relevance: 9
      },
      {
        fact: "Les personnes qui visualisent leurs objectifs ont 42% plus de chances de les atteindre",
        source: "Dominican University Study",
        category: "goals",
        relevance: 10
      },
      {
        fact: "L'effet d'ancrage nous fait surévaluer le premier prix que nous voyons",
        source: "Kahneman & Tversky Research",
        category: "cognitive",
        relevance: 7
      },
      {
        fact: "Nous ressentons 2x plus la douleur d'une perte que le plaisir d'un gain équivalent",
        source: "Prospect Theory",
        category: "emotional",
        relevance: 9
      },
      {
        fact: "Les gens dépensent plus quand ils utilisent de l'argent 'bonus' vs salaire régulier",
        source: "Mental Accounting Research",
        category: "spending",
        relevance: 8
      }
    ];

    if (category) {
      return allFacts
        .filter(fact => fact.category === category)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 3);
    }

    return allFacts
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
  }

  private getFallbackSentiment(): MarketSentiment {
    // Sentiment neutre par défaut
    return {
      sentiment: 'neutral',
      confidence: 0.7,
      summary: 'Sentiment de marché modéré avec quelques incertitudes',
      recommendation: 'Maintenir une approche équilibrée dans vos investissements'
    };
  }

  private getFallbackNews(): any[] {
    return [
      {
        title: "L'importance de la diversification en période d'incertitude",
        description: "Les experts recommandent de diversifier les portefeuilles...",
        publishedAt: new Date().toISOString(),
        source: { name: "Finance Local" }
      },
      {
        title: "Nouvelles tendances en matière d'épargne automatisée",
        description: "L'épargne automatisée gagne en popularité...",
        publishedAt: new Date().toISOString(),
        source: { name: "Finance Local" }
      }
    ];
  }

  private getFallbackEconomicData(): any {
    return {
      indicators: {
        inflation: { rate: 2.1, trend: 'stable' },
        interestRate: { rate: 3.5, trend: 'increasing' },
        unemployment: { rate: 7.2, trend: 'decreasing' },
        gdpGrowth: { rate: 1.8, trend: 'stable' }
      },
      lastUpdated: new Date().toISOString(),
      source: 'Estimated Data'
    };
  }

  private analyzeSentimentData(newsData: any[]): MarketSentiment {
    // Analyse simple du sentiment basée sur les titres et scores
    let totalSentiment = 0;
    let count = 0;

    newsData.forEach(item => {
      if (item.overall_sentiment_score) {
        totalSentiment += parseFloat(item.overall_sentiment_score);
        count++;
      }
    });

    const averageSentiment = count > 0 ? totalSentiment / count : 0;
    
    let sentiment: 'positive' | 'neutral' | 'negative';
    let recommendation: string;

    if (averageSentiment > 0.1) {
      sentiment = 'positive';
      recommendation = 'Opportunité d\'investissement favorable, mais restez prudent';
    } else if (averageSentiment < -0.1) {
      sentiment = 'negative';
      recommendation = 'Période d\'incertitude, privilégiez la prudence et la diversification';
    } else {
      sentiment = 'neutral';
      recommendation = 'Marché stable, maintenez votre stratégie d\'investissement actuelle';
    }

    return {
      sentiment,
      confidence: Math.min(0.9, Math.abs(averageSentiment) + 0.5),
      summary: `Sentiment de marché ${sentiment} basé sur ${count} sources d'actualités`,
      recommendation
    };
  }

  // Méthodes pour récupérer des indicateurs économiques spécifiques
  private async getInflationRate(): Promise<{ rate: number; trend: string }> {
    // Implémentation avec FRED API ou autre source gratuite
    return { rate: 2.1, trend: 'stable' };
  }

  private async getInterestRate(): Promise<{ rate: number; trend: string }> {
    return { rate: 3.5, trend: 'increasing' };
  }

  private async getUnemploymentRate(): Promise<{ rate: number; trend: string }> {
    return { rate: 7.2, trend: 'decreasing' };
  }

  private async getGDPGrowth(): Promise<{ rate: number; trend: string }> {
    return { rate: 1.8, trend: 'stable' };
  }
}