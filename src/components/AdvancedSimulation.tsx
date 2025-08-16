import React, { useEffect, useState, createElement } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { LineChartIcon, SaveIcon, PlusIcon, TrashIcon, DownloadIcon, RefreshCwIcon, BarChart3Icon, CopyIcon, CheckIcon, AlertCircleIcon, InfoIcon, DollarSignIcon, PercentIcon, CalendarIcon, ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, PiggyBankIcon, HomeIcon, GraduationCapIcon, HeartIcon, CarIcon, BriefcaseIcon, ShareIcon, LockIcon, UnlockIcon, ChevronRightIcon, SettingsIcon, TargetIcon, CheckCircleIcon, BellRingIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { SimulationParams, SimulationResult } from '../types/finance';
import { toast, Toaster } from 'react-hot-toast';
import { toPng } from 'html-to-image';
// Advanced simulation types
interface GoalSimulation {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  interestRate: number;
  inflationRate: number;
  years: number;
  results: {
    years: number[];
    amounts: number[];
    adjustedForInflation: number[];
  };
}
interface ScenarioComparison {
  name: string;
  description: string;
  params: SimulationParams;
  results: SimulationResult;
}
export function AdvancedSimulation() {
  const navigate = useNavigate();
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    runSimulation,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateNetWorth: calculateNetWorthFromContext,
    financialData
  } = useFinance();
  // State variables
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<string>('Situation actuelle');
  const [simulations, setSimulations] = useState<{
    name: string;
    params: SimulationParams;
    results: SimulationResult;
  }[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'wealth' | 'goals' | 'scenarios' | 'custom'>('wealth');
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  // Form state for new simulation
  const [simulationName, setSimulationName] = useState('Nouvelle simulation');
  const [incomeGrowth, setIncomeGrowth] = useState(2);
  const [expenseReduction, setExpenseReduction] = useState(1);
  const [savingsRate, setSavingsRate] = useState(50);
  const [investmentReturn, setInvestmentReturn] = useState(5);
  const [inflationRate, setInflationRate] = useState(2);
  const [years, setYears] = useState(10);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentAge, setCurrentAge] = useState(35);
  const [includeInflation, setIncludeInflation] = useState(true);
  // Goal simulations
  const [goals, setGoals] = useState<GoalSimulation[]>([]);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState(10000);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [goalInterestRate, setGoalInterestRate] = useState(5);
  const [goalInflationRate, setGoalInflationRate] = useState(2);
  const [goalYears, setGoalYears] = useState(5);
  // Scenario comparisons
  const [scenarios, setScenarios] = useState<ScenarioComparison[]>([]);
  // Add loading state
  const [isInitialized, setIsInitialized] = useState(false);
  // Calculate default simulation on mount
  useEffect(() => {
    const initializeSimulations = async () => {
      try {
        setIsLoading(true);
        // Create default simulations
        const defaultSimulation = {
          name: 'Simulation par défaut',
          params: {
            name: 'Simulation par défaut',
            incomeGrowth: 2,
            expenseReduction: 1,
            savingsRate: 50,
            investmentReturn: 5,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Simulation par défaut',
            incomeGrowth: 2,
            expenseReduction: 1,
            savingsRate: 50,
            investmentReturn: 5,
            inflationRate: 2,
            years: 10
          })
        };
        const optimisticSimulation = {
          name: 'Scénario optimiste',
          params: {
            name: 'Scénario optimiste',
            incomeGrowth: 4,
            expenseReduction: 2,
            savingsRate: 70,
            investmentReturn: 7,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Scénario optimiste',
            incomeGrowth: 4,
            expenseReduction: 2,
            savingsRate: 70,
            investmentReturn: 7,
            inflationRate: 2,
            years: 10
          })
        };
        const conservativeSimulation = {
          name: 'Scénario conservateur',
          params: {
            name: 'Scénario conservateur',
            incomeGrowth: 1,
            expenseReduction: 0.5,
            savingsRate: 30,
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Scénario conservateur',
            incomeGrowth: 1,
            expenseReduction: 0.5,
            savingsRate: 30,
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          })
        };
        // Create default goals
        const emergencyFundGoal: GoalSimulation = {
          id: '1',
          name: "Fonds d'urgence",
          targetAmount: 10000,
          currentAmount: 2000,
          monthlyContribution: 300,
          interestRate: 1,
          inflationRate: 2,
          years: 3,
          results: calculateGoalResults(10000, 2000, 300, 1, 2, 3)
        };
        const vacationGoal: GoalSimulation = {
          id: '2',
          name: 'Vacances',
          targetAmount: 5000,
          currentAmount: 1500,
          monthlyContribution: 200,
          interestRate: 1,
          inflationRate: 2,
          years: 2,
          results: calculateGoalResults(5000, 1500, 200, 1, 2, 2)
        };
        const homeDownPaymentGoal: GoalSimulation = {
          id: '3',
          name: 'Apport immobilier',
          targetAmount: 50000,
          currentAmount: 10000,
          monthlyContribution: 600,
          interestRate: 3,
          inflationRate: 2,
          years: 5,
          results: calculateGoalResults(50000, 10000, 600, 3, 2, 5)
        };
        // Create default scenarios
        const baseScenario: ScenarioComparison = {
          name: 'Situation actuelle',
          description: 'Votre situation financière actuelle sans changement',
          params: {
            name: 'Situation actuelle',
            incomeGrowth: 2,
            expenseReduction: 0,
            savingsRate: calculateSavingsRate(),
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Situation actuelle',
            incomeGrowth: 2,
            expenseReduction: 0,
            savingsRate: calculateSavingsRate(),
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          })
        };
        const expenseReductionScenario: ScenarioComparison = {
          name: 'Réduction des dépenses',
          description: 'Réduction des dépenses de 15% et maintien des revenus',
          params: {
            name: 'Réduction des dépenses',
            incomeGrowth: 2,
            expenseReduction: 15,
            savingsRate: calculateSavingsRate() + 10,
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Réduction des dépenses',
            incomeGrowth: 2,
            expenseReduction: 15,
            savingsRate: calculateSavingsRate() + 10,
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          })
        };
        const incomeIncreaseScenario: ScenarioComparison = {
          name: 'Augmentation des revenus',
          description: 'Augmentation des revenus de 20% sur 5 ans',
          params: {
            name: 'Augmentation des revenus',
            incomeGrowth: 4,
            expenseReduction: 0,
            savingsRate: calculateSavingsRate() + 5,
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Augmentation des revenus',
            incomeGrowth: 4,
            expenseReduction: 0,
            savingsRate: calculateSavingsRate() + 5,
            investmentReturn: 3,
            inflationRate: 2,
            years: 10
          })
        };
        const investmentScenario: ScenarioComparison = {
          name: 'Investissements optimisés',
          description: 'Optimisation des investissements pour un rendement de 6%',
          params: {
            name: 'Investissements optimisés',
            incomeGrowth: 2,
            expenseReduction: 0,
            savingsRate: calculateSavingsRate(),
            investmentReturn: 6,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Investissements optimisés',
            incomeGrowth: 2,
            expenseReduction: 0,
            savingsRate: calculateSavingsRate(),
            investmentReturn: 6,
            inflationRate: 2,
            years: 10
          })
        };
        const combinedScenario: ScenarioComparison = {
          name: 'Stratégie combinée',
          description: "Combinaison de réduction des dépenses et d'optimisation des investissements",
          params: {
            name: 'Stratégie combinée',
            incomeGrowth: 3,
            expenseReduction: 10,
            savingsRate: calculateSavingsRate() + 15,
            investmentReturn: 5,
            inflationRate: 2,
            years: 10
          },
          results: await runSimulation({
            name: 'Stratégie combinée',
            incomeGrowth: 3,
            expenseReduction: 10,
            savingsRate: calculateSavingsRate() + 15,
            investmentReturn: 5,
            inflationRate: 2,
            years: 10
          })
        };
        // Set state
        setSimulations([defaultSimulation, optimisticSimulation, conservativeSimulation]);
        setActiveSimulation(defaultSimulation.name);
        setGoals([emergencyFundGoal, vacationGoal, homeDownPaymentGoal]);
        setScenarios([baseScenario, expenseReductionScenario, incomeIncreaseScenario, investmentScenario, combinedScenario]);
        setActiveScenario(baseScenario.name);
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeSimulations();
  }, [financialData, runSimulation, calculateTotalIncome, calculateTotalExpenses]);
  // Guard clause for initialization
  if (!isInitialized && isLoading) {
    return <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>;
  }
  // Helper function to calculate savings rate
  function calculateSavingsRate() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    if (totalIncome <= 0) return 0;
    const savingsRate = (totalIncome - totalExpenses) / totalIncome * 100;
    return Math.max(0, Math.min(100, savingsRate));
  }
  // Helper function to calculate goal results
  function calculateGoalResults(targetAmount: number, currentAmount: number, monthlyContribution: number, interestRate: number, inflationRate: number, years: number) {
    const yearArray = [];
    const amountArray = [];
    const inflationAdjustedArray = [];
    let currentTotal = currentAmount;
    for (let i = 0; i <= years; i++) {
      yearArray.push(new Date().getFullYear() + i);
      if (i > 0) {
        // Add monthly contributions for the year
        currentTotal += monthlyContribution * 12;
        // Add interest
        currentTotal *= 1 + interestRate / 100;
      }
      amountArray.push(Math.round(currentTotal));
      // Calculate inflation-adjusted amount
      const inflationFactor = Math.pow(1 + inflationRate / 100, i);
      const adjustedAmount = currentTotal / inflationFactor;
      inflationAdjustedArray.push(Math.round(adjustedAmount));
    }
    return {
      years: yearArray,
      amounts: amountArray,
      adjustedForInflation: inflationAdjustedArray
    };
  }
  // Create a new simulation
  const handleCreateSimulation = () => {
    const newSimulation = {
      name: simulationName,
      params: {
        name: simulationName,
        incomeGrowth,
        expenseReduction,
        savingsRate,
        investmentReturn,
        inflationRate,
        years
      },
      results: runSimulation({
        name: simulationName,
        incomeGrowth,
        expenseReduction,
        savingsRate,
        investmentReturn,
        inflationRate,
        years
      })
    };
    setSimulations([...simulations, newSimulation]);
    setActiveSimulation(newSimulation.name);
    toast.success('Simulation créée avec succès');
    // Reset form
    setSimulationName(`Simulation ${simulations.length + 2}`);
  };
  // Delete simulation
  const handleDeleteSimulation = (name: string) => {
    const filteredSimulations = simulations.filter(sim => sim.name !== name);
    setSimulations(filteredSimulations);
    if (activeSimulation === name) {
      setActiveSimulation(filteredSimulations.length > 0 ? filteredSimulations[0].name : null);
    }
    toast.success('Simulation supprimée');
  };
  // Delete goal
  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    toast.success('Objectif supprimé');
  };
  // Duplicate simulation
  const handleDuplicateSimulation = (simulation: any) => {
    const newName = `${simulation.name} (copie)`;
    const duplicate = {
      ...simulation,
      name: newName,
      params: {
        ...simulation.params,
        name: newName
      }
    };
    setSimulations([...simulations, duplicate]);
    setActiveSimulation(newName);
    toast.success('Simulation dupliquée');
  };
  // Enhanced export chart function with better error handling and PDF support
  const handleExportChart = async (format = 'png') => {
    try {
      setExportLoading(true);
      const element = document.getElementById('simulation-chart');
      if (!element) {
        toast.error("Impossible d'exporter le graphique");
        setExportLoading(false);
        return;
      }
      if (format === 'png') {
        const dataUrl = await toPng(element, {
          quality: 0.95,
          pixelRatio: 2 // Higher resolution
        });
        // Create download link
        const link = document.createElement('a');
        link.download = `simulation-${activeSimulation || 'chart'}.png`;
        link.href = dataUrl;
        link.click();
        setExportLoading(false);
        toast.success('Graphique exporté avec succès');
      } else if (format === 'pdf') {
        // Simulate PDF export (in a real app, you would use a PDF library)
        setTimeout(() => {
          setExportLoading(false);
          toast.success('PDF exporté avec succès');
        }, 1500);
      }
    } catch (error) {
      console.error('Error exporting chart:', error);
      toast.error("Erreur lors de l'exportation");
      setExportLoading(false);
    }
  };
  // Function to safely calculate net worth
  const calculateNetWorth = () => {
    try {
      return calculateNetWorthFromContext();
    } catch (error) {
      console.error('Error calculating net worth:', error);
      return 0;
    }
  };
  // Get active simulation data
  const activeSimulationData = simulations.find(sim => sim.name === activeSimulation);
  // Get active scenario data
  const activeScenarioData = scenarios.find(scenario => scenario.name === activeScenario);
  // Prepare data for comparison chart
  const prepareComparisonData = () => {
    if (simulations.length === 0) return [];
    const years = simulations[0].results.years;
    return years.map((year, i) => {
      const dataPoint: any = {
        year
      };
      simulations.forEach(sim => {
        dataPoint[`${sim.name}`] = sim.results.netWorth[i];
      });
      return dataPoint;
    });
  };
  // Update prepareScenarioData with better validation
  const prepareScenarioData = () => {
    // Guard against undefined scenarios
    if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
      return [];
    }
    // Find first valid scenario with years data
    const firstValidScenario = scenarios.find(s => s?.results?.years && Array.isArray(s.results.years));
    // If no valid scenario found, return empty array
    if (!firstValidScenario) {
      return [];
    }
    // Get years from first valid scenario
    const years = firstValidScenario.results.years;
    // Create data points with validation
    return years.map((year, i) => {
      const dataPoint = {
        year
      };
      // Safely add scenario data
      scenarios.forEach(scenario => {
        if (scenario?.name && scenario?.results?.netWorth && Array.isArray(scenario.results.netWorth) && typeof scenario.results.netWorth[i] === 'number') {
          dataPoint[scenario.name] = scenario.results.netWorth[i];
        }
      });
      return dataPoint;
    });
  };
  // Update the goals state initialization with proper typing and default value
  const handleAddGoal = (newGoal: GoalSimulation) => {
    if (!newGoal.results || !newGoal.results.years || !newGoal.results.amounts) {
      console.error('Invalid goal data:', newGoal);
      return;
    }
    setGoals(prevGoals => [...prevGoals, newGoal]);
  };
  // Create a new goal
  const handleCreateGoal = () => {
    if (!goalName) {
      toast.error('Veuillez donner un nom à votre objectif');
      return;
    }
    const results = calculateGoalResults(targetAmount, currentAmount, monthlyContribution, goalInterestRate, goalInflationRate, goalYears);
    const newGoal: GoalSimulation = {
      id: Date.now().toString(),
      name: goalName,
      targetAmount,
      currentAmount,
      monthlyContribution,
      interestRate: goalInterestRate,
      inflationRate: goalInflationRate,
      years: goalYears,
      results
    };
    handleAddGoal(newGoal);
    toast.success('Objectif créé avec succès');
    // Reset form
    setGoalName('');
    setTargetAmount(10000);
    setCurrentAmount(0);
    setMonthlyContribution(200);
  };
  // Update renderScenariosSection function with proper error handling
  const renderScenariosSection = () => {
    // Add strict type checking and initialization check
    if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
      return <div className="h-full flex items-center justify-center">
          <p className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
            Aucun scénario disponible
          </p>
        </div>;
    }
    // Ensure scenarioData exists and is valid
    const scenarioData = prepareScenarioData();
    if (!scenarioData || !Array.isArray(scenarioData) || scenarioData.length === 0) {
      return <div className="h-full flex items-center justify-center">
          <p className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
            Données de scénario invalides
          </p>
        </div>;
    }
    return <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={scenarioData} margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0
      }}>
          {Array.isArray(scenarios) && scenarios.map((scenario, index) => {
          if (!scenario?.name || !scenario?.results?.netWorth) return null;
          return <Area key={scenario.name} type="monotone" dataKey={scenario.name} name={scenario.name} stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.3} />;
        })}
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="year" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, '']} contentStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px'
        }} />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>;
  };
  const comparisonData = prepareComparisonData();
  const scenarioData = prepareScenarioData();
  // Chart colors
  const COLORS = themeColors.chartColors;
  // Guard clause for chart rendering
  const renderChart = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div className="h-full flex items-center justify-center">
          <p className={`text-sm ${themeColors.textSecondary}`}>
            Aucune donnée disponible
          </p>
        </div>;
    }
    return <ResponsiveContainer width="100%" height="100%">
        {/* ... existing chart code ... */}
      </ResponsiveContainer>;
  };
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Simulations Financières</h1>
            <p className={`${themeColors.textSecondary}`}>
              Explorez différents scénarios pour votre avenir financier
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setComparisonMode(!comparisonMode)} className={`bg-black/30 hover:bg-black/40 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300`}>
              <BarChart3Icon className="mr-2 h-4 w-4" />
              {comparisonMode ? 'Mode individuel' : 'Mode comparaison'}
            </button>
            <button onClick={handleExportChart} disabled={exportLoading} className={`bg-black/30 hover:bg-black/40 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${exportLoading ? 'opacity-50' : ''}`}>
              {exportLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <DownloadIcon className="mr-2 h-4 w-4" />}
              Exporter
            </button>
            <button onClick={() => navigate('/dashboard')} className={`bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300`}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Sauvegarder
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="bg-black/20 p-1 rounded-full flex mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('wealth')} className={`flex-1 py-2 px-4 rounded-full text-sm whitespace-nowrap ${activeTab === 'wealth' ? `bg-gradient-to-r ${themeColors.primary} text-white` : 'hover:bg-black/20'}`}>
            <TrendingUpIcon className="h-4 w-4 inline mr-1.5" />
            Patrimoine
          </button>
          <button onClick={() => setActiveTab('goals')} className={`flex-1 py-2 px-4 rounded-full text-sm whitespace-nowrap ${activeTab === 'goals' ? `bg-gradient-to-r ${themeColors.primary} text-white` : 'hover:bg-black/20'}`}>
            <TargetIcon className="h-4 w-4 inline mr-1.5" />
            Objectifs
          </button>
          <button onClick={() => setActiveTab('scenarios')} className={`flex-1 py-2 px-4 rounded-full text-sm whitespace-nowrap ${activeTab === 'scenarios' ? `bg-gradient-to-r ${themeColors.primary} text-white` : 'hover:bg-black/20'}`}>
            <BarChart3Icon className="h-4 w-4 inline mr-1.5" />
            Scénarios
          </button>
          <button onClick={() => setActiveTab('custom')} className={`flex-1 py-2 px-4 rounded-full text-sm whitespace-nowrap ${activeTab === 'custom' ? `bg-gradient-to-r ${themeColors.primary} text-white` : 'hover:bg-black/20'}`}>
            <SettingsIcon className="h-4 w-4 inline mr-1.5" />
            Personnalisée
          </button>
        </div>
      </motion.div>
      {/* Wealth Projection Tab */}
      {activeTab === 'wealth' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <GlassCard className="p-4" animate>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <LineChartIcon className="h-5 w-5 mr-2 text-indigo-400" />
                  {comparisonMode ? 'Comparaison des scénarios' : activeSimulationData ? activeSimulationData.name : 'Sélectionnez une simulation'}
                </h3>
                <div className="flex items-center space-x-2">
                  <button onClick={handleExportChart} disabled={exportLoading} className="text-xs bg-black/20 p-1.5 rounded-lg">
                    {exportLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <DownloadIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="h-80" id="simulation-chart">
                {isLoading ? <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div> : comparisonMode ? <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={comparisonData} margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0
              }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, '']} labelFormatter={label => `Année ${label}`} contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }} />
                      <Legend />
                      {simulations.map((sim, index) => <Area key={sim.name} type="monotone" dataKey={sim.name} name={sim.name} stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.3} />)}
                    </AreaChart>
                  </ResponsiveContainer> : activeSimulationData ? <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeSimulationData.results.years.map((year, i) => ({
                year,
                netWorth: activeSimulationData.results.netWorth[i],
                savings: activeSimulationData.results.savings[i],
                income: activeSimulationData.results.income[i],
                expenses: activeSimulationData.results.expenses[i],
                netWorthAdjusted: includeInflation ? activeSimulationData.results.netWorth[i] / Math.pow(1 + activeSimulationData.params.inflationRate / 100, i) : activeSimulationData.results.netWorth[i]
              }))} margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, '']} labelFormatter={label => `Année ${label}`} contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }} />
                      <Legend />
                      <Line type="monotone" dataKey="netWorth" name="Patrimoine net" stroke={COLORS[0]} activeDot={{
                  r: 8
                }} strokeWidth={2} />
                      {includeInflation && <Line type="monotone" dataKey="netWorthAdjusted" name="Ajusté à l'inflation" stroke={COLORS[1]} strokeDasharray="5 5" />}
                      <Line type="monotone" dataKey="savings" name="Épargne" stroke={COLORS[2]} />
                      <Line type="monotone" dataKey="income" name="Revenus" stroke={COLORS[3]} />
                      <Line type="monotone" dataKey="expenses" name="Dépenses" stroke={COLORS[4]} />
                    </LineChart>
                  </ResponsiveContainer> : <div className="h-full flex items-center justify-center">
                    <p className={`text-sm ${themeColors.textSecondary}`}>
                      Sélectionnez une simulation pour afficher les résultats
                    </p>
                  </div>}
              </div>
              {activeSimulationData && !comparisonMode && <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className={`text-xs ${themeColors.textSecondary} mb-1`}>
                      Patrimoine à {activeSimulationData.params.years} ans
                    </div>
                    <div className="text-lg font-bold text-indigo-400">
                      {activeSimulationData.results.netWorth[activeSimulationData.results.netWorth.length - 1].toLocaleString('fr-FR')}
                      €
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className={`text-xs ${themeColors.textSecondary} mb-1`}>
                      Épargne accumulée
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      {activeSimulationData.results.savings[activeSimulationData.results.savings.length - 1].toLocaleString('fr-FR')}
                      €
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className={`text-xs ${themeColors.textSecondary} mb-1`}>
                      Revenu final
                    </div>
                    <div className="text-lg font-bold text-yellow-400">
                      {activeSimulationData.results.income[activeSimulationData.results.income.length - 1].toLocaleString('fr-FR')}
                      €
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <div className={`text-xs ${themeColors.textSecondary} mb-1`}>
                      Dépenses finales
                    </div>
                    <div className="text-lg font-bold text-red-400">
                      {activeSimulationData.results.expenses[activeSimulationData.results.expenses.length - 1].toLocaleString('fr-FR')}
                      €
                    </div>
                  </div>
                </div>}
              {comparisonMode && <div className="mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-2 text-left">Scénario</th>
                        <th className="pb-2 text-right">Patrimoine final</th>
                        <th className="pb-2 text-right">Croissance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulations.map((sim, index) => <tr key={sim.name} className="border-b border-white/5">
                          <td className="py-2 flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{
                      backgroundColor: COLORS[index % COLORS.length]
                    }}></span>
                            {sim.name}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {sim.results.netWorth[sim.results.netWorth.length - 1].toLocaleString('fr-FR')}
                            €
                          </td>
                          <td className="py-2 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${sim.results.netWorth[sim.results.netWorth.length - 1] > sim.results.netWorth[0] * 2 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                              {((sim.results.netWorth[sim.results.netWorth.length - 1] / sim.results.netWorth[0] - 1) * 100).toFixed(0)}
                              %
                            </span>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>}
              <div className="mt-4 flex justify-between">
                <div className="flex items-center">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" checked={includeInflation} onChange={e => setIncludeInflation(e.target.checked)} className="mr-2 rounded bg-black/20 border-white/10 text-indigo-600" />
                    Afficher l'impact de l'inflation
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/reports')} className={`px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/40 text-xs flex items-center`}>
                    <BarChart3Icon className="h-3 w-3 mr-1" />
                    Voir les rapports
                  </button>
                  <button onClick={() => navigate('/reveal')} className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-xs flex items-center`}>
                    <InfoIcon className="h-3 w-3 mr-1" />
                    Insights
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
          {/* Simulations list */}
          <div>
            <GlassCard className="p-4 mb-6" animate>
              <h3 className="font-medium mb-3">Mes simulations</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {simulations && simulations.length > 0 && simulations.map(sim => <div key={sim.name} onClick={() => setActiveSimulation(sim.name)} className={`p-3 rounded-lg cursor-pointer ${activeSimulation === sim.name ? `bg-gradient-to-r ${themeColors.primary} bg-opacity-30` : 'bg-black/20 hover:bg-black/30'}`}>
                      <div className="flex items-center">
                        <LineChartIcon className="h-4 w-4 mr-2 text-indigo-400" />
                        <span>{sim.name}</span>
                      </div>
                      <div className="flex">
                        <button onClick={e => {
                  e.stopPropagation();
                  handleDuplicateSimulation(sim);
                }} className="p-1 hover:bg-black/20 rounded-full mr-1">
                          <CopyIcon className="h-4 w-4 text-gray-400" />
                        </button>
                        <button onClick={e => {
                  e.stopPropagation();
                  handleDeleteSimulation(sim.name);
                }} className="p-1 hover:bg-black/20 rounded-full">
                          <TrashIcon className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>)}
              </div>
            </GlassCard>
            {/* Simulation parameters */}
            {activeSimulationData && <GlassCard className="p-4 mb-6" animate>
                <h3 className="font-medium mb-3">
                  Paramètres de la simulation
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ArrowUpIcon className="h-4 w-4 mr-2 text-green-400" />
                      <span>Croissance des revenus</span>
                    </div>
                    <span className="font-medium">
                      {activeSimulationData.params.incomeGrowth}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ArrowDownIcon className="h-4 w-4 mr-2 text-red-400" />
                      <span>Réduction des dépenses</span>
                    </div>
                    <span className="font-medium">
                      {activeSimulationData.params.expenseReduction}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <PiggyBankIcon className="h-4 w-4 mr-2 text-blue-400" />
                      <span>Taux d'épargne</span>
                    </div>
                    <span className="font-medium">
                      {activeSimulationData.params.savingsRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <TrendingUpIcon className="h-4 w-4 mr-2 text-purple-400" />
                      <span>Rendement des investissements</span>
                    </div>
                    <span className="font-medium">
                      {activeSimulationData.params.investmentReturn}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <TrendingDownIcon className="h-4 w-4 mr-2 text-yellow-400" />
                      <span>Taux d'inflation</span>
                    </div>
                    <span className="font-medium">
                      {activeSimulationData.params.inflationRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-cyan-400" />
                      <span>Horizon</span>
                    </div>
                    <span className="font-medium">
                      {activeSimulationData.params.years} ans
                    </span>
                  </div>
                </div>
              </GlassCard>}
            {/* Create new simulation */}
            <GlassCard className="p-4" animate>
              <h3 className="font-medium mb-4 flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer une simulation
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nom de la simulation
                  </label>
                  <input type="text" value={simulationName} onChange={e => setSimulationName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Croissance des revenus (%)
                    <span className="float-right text-xs text-gray-400">
                      {incomeGrowth}%
                    </span>
                  </label>
                  <input type="range" min="0" max="10" step="0.1" value={incomeGrowth} onChange={e => setIncomeGrowth(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>5%</span>
                    <span>10%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Réduction des dépenses (%)
                    <span className="float-right text-xs text-gray-400">
                      {expenseReduction}%
                    </span>
                  </label>
                  <input type="range" min="0" max="5" step="0.1" value={expenseReduction} onChange={e => setExpenseReduction(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>2.5%</span>
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Taux d'épargne (%)
                    <span className="float-right text-xs text-gray-400">
                      {savingsRate}%
                    </span>
                  </label>
                  <input type="range" min="0" max="100" step="5" value={savingsRate} onChange={e => setSavingsRate(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rendement des investissements (%)
                    <span className="float-right text-xs text-gray-400">
                      {investmentReturn}%
                    </span>
                  </label>
                  <input type="range" min="0" max="12" step="0.5" value={investmentReturn} onChange={e => setInvestmentReturn(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>6%</span>
                    <span>12%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Taux d'inflation (%)
                    <span className="float-right text-xs text-gray-400">
                      {inflationRate}%
                    </span>
                  </label>
                  <input type="range" min="0" max="5" step="0.1" value={inflationRate} onChange={e => setInflationRate(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>2.5%</span>
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Horizon (années)
                    <span className="float-right text-xs text-gray-400">
                      {years} ans
                    </span>
                  </label>
                  <input type="range" min="1" max="40" value={years} onChange={e => setYears(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1 an</span>
                    <span>20 ans</span>
                    <span>40 ans</span>
                  </div>
                </div>
                <button onClick={handleCreateSimulation} className={`w-full bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-white py-2 rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Créer cette simulation
                </button>
              </div>
            </GlassCard>
          </div>
        </div>}
      {/* Goals Tab */}
      {activeTab === 'goals' && goals && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals chart */}
          <div className="lg:col-span-2">
            <GlassCard className="p-4 mb-6" animate>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <TargetIcon className="h-5 w-5 mr-2 text-green-400" />
                  Objectifs financiers
                </h3>
                <div className="flex items-center">
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full flex items-center">
                    <UnlockIcon className="h-3 w-3 mr-1" />
                    Activé
                  </span>
                </div>
              </div>
              <div className="h-80" id="simulation-chart">
                {isLoading ? <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div> : goals && Array.isArray(goals) && goals.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} stroke="#aaa" allowDuplicatedCategory={false} />
                      <YAxis stroke="#aaa" />
                      <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, '']} contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }} />
                      <Legend />
                      {goals.map((goal, index) => {
                  if (!goal?.results?.years || !goal?.results?.amounts) return null;
                  return <Line key={`${goal.id}-amount`} data={goal.results.years.map((year, i) => ({
                    year,
                    [goal.name]: goal.results.amounts[i]
                  }))} type="monotone" dataKey={goal.name} name={goal.name} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={{
                    r: 4
                  }} activeDot={{
                    r: 6
                  }} />;
                })}
                      {goals.map((goal, index) => {
                  if (!goal?.targetAmount) return null;
                  return <ReferenceLine key={`${goal.id}-target`} y={goal.targetAmount} stroke={COLORS[index % COLORS.length]} strokeDasharray="3 3" label={{
                    value: `${goal.name} - Objectif: ${goal.targetAmount.toLocaleString('fr-FR')}€`,
                    position: 'insideBottomRight',
                    fill: COLORS[index % COLORS.length]
                  }} />;
                })}
                    </LineChart>
                  </ResponsiveContainer> : <div className="h-full flex items-center justify-center">
                    <p className={`text-sm ${themeColors.textSecondary}`}>
                      Aucun objectif défini. Créez votre premier objectif
                      financier.
                    </p>
                  </div>}
              </div>
            </GlassCard>
            {/* Goals list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal, index) => <GlassCard key={goal.id} className="p-4" animate variant={goal.results.amounts[goal.results.amounts.length - 1] >= goal.targetAmount ? 'success' : goal.results.amounts[goal.results.amounts.length - 1] >= goal.targetAmount * 0.7 ? 'primary' : 'default'}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{goal.name}</h3>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="p-1 hover:bg-black/20 rounded-full">
                      <TrashIcon className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression:</span>
                      <span className="font-medium">
                        {goal.currentAmount.toLocaleString('fr-FR')}€ /{' '}
                        {goal.targetAmount.toLocaleString('fr-FR')}€
                      </span>
                    </div>
                    <div className="w-full bg-black/30 h-2 rounded-full">
                      <div className={`h-2 rounded-full ${goal.currentAmount / goal.targetAmount >= 0.7 ? 'bg-green-500' : goal.currentAmount / goal.targetAmount >= 0.3 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{
                  width: `${goal.currentAmount / goal.targetAmount * 100}%`
                }}></div>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className={themeColors.textSecondary}>
                        Contribution mensuelle:
                      </span>
                      <span>
                        {goal.monthlyContribution.toLocaleString('fr-FR')}€
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={themeColors.textSecondary}>
                        Taux d'intérêt:
                      </span>
                      <span>{goal.interestRate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={themeColors.textSecondary}>
                        Horizon:
                      </span>
                      <span>{goal.years} ans</span>
                    </div>
                  </div>
                  <div className="bg-black/20 p-2 rounded-lg text-center">
                    <div className="text-xs mb-1">Montant final estimé</div>
                    <div className="text-lg font-bold">
                      {goal.results.amounts[goal.results.amounts.length - 1].toLocaleString('fr-FR')}
                      €
                    </div>
                    {goal.results.amounts[goal.results.amounts.length - 1] >= goal.targetAmount ? <div className="text-xs text-green-400 mt-1">
                        <CheckIcon className="h-3 w-3 inline mr-1" />
                        Objectif atteint
                      </div> : <div className="text-xs text-yellow-400 mt-1">
                        {Math.max(0, Math.ceil((goal.targetAmount - goal.currentAmount) / (goal.monthlyContribution * 12)))}{' '}
                        années restantes
                      </div>}
                  </div>
                </GlassCard>)}
            </div>
          </div>
          {/* Create goal form */}
          <div>
            <GlassCard className="p-4" animate>
              <h3 className="font-medium mb-4 flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer un nouvel objectif
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nom de l'objectif
                  </label>
                  <input type="text" value={goalName} onChange={e => setGoalName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" placeholder="Ex: Fonds d'urgence, Voyage, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Montant cible (€)
                  </label>
                  <div className="relative">
                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 pr-8 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">€</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Montant déjà épargné (€)
                  </label>
                  <div className="relative">
                    <input type="number" value={currentAmount} onChange={e => setCurrentAmount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 pr-8 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">€</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contribution mensuelle (€)
                  </label>
                  <div className="relative">
                    <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 pr-8 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">€</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Taux d'intérêt (%)
                    <span className="float-right text-xs text-gray-400">
                      {goalInterestRate}%
                    </span>
                  </label>
                  <input type="range" min="0" max="10" step="0.1" value={goalInterestRate} onChange={e => setGoalInterestRate(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>5%</span>
                    <span>10%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Taux d'inflation (%)
                    <span className="float-right text-xs text-gray-400">
                      {goalInflationRate}%
                    </span>
                  </label>
                  <input type="range" min="0" max="5" step="0.1" value={goalInflationRate} onChange={e => setGoalInflationRate(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>2.5%</span>
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Horizon (années)
                    <span className="float-right text-xs text-gray-400">
                      {goalYears} ans
                    </span>
                  </label>
                  <input type="range" min="1" max="20" value={goalYears} onChange={e => setGoalYears(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1 an</span>
                    <span>10 ans</span>
                    <span>20 ans</span>
                  </div>
                </div>
                {/* Goal summary */}
                <div className="bg-black/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    Résumé de l'objectif
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Montant final estimé:</span>
                      <span className="font-medium">
                        {calculateGoalResults(targetAmount, currentAmount, monthlyContribution, goalInterestRate, goalInflationRate, goalYears).amounts[goalYears].toLocaleString('fr-FR')}
                        €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valeur réelle (ajustée à l'inflation):</span>
                      <span className="font-medium">
                        {calculateGoalResults(targetAmount, currentAmount, monthlyContribution, goalInterestRate, goalInflationRate, goalYears).adjustedForInflation[goalYears].toLocaleString('fr-FR')}
                        €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total des contributions:</span>
                      <span>
                        {(currentAmount + monthlyContribution * 12 * goalYears).toLocaleString('fr-FR')}
                        €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Intérêts gagnés:</span>
                      <span className="text-green-400">
                        {(calculateGoalResults(targetAmount, currentAmount, monthlyContribution, goalInterestRate, goalInflationRate, goalYears).amounts[goalYears] - (currentAmount + monthlyContribution * 12 * goalYears)).toLocaleString('fr-FR')}
                        €
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={handleCreateGoal} className={`w-full bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-white py-2 rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Créer cet objectif
                </button>
              </div>
            </GlassCard>
            {/* Goal categories */}
            <GlassCard className="p-4 mt-6" animate>
              <h3 className="font-medium mb-3">Objectifs courants</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
              setGoalName("Fonds d'urgence");
              setTargetAmount(10000);
              setCurrentAmount(1000);
              setMonthlyContribution(300);
              setGoalYears(3);
            }} className="flex items-center p-3 bg-black/20 hover:bg-black/30 rounded-lg">
                  <AlertCircleIcon className="h-5 w-5 mr-3 text-red-400" />
                  <div className="text-left">
                    <div className="font-medium">Fonds d'urgence</div>
                    <div className="text-xs text-gray-400">
                      3-6 mois de dépenses
                    </div>
                  </div>
                </button>
                <button onClick={() => {
              setGoalName('Apport immobilier');
              setTargetAmount(50000);
              setCurrentAmount(5000);
              setMonthlyContribution(600);
              setGoalYears(5);
            }} className="flex items-center p-3 bg-black/20 hover:bg-black/30 rounded-lg">
                  <HomeIcon className="h-5 w-5 mr-3 text-blue-400" />
                  <div className="text-left">
                    <div className="font-medium">Apport immobilier</div>
                    <div className="text-xs text-gray-400">10-20% du prix</div>
                  </div>
                </button>
                <button onClick={() => {
              setGoalName('Études');
              setTargetAmount(20000);
              setCurrentAmount(2000);
              setMonthlyContribution(300);
              setGoalYears(5);
            }} className="flex items-center p-3 bg-black/20 hover:bg-black/30 rounded-lg">
                  <GraduationCapIcon className="h-5 w-5 mr-3 text-green-400" />
                  <div className="text-left">
                    <div className="font-medium">Études</div>
                    <div className="text-xs text-gray-400">
                      Formation, études
                    </div>
                  </div>
                </button>
                <button onClick={() => {
              setGoalName('Retraite');
              setTargetAmount(500000);
              setCurrentAmount(20000);
              setMonthlyContribution(500);
              setGoalYears(20);
            }} className="flex items-center p-3 bg-black/20 hover:bg-black/30 rounded-lg">
                  <HeartIcon className="h-5 w-5 mr-3 text-purple-400" />
                  <div className="text-left">
                    <div className="font-medium">Retraite</div>
                    <div className="text-xs text-gray-400">
                      Épargne long terme
                    </div>
                  </div>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>}
      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-4 mb-6" animate>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <BarChart3Icon className="h-5 w-5 mr-2 text-purple-400" />
                  Comparaison des scénarios
                </h3>
                <div className="flex items-center">
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full flex items-center">
                    <LockIcon className="h-3 w-3 mr-1" />
                    Premium
                  </span>
                </div>
              </div>
              <div className="h-80" id="simulation-chart">
                {isLoading ? <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div> : renderScenariosSection()}
              </div>
              <div className="mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-2 text-left">Scénario</th>
                      <th className="pb-2 text-right">Patrimoine final</th>
                      <th className="pb-2 text-right">Croissance</th>
                      <th className="pb-2 text-right">Vs. Base</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((scenario, index) => {
                  const finalValue = scenario.results.netWorth[scenario.results.netWorth.length - 1];
                  const initialValue = scenario.results.netWorth[0];
                  const growth = ((finalValue / initialValue - 1) * 100).toFixed(0);
                  // Calculate difference from base scenario
                  const baseScenario = scenarios.find(s => s.name === 'Situation actuelle');
                  const baseFinalValue = baseScenario ? baseScenario.results.netWorth[baseScenario.results.netWorth.length - 1] : 0;
                  const diffFromBase = finalValue - baseFinalValue;
                  const diffPercent = baseFinalValue ? (diffFromBase / baseFinalValue * 100).toFixed(0) : '0';
                  return <tr key={scenario.name} className={`border-b border-white/5 ${activeScenario === scenario.name ? 'bg-white/5' : ''}`} onClick={() => setActiveScenario(scenario.name)}>
                          <td className="py-2 flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{
                        backgroundColor: COLORS[index % COLORS.length]
                      }}></span>
                            {scenario.name}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {finalValue.toLocaleString('fr-FR')}€
                          </td>
                          <td className="py-2 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${parseInt(growth) > 50 ? 'bg-green-500/20 text-green-300' : parseInt(growth) > 20 ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                              +{growth}%
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            {scenario.name === 'Situation actuelle' ? <span className="text-gray-400">-</span> : <span className={`px-2 py-0.5 rounded-full text-xs ${diffFromBase > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {diffFromBase > 0 ? '+' : ''}
                                {diffPercent}%
                              </span>}
                          </td>
                        </tr>;
                })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            {/* Selected scenario details */}
            {activeScenarioData && <GlassCard className="p-4" animate>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{activeScenarioData.name}</h3>
                  <div className="text-xs bg-black/20 px-2 py-1 rounded-full">
                    Horizon: {activeScenarioData.params.years} ans
                  </div>
                </div>
                <p className="text-sm mb-4">{activeScenarioData.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/20 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      Paramètres clés
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <ArrowUpIcon className="h-4 w-4 mr-2 text-green-400" />
                          <span>Croissance des revenus</span>
                        </div>
                        <span>{activeScenarioData.params.incomeGrowth}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <ArrowDownIcon className="h-4 w-4 mr-2 text-red-400" />
                          <span>Réduction des dépenses</span>
                        </div>
                        <span>
                          {activeScenarioData.params.expenseReduction}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <PiggyBankIcon className="h-4 w-4 mr-2 text-blue-400" />
                          <span>Taux d'épargne</span>
                        </div>
                        <span>{activeScenarioData.params.savingsRate}%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <TrendingUpIcon className="h-4 w-4 mr-2 text-purple-400" />
                          <span>Rendement des investissements</span>
                        </div>
                        <span>
                          {activeScenarioData.params.investmentReturn}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Résultats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Patrimoine initial:</span>
                        <span>
                          {activeScenarioData.results.netWorth[0].toLocaleString('fr-FR')}
                          €
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Patrimoine final:</span>
                        <span className="font-medium">
                          {activeScenarioData.results.netWorth[activeScenarioData.results.netWorth.length - 1].toLocaleString('fr-FR')}
                          €
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Croissance:</span>
                        <span className="text-green-400">
                          {((activeScenarioData.results.netWorth[activeScenarioData.results.netWorth.length - 1] / activeScenarioData.results.netWorth[0] - 1) * 100).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Revenu mensuel final:</span>
                        <span>
                          {activeScenarioData.results.income[activeScenarioData.results.income.length - 1].toLocaleString('fr-FR')}
                          €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    Actions recommandées
                  </h4>
                  <ul className="space-y-2">
                    {activeScenarioData.name === 'Situation actuelle' && <>
                        <li className="flex items-start text-sm">
                          <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-400" />
                          <span>
                            Continuez avec votre plan financier actuel tout en
                            explorant d'autres scénarios pour améliorer vos
                            résultats.
                          </span>
                        </li>
                      </>}
                    {activeScenarioData.name === 'Réduction des dépenses' && <>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Identifiez les dépenses non essentielles et
                            établissez un budget plus strict.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Utilisez des outils de suivi des dépenses pour
                            identifier les domaines d'optimisation.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Renégociez vos contrats d'assurance, de téléphonie
                            et d'énergie.
                          </span>
                        </li>
                      </>}
                    {activeScenarioData.name === 'Augmentation des revenus' && <>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Développez vos compétences pour demander une
                            augmentation ou une promotion.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Explorez des opportunités de revenus complémentaires
                            ou de freelance.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Investissez dans votre formation pour accéder à des
                            postes mieux rémunérés.
                          </span>
                        </li>
                      </>}
                    {activeScenarioData.name === 'Investissements optimisés' && <>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Diversifiez vos placements entre actions,
                            obligations et immobilier.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Réduisez les frais de gestion en privilégiant les
                            ETF à faibles coûts.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Automatisez vos investissements pour maintenir une
                            discipline d'épargne.
                          </span>
                        </li>
                      </>}
                    {activeScenarioData.name === 'Stratégie combinée' && <>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Appliquez simultanément les stratégies de réduction
                            des dépenses et d'optimisation des investissements.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Augmentez progressivement votre taux d'épargne en
                            affectant les gains de revenus à l'épargne.
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-green-400" />
                          <span>
                            Consultez un conseiller financier pour élaborer un
                            plan personnalisé.
                          </span>
                        </li>
                      </>}
                  </ul>
                </div>
              </GlassCard>}
          </div>
          {/* Scenarios list and info */}
          <div>
            <GlassCard className="p-4 mb-6" animate>
              <h3 className="font-medium mb-3">Scénarios financiers</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scenarios.map(scenario => <div key={scenario.name} onClick={() => setActiveScenario(scenario.name)} className={`p-3 rounded-lg cursor-pointer ${activeScenario === scenario.name ? `bg-gradient-to-r ${themeColors.primary} bg-opacity-30` : 'bg-black/20 hover:bg-black/30'}`}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {scenario.description}
                    </p>
                  </div>)}
              </div>
            </GlassCard>
            <GlassCard className="p-4" animate>
              <div className="flex items-center mb-3">
                <InfoIcon className="h-5 w-5 mr-2 text-blue-400" />
                <h3 className="font-medium">À propos des scénarios</h3>
              </div>
              <p className="text-sm mb-4">
                Les scénarios financiers vous permettent de comparer différentes
                stratégies et leur impact sur votre patrimoine à long terme.
              </p>
              <div className="space-y-4">
                <div className="bg-black/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">
                    Situation actuelle
                  </h4>
                  <p className="text-xs text-gray-400">
                    Ce scénario projette votre situation financière actuelle
                    sans changements majeurs dans vos habitudes.
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">
                    Réduction des dépenses
                  </h4>
                  <p className="text-xs text-gray-400">
                    Ce scénario montre l'impact d'une réduction significative de
                    vos dépenses tout en maintenant vos revenus actuels.
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">
                    Augmentation des revenus
                  </h4>
                  <p className="text-xs text-gray-400">
                    Ce scénario illustre l'effet d'une augmentation progressive
                    de vos revenus sur votre patrimoine.
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">
                    Investissements optimisés
                  </h4>
                  <p className="text-xs text-gray-400">
                    Ce scénario montre l'impact d'une stratégie d'investissement
                    plus performante sur votre patrimoine.
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">
                    Stratégie combinée
                  </h4>
                  <p className="text-xs text-gray-400">
                    Ce scénario combine plusieurs approches pour maximiser la
                    croissance de votre patrimoine.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button onClick={() => navigate('/reveal')} className={`px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/40 text-xs flex items-center`}>
                  <InfoIcon className="h-3 w-3 mr-1" />
                  Insights financiers
                </button>
                <button onClick={() => navigate('/settings')} className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-xs flex items-center`}>
                  <SaveIcon className="h-3 w-3 mr-1" />
                  Sauvegarder
                </button>
              </div>
            </GlassCard>
          </div>
        </div>}
      {/* Custom Simulation Tab */}
      {activeTab === 'custom' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-4 mb-6" animate>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2 text-indigo-400" />
                  Simulation personnalisée avancée
                </h3>
                <div className="flex items-center">
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full flex items-center">
                    <LockIcon className="h-3 w-3 mr-1" />
                    Premium
                  </span>
                </div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2">Âge actuel</h4>
                    <div className="flex items-center">
                      <input type="range" min="18" max="70" value={currentAge} onChange={e => setCurrentAge(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
                      <span className="ml-3 w-8 text-center">{currentAge}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2">
                      Âge de retraite
                    </h4>
                    <div className="flex items-center">
                      <input type="range" min={currentAge + 1} max="75" value={retirementAge} onChange={e => setRetirementAge(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
                      <span className="ml-3 w-8 text-center">
                        {retirementAge}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      Années avant retraite
                    </div>
                    <div className="text-xl font-bold">
                      {retirementAge - currentAge}
                    </div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      Revenus mensuels actuels
                    </div>
                    <div className="text-xl font-bold">
                      {calculateTotalIncome().toLocaleString('fr-FR')}€
                    </div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      Dépenses mensuelles
                    </div>
                    <div className="text-xl font-bold">
                      {calculateTotalExpenses().toLocaleString('fr-FR')}€
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-80" id="simulation-chart">
                {isLoading ? <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div> : <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{
                age: currentAge,
                value: calculateNetWorth(),
                savings: calculateNetWorth(),
                pension: 0
              }, {
                age: 30,
                value: 50000,
                savings: 45000,
                pension: 5000
              }, {
                age: 40,
                value: 150000,
                savings: 120000,
                pension: 30000
              }, {
                age: 50,
                value: 350000,
                savings: 250000,
                pension: 100000
              }, {
                age: 60,
                value: 650000,
                savings: 400000,
                pension: 250000
              }, {
                age: 70,
                value: 900000,
                savings: 500000,
                pension: 400000
              }, {
                age: 80,
                value: 750000,
                savings: 350000,
                pension: 400000
              }]} margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0
              }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="age" stroke="#aaa" label={{
                  value: 'Âge',
                  position: 'insideBottomRight',
                  offset: -10
                }} />
                      <YAxis stroke="#aaa" />
                      <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, '']} contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }} />
                      <Legend />
                      <ReferenceLine x={retirementAge} stroke="red" strokeDasharray="3 3" label={{
                  value: 'Retraite',
                  position: 'top',
                  fill: 'red'
                }} />
                      {scenarios.map((scenario, index) => scenario && scenario.name ? <Area key={scenario.name} type="monotone" dataKey={scenario.name} name={scenario.name} stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.3} /> : null)}
                    </AreaChart>
                  </ResponsiveContainer>}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Patrimoine à la retraite
                    </h4>
                    <UnlockIcon className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-xl font-bold mt-2">650 000€</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Détails disponibles
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Revenu mensuel à la retraite
                    </h4>
                    <UnlockIcon className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-xl font-bold mt-2">2 700€</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Détails disponibles
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Taux de remplacement
                    </h4>
                    <UnlockIcon className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-xl font-bold mt-2">68%</div>
                  <div className="text-xs text-gray-400 mt-1">
                    De vos derniers revenus
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg flex items-center">
                <InfoIcon className="h-5 w-5 mr-3 text-yellow-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium">Simulation avancée</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    Accédez à des simulations personnalisées plus détaillées,
                    incluant différents scénarios de retraite, l'impact de
                    l'inflation, et des analyses fiscales avec la version
                    Premium.
                  </p>
                </div>
                <button className={`ml-auto px-3 py-1.5 rounded-lg bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-xs flex-shrink-0`}>
                  Explorer
                </button>
              </div>
            </GlassCard>
            {/* Life events timeline */}
            <GlassCard className="p-4" animate>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-400" />
                  Événements de vie
                </h3>
                <UnlockIcon className="h-4 w-4 text-green-400" />
              </div>
              <div className="relative py-4">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/10 ml-3.5"></div>
                <div className="relative pl-10 pb-8">
                  <div className="absolute left-0 rounded-full bg-blue-500 p-1.5 mt-1.5">
                    <HomeIcon className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Achat immobilier</h4>
                      <p className="text-xs text-gray-400">
                        Acquisition d'une résidence principale
                      </p>
                    </div>
                    <div className="text-sm mt-1 md:mt-0">35 ans</div>
                  </div>
                </div>
                <div className="relative pl-10 pb-8">
                  <div className="absolute left-0 rounded-full bg-green-500 p-1.5 mt-1.5">
                    <GraduationCapIcon className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        Études des enfants
                      </h4>
                      <p className="text-xs text-gray-400">
                        Financement des études supérieures
                      </p>
                    </div>
                    <div className="text-sm mt-1 md:mt-0">45 ans</div>
                  </div>
                </div>
                <div className="relative pl-10 pb-8">
                  <div className="absolute left-0 rounded-full bg-purple-500 p-1.5 mt-1.5">
                    <BriefcaseIcon className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Retraite</h4>
                      <p className="text-xs text-gray-400">
                        Début de la période de retraite
                      </p>
                    </div>
                    <div className="text-sm mt-1 md:mt-0">65 ans</div>
                  </div>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 rounded-full bg-gray-500 p-1.5 mt-1.5">
                    <PlusIcon className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        Ajouter un événement
                      </h4>
                      <p className="text-xs text-gray-400">
                        Ajouter un nouvel événement
                      </p>
                    </div>
                    <div className="text-sm mt-1 md:mt-0">-</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button className={`px-4 py-2 rounded-lg bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-sm`}>
                  Planification avancée
                </button>
              </div>
            </GlassCard>
          </div>
          {/* Advanced parameters */}
          <div>
            <GlassCard className="p-4 mb-6" animate>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Paramètres avancés
                </h3>
                <div className="flex items-center">
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full flex items-center">
                    <UnlockIcon className="h-3 w-3 mr-1" />
                    Activé
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Inflation (%)
                    <span className="float-right text-xs text-gray-400">
                      {inflationRate}%
                    </span>
                  </label>
                  <input type="range" min="0" max="5" step="0.1" value={inflationRate} onChange={e => setInflationRate(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>2.5%</span>
                    <span>5%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rendement avant retraite (%)
                    <span className="float-right text-xs text-gray-400">
                      {investmentReturn}%
                    </span>
                  </label>
                  <input type="range" min="0" max="12" step="0.5" value={investmentReturn} onChange={e => setInvestmentReturn(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>6%</span>
                    <span>12%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rendement après retraite (%)
                    <span className="float-right text-xs text-gray-400">
                      3.0%
                    </span>
                  </label>
                  <input type="range" min="0" max="8" step="0.5" value={3} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>4%</span>
                    <span>8%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Croissance des revenus (%)
                    <span className="float-right text-xs text-gray-400">
                      {incomeGrowth}%
                    </span>
                  </label>
                  <input type="range" min="0" max="10" step="0.1" value={incomeGrowth} onChange={e => setIncomeGrowth(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>5%</span>
                    <span>10%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Taux d'imposition moyen (%)
                    <span className="float-right text-xs text-gray-400">
                      20%
                    </span>
                  </label>
                  <input type="range" min="0" max="50" step="1" value={20} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Espérance de vie
                    <span className="float-right text-xs text-gray-400">
                      85 ans
                    </span>
                  </label>
                  <input type="range" min="70" max="100" step="1" value={85} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>70 ans</span>
                    <span>85 ans</span>
                    <span>100 ans</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button className={`w-full bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-white py-2 rounded-lg flex items-center justify-center transition-all duration-300`}>
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Mettre à jour les paramètres
                </button>
              </div>
            </GlassCard>
            <GlassCard className="p-4 mb-6" animate>
              <div className="flex items-center mb-3">
                <ShareIcon className="h-5 w-5 mr-2 text-blue-400" />
                <h3 className="font-medium">Partager votre simulation</h3>
              </div>
              <div className="space-y-3">
                <button onClick={handleExportChart} disabled={exportLoading} className="w-full p-3 bg-black/20 hover:bg-black/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <DownloadIcon className="h-5 w-5 mr-3 text-green-400" />
                    <span>Exporter en image</span>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </button>
                <button onClick={() => handleExportChart('pdf')} className="w-full p-3 bg-black/20 hover:bg-black/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <DownloadIcon className="h-5 w-5 mr-3 text-purple-400" />
                    <span>Exporter en PDF</span>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full p-3 bg-black/20 hover:bg-black/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <ShareIcon className="h-5 w-5 mr-3 text-blue-400" />
                    <span>Partager par email</span>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </GlassCard>
            <GlassCard className="p-4" animate>
              <div className="flex items-center mb-3">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-green-400" />
                <h3 className="font-medium">Conseils personnalisés</h3>
              </div>
              <p className="text-sm mb-4">
                Basés sur votre situation financière actuelle et vos objectifs à
                long terme.
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 mt-0.5 mr-2 text-green-400" />
                    <p className="text-sm">
                      Augmentez votre taux d'épargne de 5% pour atteindre vos
                      objectifs plus rapidement.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start">
                    <InfoIcon className="h-4 w-4 mt-0.5 mr-2 text-blue-400" />
                    <p className="text-sm">
                      Diversifiez vos investissements pour optimiser le rapport
                      rendement/risque.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-start">
                    <BellRingIcon className="h-4 w-4 mt-0.5 mr-2 text-green-400" />
                    <p className="text-sm">
                      Tous les conseils personnalisés sont disponibles.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button className={`px-4 py-2 rounded-lg bg-gradient-to-r ${themeColors.primary} hover:opacity-90 text-sm`}>
                  Voir plus de conseils
                </button>
              </div>
            </GlassCard>
          </div>
        </div>}
    </div>;
}