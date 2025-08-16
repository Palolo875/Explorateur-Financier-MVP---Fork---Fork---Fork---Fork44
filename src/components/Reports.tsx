import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { DownloadIcon, ShareIcon, FileTextIcon, ChevronLeftIcon, ChevronRightIcon, PieChartIcon, TrendingUpIcon, BarChart2Icon, AlertTriangleIcon, CheckCircleIcon, ArrowUpIcon, ArrowDownIcon, InfoIcon } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { toast, Toaster } from 'react-hot-toast';
import dayjs from 'dayjs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Types
interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  category: 'income' | 'expense' | 'saving' | 'debt' | 'general';
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
}
interface SimulationResults {
  netWorth: number[];
  income: number[];
  expenses: number[];
  savings: number[];
}
interface FinancialReport {
  id: string;
  title: string;
  date: string;
  insights: FinancialInsight[];
  summary: string;
  recommendations: string[];
  simulationResults: SimulationResults;
}
// Utility functions
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('DD/MM/YYYY');
};
const formatCurrency = (value: number) => {
  return value.toLocaleString('fr-FR') + ' €';
};
// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
export function Reports() {
  console.log('Rendu du composant Reports');
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    financialData,
    generateInsights,
    runSimulation
  } = useFinance();
  // State
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Generate example reports on mount
  useEffect(() => {
    console.log('Génération des rapports...');
    generateReports();
  }, []);
  const generateReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Début de la génération des rapports');
      // Créer des données simulées pour les rapports
      const simulationResults = {
        netWorth: [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000],
        income: [3000, 3060, 3121, 3184, 3247, 3312, 3378, 3446, 3515, 3585],
        expenses: [2000, 1980, 1960, 1941, 1921, 1902, 1883, 1864, 1846, 1827],
        savings: [1000, 1080, 1161, 1243, 1326, 1410, 1495, 1581, 1669, 1758]
      };
      // Créer des insights par défaut
      const defaultInsights: FinancialInsight[] = [{
        id: '1',
        title: "Taux d'épargne en augmentation",
        description: "Votre taux d'épargne a augmenté de 3% ce mois-ci, ce qui est un excellent signe pour votre santé financière.",
        category: 'saving',
        impact: 'positive',
        priority: 'medium'
      }, {
        id: '2',
        title: 'Dépenses en loisirs élevées',
        description: 'Vos dépenses en loisirs représentent 15% de votre budget, ce qui est supérieur à la moyenne recommandée de 10%.',
        category: 'expense',
        impact: 'negative',
        priority: 'low'
      }, {
        id: '3',
        title: 'Revenus stables',
        description: 'Vos revenus sont restés stables ces 6 derniers mois, ce qui est positif pour votre planification financière.',
        category: 'income',
        impact: 'neutral',
        priority: 'low'
      }];
      // Créer des rapports par défaut
      const defaultReports: FinancialReport[] = [{
        id: '1',
        title: 'Rapport financier mensuel',
        date: dayjs().subtract(2, 'day').toISOString(),
        insights: defaultInsights,
        summary: "Ce rapport mensuel met en évidence une amélioration de votre taux d'épargne de 3% par rapport au mois précédent. Vos dépenses en loisirs ont diminué, tandis que vos revenus sont restés stables.",
        recommendations: ['Continuez à optimiser vos dépenses en loisirs', "Envisagez d'investir votre surplus d'épargne", 'Revoyez votre budget alimentaire qui a augmenté de 5%'],
        simulationResults
      }, {
        id: '2',
        title: "Analyse d'objectif d'achat immobilier",
        date: dayjs().subtract(15, 'day').toISOString(),
        insights: defaultInsights.filter(i => i.category === 'saving' || i.category === 'expense'),
        summary: "Cette analyse évalue votre capacité à atteindre votre objectif d'achat immobilier. Avec votre taux d'épargne actuel, vous pourriez constituer un apport de 50 000€ en 7 ans et 3 mois.",
        recommendations: ["Augmentez votre taux d'épargne de 5% pour réduire le délai à 6 ans", "Explorez les aides à l'accession à la propriété", 'Optimisez vos placements pour un meilleur rendement'],
        simulationResults
      }, {
        id: '3',
        title: 'Audit financier trimestriel',
        date: dayjs().subtract(45, 'day').toISOString(),
        insights: defaultInsights,
        summary: "Ce rapport trimestriel analyse l'évolution de votre situation financière. Votre patrimoine net a augmenté de 4.2% ce trimestre, principalement grâce à la performance de vos investissements.",
        recommendations: ["Rééquilibrez votre portefeuille d'investissement", 'Consolidez vos petites dettes', "Augmentez votre fonds d'urgence pour atteindre 6 mois de dépenses"],
        simulationResults
      }];
      console.log('Rapports générés:', defaultReports);
      setReports(defaultReports);
      setSelectedReport(defaultReports[0]);
    } catch (err) {
      console.error('Erreur lors de la génération des rapports:', err);
      setError('Une erreur est survenue lors de la génération des rapports. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  const handlePreviousReport = () => {
    if (!reports.length) return;
    const currentIndex = reports.findIndex(r => r.id === selectedReport?.id);
    if (currentIndex > 0) {
      setSelectedReport(reports[currentIndex - 1]);
    }
  };
  const handleNextReport = () => {
    if (!reports.length) return;
    const currentIndex = reports.findIndex(r => r.id === selectedReport?.id);
    if (currentIndex < reports.length - 1) {
      setSelectedReport(reports[currentIndex + 1]);
    }
  };
  const handleExportPDF = () => {
    if (!selectedReport) return;
    try {
      setExportLoading(true);
      // Simuler une exportation PDF
      setTimeout(() => {
        toast.success('Rapport exporté avec succès');
        setExportLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Erreur lors de l'exportation du rapport.");
      setExportLoading(false);
    }
  };
  const handleShareReport = () => {
    if (!selectedReport) return;
    toast.success('Fonctionnalité de partage activée');
  };
  if (isLoading) {
    return <div className="w-full max-w-6xl mx-auto pb-20">
        <Toaster position="top-right" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="w-full max-w-6xl mx-auto pb-20">
        <Toaster position="top-right" />
        <GlassCard className="p-6 text-center" animate>
          <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl font-bold mb-2">Une erreur est survenue</h2>
          <p className="mb-4">{error}</p>
          <button onClick={generateReports} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
            Réessayer
          </button>
        </GlassCard>
      </div>;
  }
  return <div className="w-full max-w-6xl mx-auto pb-20">
      <Toaster position="top-right" />
      {/* Header */}
      <motion.div className="mb-6" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <div className={`inline-block bg-gradient-to-r ${themeColors.primary} px-8 py-4 rounded-2xl shadow-lg`}>
          <h1 className="text-3xl font-bold">Rapports Financiers</h1>
        </div>
      </motion.div>
      {/* Report navigation */}
      <GlassCard className="p-6 mb-6" animate>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Vos rapports</h2>
          <div className="flex space-x-3">
            <button onClick={handleExportPDF} disabled={exportLoading || !selectedReport} className="flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 px-3 py-1.5 rounded-lg text-sm">
              <DownloadIcon className="h-4 w-4 mr-1" />
              {exportLoading ? 'Export...' : 'Exporter PDF'}
            </button>
            <button onClick={handleShareReport} disabled={!selectedReport} className="flex items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 px-3 py-1.5 rounded-lg text-sm">
              <ShareIcon className="h-4 w-4 mr-1" />
              Partager
            </button>
          </div>
        </div>
        {reports.length === 0 ? <div className="text-center py-8">
            <FileTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400 mb-2">Aucun rapport disponible</p>
            <p className="text-sm text-gray-500">
              Ajoutez des données financières pour générer des rapports
              personnalisés
            </p>
          </div> : <div className="flex items-center justify-between">
            <button onClick={handlePreviousReport} disabled={reports.findIndex(r => r.id === selectedReport?.id) <= 0} className="p-2 bg-black/30 hover:bg-black/40 disabled:opacity-50 rounded-full">
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1 mx-4">
              <div className="grid grid-cols-3 gap-4">
                {reports.map((report, index) => {
              const isSelected = report.id === selectedReport?.id;
              return <div key={report.id} className={`cursor-pointer p-3 rounded-lg transition-all ${isSelected ? 'bg-indigo-600/30 border border-indigo-500/50' : 'bg-black/20 hover:bg-black/30'}`} onClick={() => setSelectedReport(report)}>
                      <div className="flex items-center mb-2">
                        <FileTextIcon className="h-4 w-4 mr-2 text-indigo-400" />
                        <h3 className="text-sm font-medium truncate">
                          {report.title}
                        </h3>
                      </div>
                      <div className="text-xs text-gray-400">
                        Créé le {formatDate(report.date)}
                      </div>
                    </div>;
            })}
              </div>
            </div>
            <button onClick={handleNextReport} disabled={reports.findIndex(r => r.id === selectedReport?.id) >= reports.length - 1} className="p-2 bg-black/30 hover:bg-black/40 disabled:opacity-50 rounded-full">
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>}
      </GlassCard>
      {/* Selected report content */}
      {selectedReport && <div id="report-content">
          <GlassCard className="p-6 mb-6" animate>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {selectedReport.title}
              </h2>
              <div className="text-sm text-gray-400">
                Généré le {formatDate(selectedReport.date)}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Résumé
              </h3>
              <p className="bg-black/20 p-4 rounded-lg text-gray-200">
                {selectedReport.summary}
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <BarChart2Icon className="h-5 w-5 mr-2 text-indigo-400" />
                Projection financière
              </h3>
              <div className="bg-black/20 p-4 rounded-lg">
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedReport.simulationResults.netWorth.map((value, index) => ({
                  year: `A${index}`,
                  value
                }))} margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 5
                }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#999" />
                      <YAxis stroke="#999" tickFormatter={value => `${value / 1000}k`} />
                      <Tooltip formatter={value => [`${formatCurrency(value as number)}`, 'Patrimoine']} labelFormatter={label => `Année ${parseInt(label.substring(1)) + 1}`} />
                      <Line type="monotone" dataKey="value" name="Patrimoine" stroke="#8884d8" strokeWidth={2} dot={{
                    r: 4
                  }} activeDot={{
                    r: 6
                  }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <ArrowUpIcon className="h-4 w-4 mr-1 text-green-400" />
                      Revenus
                    </h4>
                    <div className="h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedReport.simulationResults.income.map((value, index) => ({
                      year: `A${index}`,
                      value
                    }))}>
                          <Line type="monotone" dataKey="value" stroke="#00C49F" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <ArrowDownIcon className="h-4 w-4 mr-1 text-red-400" />
                      Dépenses
                    </h4>
                    <div className="h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedReport.simulationResults.expenses.map((value, index) => ({
                      year: `A${index}`,
                      value
                    }))}>
                          <Line type="monotone" dataKey="value" stroke="#FF8042" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <ArrowUpIcon className="h-4 w-4 mr-1 text-blue-400" />
                      Épargne
                    </h4>
                    <div className="h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedReport.simulationResults.savings.map((value, index) => ({
                      year: `A${index}`,
                      value
                    }))}>
                          <Line type="monotone" dataKey="value" stroke="#0088FE" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Insights financiers
              </h3>
              {selectedReport.insights.length > 0 ? <div className="space-y-3">
                  {selectedReport.insights.map((insight, index) => <div key={index} className="bg-black/20 p-3 rounded-lg">
                      <div className="flex items-center mb-1">
                        {insight.impact === 'positive' ? <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400" /> : insight.impact === 'negative' ? <AlertTriangleIcon className="h-4 w-4 mr-2 text-red-400" /> : <InfoIcon className="h-4 w-4 mr-2 text-blue-400" />}
                        <h4 className="text-sm font-medium">{insight.title}</h4>
                        <div className={`ml-auto px-2 py-0.5 rounded-full text-xs ${insight.priority === 'high' ? 'bg-red-900/50 text-red-300' : insight.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-blue-900/50 text-blue-300'}`}>
                          {insight.priority === 'high' ? 'Prioritaire' : insight.priority === 'medium' ? 'Important' : 'Information'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">
                        {insight.description}
                      </p>
                    </div>)}
                </div> : <div className="bg-black/20 p-4 rounded-lg text-center">
                  <p className="text-gray-400">Aucun insight disponible</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Ajoutez plus de données financières pour obtenir des
                    insights personnalisés
                  </p>
                </div>}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
                Recommandations
              </h3>
              <div className="bg-black/20 p-4 rounded-lg">
                <ul className="space-y-3">
                  {selectedReport.recommendations.map((recommendation, index) => <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-600 rounded-full mr-3 text-xs">
                          {index + 1}
                        </span>
                        <span>{recommendation}</span>
                      </li>)}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>}
    </div>;
}