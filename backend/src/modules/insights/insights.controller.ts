import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InsightsService, SmartInsight, RevelationScore } from './insights.service';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CacheKey } from '../../common/decorators/cache-key.decorator';
import { HttpCacheInterceptor } from '../../common/interceptors/cache.interceptor';

@ApiTags('Insights')
@ApiBearerAuth()
@Controller('insights')
export class InsightsController {
  constructor(private insightsService: InsightsService) {}

  @Get('revelation')
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('revelation-insights')
  @ApiOperation({ 
    summary: 'Get smart revelation insights',
    description: 'Génère des insights intelligents basés sur les données réelles de l\'utilisateur, incluant la détection de biais cognitifs, citations motivantes et faits psychologiques'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Insights intelligents générés avec succès',
    schema: {
      type: 'object',
      properties: {
        insights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string', enum: ['spending', 'saving', 'goals', 'emotional', 'behavioral'] },
              severity: { type: 'string', enum: ['positive', 'neutral', 'warning', 'critical'] },
              value: { type: 'number' },
              psychologicalFact: { type: 'string' },
              quote: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  author: { type: 'string' }
                }
              },
              bias: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  recommendation: { type: 'string' }
                }
              },
              actionable: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  impact: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getRevelationInsights(@CurrentUser('id') userId: string): Promise<{ insights: SmartInsight[] }> {
    const insights = await this.insightsService.generateSmartInsights(userId);
    return { insights };
  }

  @Get('score')
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('revelation-score')
  @ApiOperation({ 
    summary: 'Get revelation score',
    description: 'Calcule le score composite de révélation basé sur la santé financière, discipline comportementale et progrès des objectifs'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Score de révélation calculé avec succès',
    schema: {
      type: 'object',
      properties: {
        overall: { type: 'number', minimum: 0, maximum: 100 },
        financialHealth: { type: 'number', minimum: 0, maximum: 100 },
        behavioralDiscipline: { type: 'number', minimum: 0, maximum: 100 },
        goalProgress: { type: 'number', minimum: 0, maximum: 100 },
        breakdown: {
          type: 'object',
          properties: {
            cashflow: { type: 'number' },
            spending_control: { type: 'number' },
            saving_rate: { type: 'number' },
            goal_achievement: { type: 'number' },
            bias_awareness: { type: 'number' }
          }
        }
      }
    }
  })
  async getRevelationScore(@CurrentUser('id') userId: string): Promise<RevelationScore> {
    return this.insightsService.calculateRevelationScore(userId);
  }

  @Get('complete')
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('complete-revelation')
  @ApiOperation({ 
    summary: 'Get complete revelation screen data',
    description: 'Récupère toutes les données nécessaires pour le révélation screen : insights + score + visualisations'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Données complètes du révélation screen'
  })
  async getCompleteRevelation(@CurrentUser('id') userId: string) {
    const [insights, score] = await Promise.all([
      this.insightsService.generateSmartInsights(userId),
      this.insightsService.calculateRevelationScore(userId)
    ]);

    // Organiser les insights par catégorie pour l'affichage
    const categorizedInsights = {
      critical: insights.filter(i => i.severity === 'critical'),
      warning: insights.filter(i => i.severity === 'warning'),
      positive: insights.filter(i => i.severity === 'positive'),
      behavioral: insights.filter(i => i.category === 'behavioral'),
      emotional: insights.filter(i => i.category === 'emotional'),
      goals: insights.filter(i => i.category === 'goals'),
      spending: insights.filter(i => i.category === 'spending')
    };

    // Générer des recommandations prioritaires
    const priorities = this.generatePriorities(insights, score);

    // Statistiques pour les visualisations
    const stats = {
      totalInsights: insights.length,
      biasesDetected: insights.filter(i => i.bias).length,
      quotesIncluded: insights.filter(i => i.quote).length,
      averageSeverity: this.calculateAverageSeverity(insights),
      improvementPotential: this.calculateImprovementPotential(insights)
    };

    return {
      score,
      insights: categorizedInsights,
      priorities,
      stats,
      timestamp: new Date().toISOString(),
      nextUpdateIn: '24h' // Les insights se mettent à jour quotidiennement
    };
  }

