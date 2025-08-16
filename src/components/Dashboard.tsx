import React, { useEffect, useMemo, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useFinanceStore } from '../stores/financeStore';
import { LayoutDashboardIcon, TrendingUpIcon, TrendingDownIcon, PiggyBankIcon, BarChart3Icon, AlertCircleIcon, CalendarIcon, SearchIcon, RefreshCwIcon, ArrowRightIcon, LineChartIcon, CreditCardIcon, UserIcon, SettingsIcon, PlusIcon, ChevronRightIcon, InfoIcon, BellIcon, DownloadIcon, ClockIcon, CheckCircleIcon, XCircleIcon, CircleDollarSignIcon, TargetIcon, BriefcaseIcon, HeartIcon, BellRingIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar, AreaChart, Area } from 'recharts';
import { format, subMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FinancialInsight } from '../types/finance';
import { toast, Toaster } from 'react-hot-toast';
import CountUp from 'react-countup';
// Type for dashboard notification
interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  date: Date;
  read: boolean;
}
export function Dashboard() {
  const navigate = useNavigate();
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    financialData,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateNetWorth,
    generateInsights,
    runSimulation,
    getFinancialHealth,
    detectHiddenFees,
    getHistoricalData,
    getPredictions,
    getFinancialScore,
    refreshData
  } = useFinance();
  const {
    questionHistory,
    financialSnapshots,
    setHasCompletedOnboarding
  } = useFinanceStore();
  // State variables
  const [timeframe, setTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [predictions, setPredictions] = useState<any>(null);
  const [hiddenFees, setHiddenFees] = useState<any>({
    totalAmount: 0,
    items: []
  });
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // Calculate key metrics
  const totalIncome = calculateTotalIncome() || 0;
  const totalExpenses = calculateTotalExpenses() || 0;
  const balance = totalIncome - totalExpenses;
  const netWorth = calculateNetWorth() || 0;
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome * 100 : 0;
  // Generate mock historical data if not available
  useEffect(() => {
    const generateMockHistoricalData = () => {
      const today = new Date();
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthName = format(date, 'MMM', {
          locale: fr
        });
        const variationIncome = 1 + (Math.random() * 0.2 - 0.1); // -10% to +10%
        const variationExpenses = 1 + (Math.random() * 0.2 - 0.1); // -10% to +10%
        data.push({
          month: monthName,
          income: Math.round(totalIncome * variationIncome),
          expenses: Math.round(totalExpenses * variationExpenses),
          balance: Math.round(totalIncome * variationIncome - totalExpenses * variationExpenses),
          savings: Math.round((totalIncome * variationIncome - totalExpenses * variationExpenses) * 0.7),
          investments: Math.round((totalIncome * variationIncome - totalExpenses * variationExpenses) * 0.3)
        });
      }
      return data;
    };
    // Initialize data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get insights
        let fetchedInsights = [];
        try {
          fetchedInsights = (await generateInsights()) || [];
        } catch (error) {
          console.error('Erreur lors de la récupération des insights:', error);
          fetchedInsights = [];
        }
        setInsights(fetchedInsights);
        // Get health score
        let health = {
          score: 50
        };
        try {
          health = (await getFinancialHealth()) || {
            score: 50
          };
        } catch (error) {
          console.error('Erreur lors de la récupération du score de santé:', error);
        }
        setHealthScore(health?.score || 50);
        // Get hidden fees
        let fees = {
          totalAmount: 0,
          items: []
        };
        try {
          fees = (await detectHiddenFees()) || {
            totalAmount: 0,
            items: []
          };
        } catch (error) {
          console.error('Erreur lors de la détection des frais cachés:', error);
        }
        setHiddenFees(fees);
        // Get historical data (or generate mock data)
        let history = [];
        try {
          history = (await getHistoricalData()) || [];
        } catch (error) {
          console.error('Erreur lors de la récupération des données historiques:', error);
          history = [];
        }
        setHistoricalData(history.length ? history : generateMockHistoricalData());
        // Get predictions
        try {
          const futureData = await getPredictions();
          setPredictions(futureData);
        } catch (error) {
          console.error('Erreur lors de la récupération des prédictions:', error);
        }
        // Generate notifications
        generateNotifications();
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  // Generate notifications
  const generateNotifications = () => {
    const newNotifications: DashboardNotification[] = [{
      id: '1',
      title: 'Alerte budget',
      message: 'Vous avez atteint 85% de votre budget loisirs ce mois-ci.',
      type: 'warning',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    }, {
      id: '2',
      title: 'Frais bancaires détectés',
      message: 'Nous avons détecté des frais bancaires inhabituels de 12,50€.',
      type: 'danger',
      date: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: false
    }, {
      id: '3',
      title: 'Objectif atteint',
      message: 'Félicitations ! Vous avez atteint votre objectif d\'épargne "Vacances".',
      type: 'success',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true
    }, {
      id: '4',
      title: 'Nouvelle analyse disponible',
      message: 'Votre rapport financier mensuel est disponible.',
      type: 'info',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true
    }];
    setNotifications(newNotifications);
    setUnreadNotifications(newNotifications.filter(n => !n.read).length);
  };
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
    setUnreadNotifications(0);
  };
  // Handle refresh data
  const handleRefreshData = async () => {
    toast.promise((async () => {
      setIsLoading(true);
      try {
        if (typeof refreshData === 'function') {
          await refreshData();
        }
        let fetchedInsights = [];
        try {
          fetchedInsights = (await generateInsights()) || [];
        } catch (error) {
          console.error('Erreur lors de la récupération des insights:', error);
        }
        setInsights(fetchedInsights);
        setLastUpdate(new Date());
        return true;
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    })(), {
      loading: 'Mise à jour des données...',
      success: 'Données actualisées avec succès',
      error: "Erreur lors de l'actualisation"
    });
  };
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  // Prepare data for charts
  const expensesByCategory = useMemo(() => {
    return financialData?.expenses?.reduce((acc, item) => {
      const category = item.category;
      const value = typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0;
      if (acc[category]) {
        acc[category] += value;
      } else {
        acc[category] = value;
      }
      return acc;
    }, {} as Record<string, number>) || {};
  }, [financialData?.expenses]);
  const pieChartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));
  }, [expensesByCategory]);
  // Financial health radar data
  const healthRadarData = [{
    subject: 'Épargne',
    A: savingsRate > 20 ? 100 : savingsRate > 10 ? 70 : savingsRate > 5 ? 40 : 20,
    fullMark: 100
  }, {
    subject: 'Budget',
    A: totalExpenses < totalIncome ? 90 : 30,
    fullMark: 100
  }, {
    subject: 'Dettes',
    A: (financialData?.debts?.length || 0) === 0 ? 100 : 50,
    fullMark: 100
  }, {
    subject: 'Investissements',
    A: (financialData?.investments?.length || 0) > 0 ? 80 : 20,
    fullMark: 100
  }, {
    subject: 'Protection',
    A: 65,
    fullMark: 100
  }];
  // Goal progress data
  const goalData = [{
    name: "Fonds d'urgence",
    value: 35,
    fill: '#8884d8'
  }, {
    name: 'Vacances',
    value: 85,
    fill: '#82ca9d'
  }, {
    name: 'Acompte immobilier',
    value: 12,
    fill: '#ffc658'
  }];
  // Pie chart colors
  const COLORS = themeColors?.chartColors || ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('[data-notifications]')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);
  return <div className="w-full max-w-6xl mx-auto pb-20">
      <Toaster position="top-right" />
      {/* Dashboard header */}
      <motion.div className="mb-6" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className={`${themeColors?.textSecondary || 'text-gray-400'}`}>
              Aperçu complet de votre situation financière
              {lastUpdate && <span className="text-xs ml-2">
                  <ClockIcon className="inline h-3 w-3 mr-1" />
                  Mis à jour le {format(lastUpdate, 'dd/MM/yyyy à HH:mm')}
                </span>}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative" data-notifications>
              <button onClick={() => setShowNotifications(!showNotifications)} className={`bg-black/30 hover:bg-black/40 text-white p-2 rounded-lg relative`}>
                <BellIcon className="h-5 w-5" />
                {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadNotifications}
                  </span>}
              </button>
              {/* Notifications dropdown */}
              {showNotifications && <div className="absolute right-0 mt-2 w-80 bg-black/80 border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadNotifications > 0 && <button onClick={markAllAsRead} className="text-xs text-indigo-400 hover:text-indigo-300">
                        Tout marquer comme lu
                      </button>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notification => <div key={notification.id} className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${!notification.read ? 'bg-indigo-900/10' : ''}`} onClick={() => markAsRead(notification.id)}>
                          <div className="flex items-start">
                            <div className={`mt-1 mr-3 p-1.5 rounded-full 
                              ${notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' : notification.type === 'success' ? 'bg-green-500/20 text-green-400' : notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                              {notification.type === 'info' ? <InfoIcon className="h-4 w-4" /> : notification.type === 'success' ? <CheckCircleIcon className="h-4 w-4" /> : notification.type === 'warning' ? <AlertCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : themeColors?.textSecondary || 'text-gray-400'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {format(notification.date, 'HH:mm')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>) : <div className="p-4 text-center text-gray-400 text-sm">
                        Aucune notification
                      </div>}
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button onClick={() => navigate('/settings')} className="text-xs text-center w-full text-gray-400 hover:text-white">
                      Gérer les notifications
                    </button>
                  </div>
                </div>}
            </div>
            <button onClick={handleRefreshData} className="bg-black/30 hover:bg-black/40 text-white p-2 rounded-lg" disabled={isLoading}>
              <RefreshCwIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => navigate('/question')} className={`bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300`}>
              <SearchIcon className="mr-2 h-4 w-4" />
              Nouvelle question
            </button>
          </div>
        </div>
        {/* Timeframe selector */}
        <div className="bg-black/20 p-1 rounded-full flex mb-6">
          <button onClick={() => setTimeframe('month')} className={`flex-1 py-2 rounded-full text-sm ${timeframe === 'month' ? `bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} text-white` : 'hover:bg-black/20'}`}>
            Ce mois
          </button>
          <button onClick={() => setTimeframe('quarter')} className={`flex-1 py-2 rounded-full text-sm ${timeframe === 'quarter' ? `bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} text-white` : 'hover:bg-black/20'}`}>
            Ce trimestre
          </button>
          <button onClick={() => setTimeframe('year')} className={`flex-1 py-2 rounded-full text-sm ${timeframe === 'year' ? `bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} text-white` : 'hover:bg-black/20'}`}>
            Cette année
          </button>
          <button onClick={() => setTimeframe('all')} className={`flex-1 py-2 rounded-full text-sm ${timeframe === 'all' ? `bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} text-white` : 'hover:bg-black/20'}`}>
            Tout
          </button>
        </div>
      </motion.div>
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4" animate hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
              Revenus
            </h3>
            <div className={`p-2 rounded-full bg-gradient-to-r ${themeColors?.success || 'bg-green-500/20'} bg-opacity-20`}>
              <TrendingUpIcon className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            <CountUp end={totalIncome} duration={1.5} separator=" " decimals={0} suffix="€" />
          </div>
          <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'}`}>
            {(totalIncome * (timeframe === 'month' ? 1 : timeframe === 'quarter' ? 3 : 12)).toLocaleString('fr-FR')}
            €{' '}
            {timeframe === 'month' ? 'par mois' : timeframe === 'quarter' ? 'par trimestre' : 'par an'}
          </div>
        </GlassCard>
        <GlassCard className="p-4" animate hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
              Dépenses
            </h3>
            <div className="p-2 rounded-full bg-red-500/20">
              <TrendingDownIcon className="h-4 w-4 text-red-400" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            <CountUp end={totalExpenses} duration={1.5} separator=" " decimals={0} suffix="€" />
          </div>
          <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'}`}>
            {(totalExpenses * (timeframe === 'month' ? 1 : timeframe === 'quarter' ? 3 : 12)).toLocaleString('fr-FR')}
            €{' '}
            {timeframe === 'month' ? 'par mois' : timeframe === 'quarter' ? 'par trimestre' : 'par an'}
          </div>
        </GlassCard>
        <GlassCard className="p-4" animate hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
              Balance
            </h3>
            <div className={`p-2 rounded-full ${balance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {balance >= 0 ? <PiggyBankIcon className="h-4 w-4 text-green-400" /> : <AlertCircleIcon className="h-4 w-4 text-red-400" />}
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <CountUp end={Math.abs(balance)} duration={1.5} separator=" " decimals={0} suffix="€" prefix={balance >= 0 ? '' : '-'} />
          </div>
          <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'}`}>
            {(balance * (timeframe === 'month' ? 1 : timeframe === 'quarter' ? 3 : 12)).toLocaleString('fr-FR')}
            €{' '}
            {timeframe === 'month' ? 'par mois' : timeframe === 'quarter' ? 'par trimestre' : 'par an'}
          </div>
        </GlassCard>
        <GlassCard className="p-4" animate hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
              Valeur nette
            </h3>
            <div className="p-2 rounded-full bg-blue-500/20">
              <BarChart3Icon className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            <CountUp end={netWorth} duration={1.5} separator=" " decimals={0} suffix="€" />
          </div>
          <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'}`}>
            {netWorth >= 0 ? 'Patrimoine positif' : 'Patrimoine négatif'}
          </div>
        </GlassCard>
      </div>
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Financial trends chart */}
        <GlassCard className="p-4 lg:col-span-2" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Évolution des finances</h3>
            <div className="flex items-center text-xs bg-black/20 px-2 py-1 rounded-full">
              <CalendarIcon className="h-3 w-3 mr-1" />6 derniers mois
            </div>
          </div>
          {isLoading ? <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div> : <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, '']} contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }} />
                  <Legend />
                  <Area type="monotone" dataKey="income" name="Revenus" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="expenses" name="Dépenses" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
                  <Area type="monotone" dataKey="balance" name="Balance" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>}
          {/* Monthly summary */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-black/20 p-3 rounded-lg">
              <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'} mb-1`}>
                Taux d'épargne
              </div>
              <div className="flex items-center">
                <div className="text-lg font-bold text-indigo-400">
                  {savingsRate.toFixed(1)}%
                </div>
                <div className="ml-auto">
                  {savingsRate >= 20 ? <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded">
                      Excellent
                    </span> : savingsRate >= 10 ? <span className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded">
                      Bon
                    </span> : savingsRate > 0 ? <span className="bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded">
                      Moyen
                    </span> : <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded">
                      Insuffisant
                    </span>}
                </div>
              </div>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'} mb-1`}>
                Top dépense
              </div>
              {pieChartData.length > 0 ? <div className="text-lg font-bold">
                  {pieChartData.sort((a, b) => b.value - a.value)[0]?.name || '-'}
                </div> : <div className="text-lg font-bold">-</div>}
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'} mb-1`}>
                Économies potentielles
              </div>
              <div className="text-lg font-bold text-green-400">
                {hiddenFees?.totalAmount ? `${hiddenFees.totalAmount.toFixed(0)}€` : '0€'}
              </div>
            </div>
          </div>
        </GlassCard>
        {/* Expense breakdown */}
        <GlassCard className="p-4" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Répartition des dépenses</h3>
            <button onClick={() => navigate('/reports')} className="text-xs bg-black/20 px-2 py-1 rounded-full flex items-center">
              <ChevronRightIcon className="h-3 w-3 mr-1" />
              Détails
            </button>
          </div>
          {isLoading ? <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div> : pieChartData.length > 0 ? <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, 'Montant']} contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }} />
                </PieChart>
              </ResponsiveContainer>
            </div> : <div className="h-64 flex items-center justify-center">
              <p className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
                Pas de données disponibles
              </p>
            </div>}
          {/* Top expenses summary */}
          {pieChartData.length > 0 && <div className="mt-2">
              <h4 className={`text-sm font-medium mb-2 ${themeColors?.textSecondary || 'text-gray-400'}`}>
                Top 3 des dépenses
              </h4>
              <div className="space-y-2">
                {pieChartData.sort((a, b) => b.value - a.value).slice(0, 3).map((item, index) => <div key={index} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{
                backgroundColor: COLORS[index % COLORS.length]
              }}></div>
                      <div className="text-sm">{item.name}</div>
                      <div className="ml-auto text-sm font-medium">
                        {item.value.toLocaleString('fr-FR')}€
                      </div>
                    </div>)}
              </div>
            </div>}
        </GlassCard>
      </div>
      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Financial health */}
        <GlassCard className="p-4" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-red-400" />
              Santé financière
            </h3>
            <div className={`text-xs px-2 py-1 rounded-full ${healthScore >= 70 ? 'bg-green-500/20 text-green-300' : healthScore >= 50 ? 'bg-blue-500/20 text-blue-300' : healthScore >= 30 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
              Score: {healthScore}/100
            </div>
          </div>
          {isLoading ? <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div> : <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={healthRadarData}>
                  <PolarGrid stroke="#444" />
                  <PolarAngleAxis dataKey="subject" stroke="#aaa" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#aaa" />
                  <Radar name="Santé financière" dataKey="A" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
                  <Tooltip formatter={value => [`${value}/100`, '']} contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>}
          <div className="mt-2">
            <button onClick={() => navigate('/reveal')} className={`w-full py-2 rounded-lg bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-sm flex items-center justify-center`}>
              Analyse complète
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </GlassCard>
        {/* Goals progress */}
        <GlassCard className="p-4" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <TargetIcon className="h-5 w-5 mr-2 text-green-400" />
              Objectifs financiers
            </h3>
            <button className="text-xs bg-black/20 px-2 py-1 rounded-full flex items-center" onClick={() => navigate('/settings')}>
              <PlusIcon className="h-3 w-3 mr-1" />
              Ajouter
            </button>
          </div>
          {isLoading ? <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div> : <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" barSize={15} data={goalData}>
                  <RadialBar label={{
                position: 'insideStart',
                fill: '#fff'
              }} background dataKey="value" />
                  <Tooltip formatter={value => [`${value}%`, 'Progression']} contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }} />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>}
          <div className="mt-2 space-y-2">
            <div className="bg-black/20 p-2 rounded-lg flex justify-between items-center">
              <div className="text-sm">Fonds d'urgence</div>
              <div className="text-xs">1 750€ / 5 000€</div>
            </div>
            <div className="bg-black/20 p-2 rounded-lg flex justify-between items-center">
              <div className="text-sm">Vacances d'été</div>
              <div className="text-xs">1 700€ / 2 000€</div>
            </div>
            <div className="bg-black/20 p-2 rounded-lg flex justify-between items-center">
              <div className="text-sm">Acompte immobilier</div>
              <div className="text-xs">6 000€ / 50 000€</div>
            </div>
          </div>
        </GlassCard>
        {/* Financial insights */}
        <GlassCard className="p-4" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <LineChartIcon className="h-5 w-5 mr-2 text-indigo-400" />
              Insights financiers
            </h3>
            <div className="text-xs bg-indigo-500/20 px-2 py-1 rounded-full">
              {insights.length} détectés
            </div>
          </div>
          {isLoading ? <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div> : <div className="space-y-3 max-h-64 overflow-y-auto">
              {insights && insights.length > 0 ? insights.map((insight, index) => <div key={insight.id || index} className={`p-3 rounded-lg ${insight.impact === 'high' ? 'bg-red-900/20 border border-red-500/30' : insight.impact === 'medium' ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-green-900/20 border border-green-500/30'}`}>
                    <div className="flex items-center mb-1">
                      <span className={`w-2 h-2 rounded-full mr-2 ${insight.impact === 'high' ? 'bg-red-500' : insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                    </div>
                    <p className="text-xs text-gray-300">
                      {insight.description}
                    </p>
                  </div>) : <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">Pas d'insights disponibles</p>
                  <p className="text-xs mt-1">
                    Ajoutez plus de données financières
                  </p>
                </div>}
            </div>}
          <div className="mt-4">
            <button onClick={() => navigate('/reveal')} className={`w-full py-2 rounded-lg bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-sm flex items-center justify-center`}>
              Voir tous les insights
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </GlassCard>
      </div>
      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hidden fees */}
        <GlassCard className="p-4" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <AlertCircleIcon className="h-5 w-5 mr-2 text-orange-400" />
              Frais cachés détectés
            </h3>
            <div className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
              {hiddenFees?.totalAmount !== undefined ? `${hiddenFees.totalAmount.toFixed(0)}€` : '0€'}
            </div>
          </div>
          {isLoading ? <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div> : hiddenFees?.items && hiddenFees.items.length > 0 ? <div className="space-y-3 max-h-64 overflow-y-auto">
              {hiddenFees.items.map((fee, index) => <div key={index} className="bg-black/20 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{fee.category}</span>
                    <span className="text-orange-400 font-medium">
                      {fee.amount}€
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{fee.description}</p>
                </div>)}
            </div> : <div className="text-center py-6 text-gray-400">
              <p className="text-sm">Aucun frais caché détecté</p>
              <p className="text-xs mt-1">
                Nous analysons vos transactions pour identifier des frais
                optimisables
              </p>
            </div>}
          <div className="mt-4">
            <button onClick={() => navigate('/reveal')} className={`w-full py-2 rounded-lg bg-gradient-to-r ${themeColors?.secondary || 'from-gray-800 to-gray-900'} hover:opacity-90 text-sm flex items-center justify-center`}>
              Optimiser mes frais
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </GlassCard>
        {/* Recent questions */}
        <GlassCard className="p-4" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <SearchIcon className="h-5 w-5 mr-2 text-blue-400" />
              Questions récentes
            </h3>
            <div className="text-xs bg-black/20 px-2 py-1 rounded-full">
              Historique
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {questionHistory && questionHistory.length > 0 ? questionHistory.map((question, index) => <div key={index} className="bg-black/20 p-3 rounded-lg cursor-pointer hover:bg-black/30 transition-all" onClick={() => navigate('/question')}>
                  <p className="text-sm">{question}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {index === 0 ? "À l'instant" : index === 1 ? 'Hier' : `Il y a ${index + 1} jours`}
                  </p>
                </div>) : <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Pas de questions récentes</p>
                <p className="text-xs mt-1">
                  Posez une question pour commencer
                </p>
              </div>}
          </div>
          <div className="mt-4">
            <button onClick={() => navigate('/question')} className={`w-full py-2 rounded-lg bg-gradient-to-r ${themeColors?.secondary || 'from-gray-800 to-gray-900'} hover:opacity-90 text-sm flex items-center justify-center`}>
              Poser une nouvelle question
              <SearchIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </GlassCard>
        {/* Financial forecast */}
        <GlassCard className="p-4" animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-purple-400" />
              Prévisions financières
            </h3>
            <div className="text-xs bg-black/20 px-2 py-1 rounded-full">
              12 mois
            </div>
          </div>
          {isLoading ? <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div> : <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{
              month: 'J',
              valeur: totalIncome - totalExpenses
            }, {
              month: 'F',
              valeur: (totalIncome - totalExpenses) * 1.02
            }, {
              month: 'M',
              valeur: (totalIncome - totalExpenses) * 1.03
            }, {
              month: 'A',
              valeur: (totalIncome - totalExpenses) * 1.05
            }, {
              month: 'M',
              valeur: (totalIncome - totalExpenses) * 1.06
            }, {
              month: 'J',
              valeur: (totalIncome - totalExpenses) * 1.08
            }]} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, 'Épargne prévisionnelle']} contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }} />
                  <Bar dataKey="valeur" fill={COLORS[4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>}
          <div className="mt-4">
            <button onClick={() => navigate('/simulation')} className={`w-full py-2 rounded-lg bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-sm flex items-center justify-center`}>
              Simulations avancées
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </GlassCard>
      </div>
      {/* Action buttons - Fixed to use direct Link components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/question" className="bg-black/30 hover:bg-black/40 p-4 rounded-lg flex items-center justify-center transition-all">
          <SearchIcon className="h-5 w-5 mr-2 text-indigo-400" />
          <span>Nouvelle question</span>
        </Link>
        <Link to="/simulation" className="bg-black/30 hover:bg-black/40 p-4 rounded-lg flex items-center justify-center transition-all">
          <LineChartIcon className="h-5 w-5 mr-2 text-green-400" />
          <span>Simulations</span>
        </Link>
        <Link to="/reports" className="bg-black/30 hover:bg-black/40 p-4 rounded-lg flex items-center justify-center transition-all">
          <BarChart3Icon className="h-5 w-5 mr-2 text-blue-400" />
          <span>Rapports</span>
        </Link>
        <Link to="/settings" className="bg-black/30 hover:bg-black/40 p-4 rounded-lg flex items-center justify-center transition-all">
          <SettingsIcon className="h-5 w-5 mr-2 text-purple-400" />
          <span>Paramètres</span>
        </Link>
      </div>
    </div>;
}