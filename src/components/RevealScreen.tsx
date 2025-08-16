import React, { useEffect, useState, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useFinanceStore } from '../stores/financeStore';
import { GlassCard } from './ui/GlassCard';
import { RevealAnimation } from './ui/RevealAnimation';
import { ArrowLeftIcon, ArrowRightIcon, BarChart3Icon, TrendingUpIcon, TrendingDownIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon, InfoIcon, DownloadIcon, ShareIcon, BookmarkIcon, CreditCardIcon, PiggyBankIcon, HeartIcon, BrainIcon, TargetIcon, RefreshCwIcon, ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, LayoutDashboardIcon, LineChartIcon } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { FinancialInsight } from '../types/finance';
import CountUp from 'react-countup';
// Définition des types pour les sections d'analyse
interface AnalysisSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
}
const MemoizedInsight = memo(({
  insight
}: {
  insight: FinancialInsight;
}) => <div className={`p-3 rounded-lg ${insight.impact === 'high' ? 'bg-red-900/20 border border-red-500/30' : insight.impact === 'medium' ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-green-900/20 border border-green-500/30'}`}>
    <div className="flex items-center mb-2">
      <span className={`w-2 h-2 rounded-full mr-2 ${insight.impact === 'high' ? 'bg-red-500' : insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
      <h4 className="font-medium">{insight.title}</h4>
    </div>
    <p className="text-sm">{insight.description}</p>
  </div>);
export function RevealScreen() {
  const navigate = useNavigate();
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    financialData,
    userQuestion,
    emotionalContext,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateNetWorth,
    generateInsights,
    getFinancialHealth
  } = useFinance();
  const {
    setHasCompletedOnboarding
  } = useFinanceStore();
  // États locaux
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    insights: true,
    health: false,
    recommendations: false,
    emotional: false,
    'next-steps': false
  });
  // Calculer les métriques financières avec des vérifications de sécurité
  const {
    totalIncome,
    totalExpenses,
    netWorth
  } = useMemo(() => {
    const income = calculateTotalIncome() || 0;
    const expenses = calculateTotalExpenses() || 0;
    const net = calculateNetWorth() || 0;
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netWorth: net
    };
  }, [financialData]);
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  const savingsRate = useMemo(() => totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome * 100 : 0, [totalIncome, totalExpenses]);
  // Ensure financialData has safe defaults
  const safeFinancialData = {
    incomes: financialData?.incomes || [],
    expenses: financialData?.expenses || [],
    savings: financialData?.savings || [],
    debts: financialData?.debts || [],
    investments: financialData?.investments || []
  };
  // Sections d'analyse
  const analysisSections: AnalysisSection[] = [{
    id: 'insights',
    title: 'Insights Financiers',
    icon: <BrainIcon className="h-5 w-5 text-indigo-400" />,
    expanded: expandedSections['insights']
  }, {
    id: 'health',
    title: 'Santé Financière',
    icon: <HeartIcon className="h-5 w-5 text-red-400" />,
    expanded: expandedSections['health']
  }, {
    id: 'recommendations',
    title: 'Recommandations',
    icon: <TargetIcon className="h-5 w-5 text-green-400" />,
    expanded: expandedSections['recommendations']
  }, {
    id: 'emotional',
    title: 'Analyse Émotionnelle',
    icon: <BrainIcon className="h-5 w-5 text-purple-400" />,
    expanded: expandedSections['emotional']
  }, {
    id: 'next-steps',
    title: 'Prochaines Étapes',
    icon: <ArrowRightIcon className="h-5 w-5 text-blue-400" />,
    expanded: expandedSections['next-steps']
  }];
  // Charger les données d'analyse au montage
  useEffect(() => {
    const loadAnalysisData = async () => {
      setIsLoading(true);
      setShowAnimation(true);
      try {
        // Simuler un délai de traitement pour l'animation
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Obtenir les insights financiers
        const fetchedInsights = await generateInsights();
        setInsights(fetchedInsights || []);
        // Obtenir le score de santé financière
        const health = await getFinancialHealth();
        setHealthScore(health?.score || 50);
        setRecommendations(health?.recommendations || []);
        setStrengths(health?.strengths || []);
        setWeaknesses(health?.weaknesses || []);
        setShowAnimation(false);
        // Simuler un court délai avant d'afficher les résultats
        setTimeout(() => {
          setAnalysisComplete(true);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Erreur lors du chargement des données d'analyse:", error);
        toast.error("Une erreur est survenue lors de l'analyse");
        setShowAnimation(false);
        setIsLoading(false);
      }
    };
    loadAnalysisData();
  }, [financialData]);
  // Basculer l'état d'expansion d'une section
  const toggleSection = (sectionId: string) => {
    setExpandedSections({
      ...expandedSections,
      [sectionId]: !expandedSections[sectionId]
    });
  };
  // Naviguer vers le tableau de bord
  const handleContinueToDashboard = () => {
    setHasCompletedOnboarding(true);
    navigate('/dashboard');
  };
  // Retourner à l'écran de cartographie
  const handleBack = () => {
    navigate('/mapping');
  };
  return <div className="w-full max-w-4xl mx-auto pb-20">
      <Toaster position="top-right" />
      {showAnimation && <RevealAnimation />}
      {/* Header */}
      <motion.div className="flex justify-center mb-8" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <div className={`inline-block bg-gradient-to-r ${themeColors.primary} px-8 py-4 rounded-2xl shadow-lg`}>
          <h1 className="text-3xl font-bold">Analyse Financière</h1>
        </div>
      </motion.div>

      {/* Question et contexte */}
      <GlassCard className="p-6 mb-6" animate>
        <h2 className="text-xl font-bold mb-4">Votre question</h2>
        <p className="text-lg bg-black/20 p-4 rounded-lg mb-6">
          {userQuestion || 'Comment puis-je améliorer ma situation financière ?'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Contexte émotionnel</h3>
            <div className="flex items-center mb-2">
              <div className="mr-2 text-sm">Niveau de stress:</div>
              <div className="flex-1 bg-black/30 h-2 rounded-full">
                <div className={`h-2 rounded-full ${emotionalContext.mood <= 3 ? 'bg-green-500' : emotionalContext.mood <= 6 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                width: `${emotionalContext.mood * 10}%`
              }}></div>
              </div>
              <div className="ml-2 font-medium">{emotionalContext.mood}/10</div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {emotionalContext.tags.map((tag, index) => <span key={index} className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${themeColors.secondary} bg-opacity-30`}>
                  {tag}
                </span>)}
            </div>
          </div>
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Résumé financier</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Revenus:</span>
                <span className="font-medium text-green-400">
                  {totalIncome}€
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dépenses:</span>
                <span className="font-medium text-red-400">
                  {totalExpenses}€
                </span>
              </div>
              <div className="border-t border-white/10 my-1 pt-1"></div>
              <div className="flex justify-between">
                <span>Balance:</span>
                <span className={`font-medium ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {balance}€
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Résultats de l'analyse */}
      {isLoading ? <GlassCard className="p-12 mb-6 flex flex-col items-center justify-center" animate>
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
          <h3 className="text-xl font-medium mb-2">Analyse en cours...</h3>
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Nous analysons vos données financières et votre contexte émotionnel
            pour vous fournir des insights personnalisés.
          </p>
        </GlassCard> : <AnimatePresence>
          {analysisComplete && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
              {/* Score de santé financière */}
              <GlassCard className="p-6 mb-6" animate>
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      Votre santé financière
                    </h2>
                    <p className={`text-sm ${themeColors.textSecondary}`}>
                      Basée sur l'analyse de vos données financières et de votre
                      contexte émotionnel.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className={`text-center px-6 py-3 rounded-lg ${healthScore >= 70 ? 'bg-green-500/20 text-green-300' : healthScore >= 50 ? 'bg-blue-500/20 text-blue-300' : healthScore >= 30 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                      <div className="text-3xl font-bold mb-1">
                        <CountUp end={healthScore} duration={2} />
                        <span className="text-lg">/100</span>
                      </div>
                      <div className="text-sm">
                        {healthScore >= 70 ? 'Excellente' : healthScore >= 50 ? 'Bonne' : healthScore >= 30 ? 'À améliorer' : 'Attention requise'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                      <h3 className="font-medium">Points forts</h3>
                    </div>
                    <ul className="space-y-2">
                      {strengths.length > 0 ? strengths.map((strength, index) => <li key={index} className="text-sm flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 mr-2"></span>
                            <span>{strength}</span>
                          </li>) : <li className="text-sm text-gray-400">
                          Aucun point fort identifié
                        </li>}
                    </ul>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                      <h3 className="font-medium">Points à améliorer</h3>
                    </div>
                    <ul className="space-y-2">
                      {weaknesses.length > 0 ? weaknesses.map((weakness, index) => <li key={index} className="text-sm flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 mr-2"></span>
                            <span>{weakness}</span>
                          </li>) : <li className="text-sm text-gray-400">
                          Aucun point faible identifié
                        </li>}
                    </ul>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <InfoIcon className="h-5 w-5 text-blue-400 mr-2" />
                      <h3 className="font-medium">Indicateurs clés</h3>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Taux d'épargne:</span>
                        <span className={`font-medium ${savingsRate >= 20 ? 'text-green-400' : savingsRate > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {savingsRate.toFixed(1)}%
                        </span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Ratio dépenses/revenus:</span>
                        <span className={`font-medium ${totalIncome > 0 && totalExpenses / totalIncome <= 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {totalIncome > 0 ? (totalExpenses / totalIncome * 100).toFixed(0) : 0}
                          %
                        </span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Valeur nette:</span>
                        <span className={`font-medium ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {netWorth}€
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Sections d'analyse */}
              {analysisSections.map(section => <GlassCard key={section.id} className="p-6 mb-6" animate>
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection(section.id)}>
                    <div className="flex items-center">
                      {section.icon}
                      <h2 className="text-xl font-bold ml-2">
                        {section.title}
                      </h2>
                    </div>
                    <button className="p-1 hover:bg-black/20 rounded-full">
                      {expandedSections[section.id] ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedSections[section.id] && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: 'auto'
            }} exit={{
              opacity: 0,
              height: 0
            }} transition={{
              duration: 0.3
            }} className="overflow-hidden">
                        <div className="pt-4 mt-4 border-t border-white/10">
                          {/* Contenu des insights financiers */}
                          {section.id === 'insights' && <div className="space-y-4">
                              {insights.length > 0 ? insights.map(insight => <MemoizedInsight key={insight.id} insight={insight} />) : <div className="text-center py-6 text-gray-400">
                                  <p>Aucun insight financier disponible</p>
                                  <p className="text-sm mt-1">
                                    Ajoutez plus de données financières pour
                                    obtenir des insights personnalisés
                                  </p>
                                </div>}
                            </div>}
                          {/* Contenu de la santé financière */}
                          {section.id === 'health' && <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-black/20 p-4 rounded-lg">
                                  <h3 className="font-medium mb-3">
                                    Répartition de vos dépenses
                                  </h3>
                                  <div className="space-y-2">
                                    {safeFinancialData.expenses.length > 0 ? safeFinancialData.expenses.map((expense, index) => <div key={index} className="flex justify-between text-sm">
                                            <span>{expense.category}</span>
                                            <span className="font-medium">
                                              {expense.value}€
                                            </span>
                                          </div>) : <p className="text-sm text-gray-400">
                                        Aucune dépense enregistrée
                                      </p>}
                                  </div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-lg">
                                  <h3 className="font-medium mb-3">
                                    Indicateurs financiers
                                  </h3>
                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Taux d'épargne</span>
                                        <span className="font-medium">
                                          {savingsRate.toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-black/30 h-2 rounded-full">
                                        <div className={`h-2 rounded-full ${savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-blue-500' : savingsRate > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                              width: `${Math.min(savingsRate * 2, 100)}%`
                            }}></div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Santé financière</span>
                                        <span className="font-medium">
                                          {healthScore}/100
                                        </span>
                                      </div>
                                      <div className="w-full bg-black/30 h-2 rounded-full">
                                        <div className={`h-2 rounded-full ${healthScore >= 70 ? 'bg-green-500' : healthScore >= 50 ? 'bg-blue-500' : healthScore >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                              width: `${healthScore}%`
                            }}></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-black/20 p-4 rounded-lg">
                                <h3 className="font-medium mb-3">
                                  Analyse comparative
                                </h3>
                                <p className="text-sm mb-3">
                                  Votre situation financière comparée à la
                                  moyenne des utilisateurs ayant un profil
                                  similaire:
                                </p>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Revenus</span>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium mr-2">
                                        {totalIncome > 2500 ? `+${((totalIncome / 2500 - 1) * 100).toFixed(0)}%` : `-${((1 - totalIncome / 2500) * 100).toFixed(0)}%`}
                                      </span>
                                      {totalIncome > 2500 ? <TrendingUpIcon className="h-4 w-4 text-green-400" /> : <TrendingDownIcon className="h-4 w-4 text-red-400" />}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Dépenses</span>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium mr-2">
                                        {totalExpenses < 2000 ? `-${((1 - totalExpenses / 2000) * 100).toFixed(0)}%` : `+${((totalExpenses / 2000 - 1) * 100).toFixed(0)}%`}
                                      </span>
                                      {totalExpenses < 2000 ? <TrendingDownIcon className="h-4 w-4 text-green-400" /> : <TrendingUpIcon className="h-4 w-4 text-red-400" />}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">
                                      Taux d'épargne
                                    </span>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium mr-2">
                                        {savingsRate > 15 ? `+${((savingsRate / 15 - 1) * 100).toFixed(0)}%` : `-${((1 - savingsRate / 15) * 100).toFixed(0)}%`}
                                      </span>
                                      {savingsRate > 15 ? <TrendingUpIcon className="h-4 w-4 text-green-400" /> : <TrendingDownIcon className="h-4 w-4 text-red-400" />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>}
                          {/* Contenu des recommandations */}
                          {section.id === 'recommendations' && <div className="space-y-4">
                              {recommendations.length > 0 ? recommendations.map((recommendation, index) => <div key={index} className="bg-black/20 p-4 rounded-lg">
                                    <div className="flex items-start">
                                      <div className="p-2 rounded-full bg-indigo-500/20 mr-3 mt-1">
                                        <TargetIcon className="h-4 w-4 text-indigo-400" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-1">
                                          Recommandation {index + 1}
                                        </h4>
                                        <p className="text-sm">
                                          {recommendation}
                                        </p>
                                      </div>
                                    </div>
                                  </div>) : <div className="text-center py-6 text-gray-400">
                                  <p>Aucune recommandation disponible</p>
                                </div>}
                              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 rounded-lg border border-indigo-500/20">
                                <div className="flex items-center mb-2">
                                  <InfoIcon className="h-5 w-5 text-indigo-400 mr-2" />
                                  <h4 className="font-medium">
                                    Recommandation personnalisée
                                  </h4>
                                </div>
                                <p className="text-sm mb-3">
                                  {emotionalContext.mood > 7 ? "Compte tenu de votre niveau de stress financier élevé, nous vous recommandons de vous concentrer d'abord sur la création d'un fonds d'urgence pour vous apporter plus de sécurité." : "Votre niveau de stress financier semble gérable. Nous vous recommandons de vous concentrer sur l'optimisation de votre budget et l'augmentation de votre taux d'épargne."}
                                </p>
                                <button className={`w-full py-2 rounded-lg bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-sm flex items-center justify-center`} onClick={() => navigate('/simulation')}>
                                  Voir un plan d'action détaillé
                                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                                </button>
                              </div>
                            </div>}
                          {/* Contenu de l'analyse émotionnelle */}
                          {section.id === 'emotional' && <div className="space-y-4">
                              <div className="bg-black/20 p-4 rounded-lg">
                                <h3 className="font-medium mb-3">
                                  Impact émotionnel sur vos finances
                                </h3>
                                <p className="text-sm mb-4">
                                  {emotionalContext.mood <= 3 ? 'Votre faible niveau de stress financier est un atout. Vous êtes probablement plus enclin à prendre des décisions réfléchies et à long terme.' : emotionalContext.mood <= 6 ? 'Votre niveau de stress financier modéré peut parfois influencer vos décisions. Essayez de rester objectif lors de prises de décisions importantes.' : 'Votre niveau élevé de stress financier peut impacter négativement vos décisions. Prenez le temps de vous calmer avant de prendre des décisions financières importantes.'}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Vos émotions dominantes
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {emotionalContext.tags.map((tag, index) => <span key={index} className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                            {tag}
                                          </span>)}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Impact sur les décisions
                                    </h4>
                                    <ul className="space-y-1">
                                      {emotionalContext.tags.includes('Inquiet(e)') && <li className="text-sm flex items-start">
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 mr-2"></span>
                                          <span>
                                            L'inquiétude peut vous rendre trop
                                            conservateur dans vos décisions
                                          </span>
                                        </li>}
                                      {emotionalContext.tags.includes('Stressé(e)') && <li className="text-sm flex items-start">
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 mr-2"></span>
                                          <span>
                                            Le stress peut vous amener à prendre
                                            des décisions impulsives
                                          </span>
                                        </li>}
                                      {emotionalContext.tags.includes('Optimiste') && <li className="text-sm flex items-start">
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 mr-2"></span>
                                          <span>
                                            L'optimisme vous aide à voir les
                                            opportunités à long terme
                                          </span>
                                        </li>}
                                      {emotionalContext.tags.includes('Confiant(e)') && <li className="text-sm flex items-start">
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 mr-2"></span>
                                          <span>
                                            La confiance vous permet de prendre
                                            des décisions éclairées
                                          </span>
                                        </li>}
                                      {emotionalContext.tags.includes('Frustré(e)') && <li className="text-sm flex items-start">
                                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 mr-2"></span>
                                          <span>
                                            La frustration peut vous conduire à
                                            abandonner vos plans
                                          </span>
                                        </li>}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-black/20 p-4 rounded-lg">
                                <h3 className="font-medium mb-3">
                                  Recommandations émotionnelles
                                </h3>
                                <div className="space-y-3">
                                  {emotionalContext.mood > 6 && <div className="flex items-start">
                                      <div className="p-1.5 rounded-full bg-indigo-500/20 mr-3 mt-0.5">
                                        <HeartIcon className="h-4 w-4 text-indigo-400" />
                                      </div>
                                      <p className="text-sm">
                                        Prenez le temps de respirer profondément
                                        avant de prendre des décisions
                                        financières importantes.
                                      </p>
                                    </div>}
                                  <div className="flex items-start">
                                    <div className="p-1.5 rounded-full bg-indigo-500/20 mr-3 mt-0.5">
                                      <HeartIcon className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <p className="text-sm">
                                      Tenez un journal de vos émotions liées à
                                      l'argent pour identifier vos déclencheurs
                                      de stress.
                                    </p>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="p-1.5 rounded-full bg-indigo-500/20 mr-3 mt-0.5">
                                      <HeartIcon className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <p className="text-sm">
                                      Fixez-vous des objectifs financiers
                                      réalistes qui tiennent compte de votre
                                      bien-être émotionnel.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>}
                          {/* Contenu des prochaines étapes */}
                          {section.id === 'next-steps' && <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>
                                  <div className="flex items-center mb-2">
                                    <LayoutDashboardIcon className="h-5 w-5 text-indigo-400 mr-2" />
                                    <h4 className="font-medium">
                                      Tableau de bord
                                    </h4>
                                  </div>
                                  <p className="text-sm mb-3">
                                    Accédez à une vue d'ensemble de votre
                                    situation financière et suivez vos progrès.
                                  </p>
                                  <button className="text-sm text-indigo-400 flex items-center">
                                    Voir le tableau de bord
                                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                                  </button>
                                </div>
                                <div className="bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => navigate('/simulation')}>
                                  <div className="flex items-center mb-2">
                                    <LineChartIcon className="h-5 w-5 text-green-400 mr-2" />
                                    <h4 className="font-medium">Simulations</h4>
                                  </div>
                                  <p className="text-sm mb-3">
                                    Testez différents scénarios financiers pour
                                    optimiser votre stratégie.
                                  </p>
                                  <button className="text-sm text-green-400 flex items-center">
                                    Faire des simulations
                                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                                  </button>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 rounded-lg border border-indigo-500/20">
                                <div className="flex items-center mb-2">
                                  <TargetIcon className="h-5 w-5 text-indigo-400 mr-2" />
                                  <h4 className="font-medium">
                                    Votre plan d'action
                                  </h4>
                                </div>
                                <ol className="space-y-3 mb-4">
                                  <li className="flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/30 text-xs font-medium mr-3">
                                      1
                                    </div>
                                    <div className="text-sm">
                                      {balance < 0 ? 'Équilibrez votre budget en réduisant les dépenses non essentielles' : "Augmentez votre taux d'épargne en automatisant vos virements"}
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/30 text-xs font-medium mr-3">
                                      2
                                    </div>
                                    <div className="text-sm">
                                      {financialData.debts && financialData.debts.length > 0 ? 'Concentrez-vous sur le remboursement de vos dettes les plus coûteuses' : "Constituez un fonds d'urgence équivalent à 3-6 mois de dépenses"}
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/30 text-xs font-medium mr-3">
                                      3
                                    </div>
                                    <div className="text-sm">
                                      {savingsRate > 15 ? 'Diversifiez vos investissements pour faire fructifier votre épargne' : 'Fixez-vous des objectifs financiers clairs et réalistes'}
                                    </div>
                                  </li>
                                </ol>
                                <button className={`w-full py-2 rounded-lg bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-sm flex items-center justify-center`} onClick={() => navigate('/dashboard')}>
                                  Commencer mon plan d'action
                                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                                </button>
                              </div>
                            </div>}
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </GlassCard>)}
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button onClick={handleBack} className="btn btn-outline flex items-center justify-center">
                  <ArrowLeftIcon className="mr-2 h-5 w-5" />
                  Retour
                </button>
                <button onClick={handleContinueToDashboard} className="btn btn-primary flex items-center justify-center">
                  <LayoutDashboardIcon className="mr-2 h-5 w-5" />
                  Aller au tableau de bord
                </button>
              </div>
              {/* Actions supplémentaires */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <button className="flex items-center justify-center py-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Télécharger l'analyse</span>
                </button>
                <button className="flex items-center justify-center py-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Partager</span>
                </button>
                <button className="flex items-center justify-center py-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">Sauvegarder</span>
                </button>
              </div>
            </motion.div>}
        </AnimatePresence>}
    </div>;
}