  @Get('psychology-facts')
  @ApiOperation({ 
    summary: 'Get random psychology facts',
    description: 'Récupère des faits psychologiques aléatoires liés aux finances et aux biais cognitifs'
  })
  @ApiResponse({ status: 200, description: 'Faits psychologiques récupérés' })
  async getPsychologyFacts() {
    const facts = [
      {
        category: 'spending',
        fact: 'Les gens dépensent 12-18% de plus quand ils paient par carte plutôt qu\'en espèces',
        source: 'MIT Sloan Study, 2001'
      },
      {
        category: 'saving',
        fact: 'Automatiser ses épargnes augmente le taux d\'épargne de 85% en moyenne',
        source: 'Behavioral Economics Research'
      },
      {
        category: 'goals',
        fact: 'Écrire ses objectifs financiers augmente les chances de les atteindre de 42%',
        source: 'Dominican University Study'
      },
      {
        category: 'emotional',
        fact: 'Les décisions financières prises sous stress sont 23% moins optimales',
        source: 'Journal of Economic Psychology'
      },
      {
        category: 'behavioral',
        fact: 'Il faut en moyenne 66 jours pour créer une nouvelle habitude financière',
        source: 'University College London'
      }
    ];

    // Retourner 3 faits aléatoires
    const randomFacts = facts.sort(() => 0.5 - Math.random()).slice(0, 3);
    return { facts: randomFacts };
  }

  private generatePriorities(insights: SmartInsight[], score: RevelationScore) {
    const priorities = [];

    // Priorité 1: Problèmes critiques
    const critical = insights.filter(i => i.severity === 'critical');
    if (critical.length > 0) {
      priorities.push({
        level: 'critical',
        title: 'Action immédiate requise',
        description: `${critical.length} problème(s) critique(s) détecté(s)`,
        actions: critical.map(c => c.actionable.title)
      });
    }

    // Priorité 2: Score faible dans un domaine
    if (score.financialHealth < 50) {
      priorities.push({
        level: 'high',
        title: 'Améliorer la santé financière',
        description: 'Votre cashflow et taux d\'épargne nécessitent une attention',
        actions: ['Analyser vos dépenses', 'Optimiser vos revenus', 'Créer un budget réaliste']
      });
    }

    if (score.behavioralDiscipline < 50) {
      priorities.push({
        level: 'high',
        title: 'Renforcer la discipline comportementale',
        description: 'Des biais cognitifs impactent vos décisions financières',
        actions: ['Identifier vos déclencheurs', 'Automatiser vos décisions', 'Créer des garde-fous']
      });
    }

    // Priorité 3: Opportunités d'amélioration
    const positive = insights.filter(i => i.severity === 'positive');
    if (positive.length > 0) {
      priorities.push({
        level: 'opportunity',
        title: 'Capitaliser sur vos réussites',
        description: `${positive.length} point(s) fort(s) à maintenir et développer`,
        actions: positive.map(p => p.actionable.title)
      });
    }

    return priorities;
  }

  private calculateAverageSeverity(insights: SmartInsight[]): number {
    if (insights.length === 0) return 0;
    
    const severityValues = { critical: 4, warning: 3, neutral: 2, positive: 1 };
    const totalSeverity = insights.reduce((sum, insight) => sum + severityValues[insight.severity], 0);
    return totalSeverity / insights.length;
  }

  private calculateImprovementPotential(insights: SmartInsight[]): number {
    // Calculer le potentiel d'amélioration basé sur les insights actionables
    const actionableInsights = insights.filter(i => i.severity === 'warning' || i.severity === 'critical');
    const maxPotential = actionableInsights.length * 25; // 25 points par insight actionable
    return Math.min(100, maxPotential);
  }
}