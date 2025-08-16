import React, { useEffect, useState, createElement } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SaveIcon, RefreshCwIcon, AlertCircleIcon, DownloadIcon, TrendingUpIcon, TrendingDownIcon, CreditCardIcon, InfoIcon, CheckIcon, XIcon, HomeIcon, BriefcaseIcon, CalendarIcon } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
interface SimulationParams {
  name: string;
  years: number;
  incomeGrowth: number;
  expenseReduction: number;
  savingsRate: number;
  investmentReturn: number;
  inflationRate: number;
  simulationType: 'normal' | 'optimistic' | 'pessimistic' | 'crisis';
}
interface SimulationResult {
  name?: string;
  years: number[];
  income: number[];
  expenses: number[];
  savings: number[];
  netWorth: number[];
  params: SimulationParams;
}
export function FinancialSimulator() {
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    financialData,
    runSimulation,
    calculateTotalIncome,
    calculateTotalExpenses
  } = useFinance();
  // State for simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    name: 'Ma simulation',
    years: 10,
    incomeGrowth: 2,
    expenseReduction: 1,
    savingsRate: 50,
    investmentReturn: 5,
    inflationRate: 2,
    simulationType: 'normal'
  });
  // State for simulation results
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [simulationParams, setSimulationParams] = useState<SimulationParams>(params);
  const [savedSimulations, setSavedSimulations] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  // Predefined scenarios
  const scenarios = [{
    id: 'job-loss',
    name: "Perte d'emploi",
    description: "Simulation d'une perte d'emploi avec 6 mois sans revenus",
    icon: <BriefcaseIcon className="h-5 w-5" />,
    params: {
      ...params,
      simulationType: 'crisis',
      name: "Perte d'emploi"
    },
    crisisFunction: (result: SimulationResult) => {
      const newResult = JSON.parse(JSON.stringify(result));
      const yearIndex = 2;
      if (yearIndex < newResult.income.length) {
        newResult.income[yearIndex] *= 0.3;
        newResult.savings[yearIndex] = Math.max(0, newResult.savings[yearIndex] - newResult.expenses[yearIndex] * 0.7);
        newResult.netWorth[yearIndex] -= newResult.expenses[yearIndex] * 0.7;
      }
      return newResult;
    }
  }, {
    id: 'medical-emergency',
    name: 'Urgence médicale',
    description: 'Simulation des coûts liés à une urgence médicale',
    icon: <AlertCircleIcon className="h-5 w-5" />,
    params: {
      ...params,
      simulationType: 'crisis',
      name: 'Urgence médicale'
    },
    crisisFunction: (result: SimulationResult) => {
      const newResult = JSON.parse(JSON.stringify(result));
      const yearIndex = 1;
      if (yearIndex < newResult.expenses.length) {
        const emergencyCost = calculateTotalIncome() * 6;
        newResult.expenses[yearIndex] += emergencyCost;
        newResult.savings[yearIndex] = Math.max(0, newResult.savings[yearIndex] - emergencyCost);
        newResult.netWorth[yearIndex] -= emergencyCost;
      }
      return newResult;
    }
  }, {
    id: 'inflation-shock',
    name: "Choc d'inflation",
    description: "Simulation d'une forte hausse de l'inflation à 8%",
    icon: <TrendingUpIcon className="h-5 w-5" />,
    params: {
      ...params,
      inflationRate: 8,
      simulationType: 'pessimistic',
      name: "Choc d'inflation"
    }
  }, {
    id: 'interest-rate-rise',
    name: 'Hausse des taux',
    description: "Impact d'une hausse des taux d'intérêt sur les dettes",
    icon: <CreditCardIcon className="h-5 w-5" />,
    params: {
      ...params,
      simulationType: 'pessimistic',
      name: 'Hausse des taux'
    },
    crisisFunction: (result: SimulationResult) => {
      const newResult = JSON.parse(JSON.stringify(result));
      for (let i = 1; i < newResult.expenses.length; i++) {
        const debtImpact = calculateTotalExpenses() * 0.15;
        newResult.expenses[i] += debtImpact;
        newResult.savings[i] = Math.max(0, newResult.savings[i] - debtImpact);
        newResult.netWorth[i] -= debtImpact;
      }
      return newResult;
    }
  }, {
    id: 'housing-purchase',
    name: 'Achat immobilier',
    description: "Simulation d'un achat immobilier avec apport et prêt",
    icon: <HomeIcon className="h-5 w-5" />,
    params: {
      ...params,
      simulationType: 'normal',
      name: 'Achat immobilier'
    },
    crisisFunction: (result: SimulationResult) => {
      const newResult = JSON.parse(JSON.stringify(result));
      const yearIndex = 2;
      if (yearIndex < newResult.expenses.length) {
        const downPayment = calculateTotalIncome() * 24;
        const monthlyPayment = calculateTotalIncome() * 0.33;
        newResult.savings[yearIndex] = Math.max(0, newResult.savings[yearIndex] - downPayment);
        newResult.netWorth[yearIndex] -= downPayment;
        for (let i = yearIndex; i < newResult.expenses.length; i++) {
          newResult.expenses[i] += monthlyPayment * 12;
          const equityBuilt = monthlyPayment * 12 * 0.3;
          newResult.netWorth[i] += equityBuilt;
        }
      }
      return newResult;
    }
  }];
  // Run simulation with current parameters
  const handleRunSimulation = async () => {
    setIsLoading(true);
    setSimulationParams(params);
    try {
      let adjustedParams = {
        ...params
      };
      switch (params.simulationType) {
        case 'optimistic':
          adjustedParams.incomeGrowth *= 1.5;
          adjustedParams.investmentReturn *= 1.5;
          adjustedParams.expenseReduction *= 1.5;
          break;
        case 'pessimistic':
          adjustedParams.incomeGrowth *= 0.5;
          adjustedParams.investmentReturn *= 0.5;
          adjustedParams.inflationRate *= 1.5;
          adjustedParams.expenseReduction *= 0.5;
          break;
        case 'crisis':
          break;
      }
      const result = await runSimulation(adjustedParams);
      let finalResult = {
        ...result,
        params: adjustedParams
      };
      if (params.simulationType === 'crisis' && activeScenario) {
        const scenario = scenarios.find(s => s.id === activeScenario);
        if (scenario?.crisisFunction) {
          finalResult = scenario.crisisFunction(finalResult);
        }
      }
      setResults(finalResult);
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Erreur lors de la simulation');
    } finally {
      setIsLoading(false);
    }
  };
  // Save current simulation
  const handleSaveSimulation = () => {
    if (results) {
      setSavedSimulations([...savedSimulations, {
        ...results,
        name: params.name
      }]);
      toast.success('Simulation enregistrée');
    }
  };
  // Apply a predefined scenario
  const applyScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setParams(scenario.params);
      setActiveScenario(scenarioId);
      toast.success(`Scénario "${scenario.name}" appliqué`);
    }
  };
  // Reset parameters to default
  const resetParams = () => {
    setParams({
      name: 'Ma simulation',
      years: 10,
      incomeGrowth: 2,
      expenseReduction: 1,
      savingsRate: 50,
      investmentReturn: 5,
      inflationRate: 2,
      simulationType: 'normal'
    });
    setActiveScenario(null);
    toast.success('Paramètres réinitialisés');
  };
  // Run initial simulation on component mount
  useEffect(() => {
    if (financialData && financialData.incomes.length > 0) {
      handleRunSimulation();
    }
  }, [financialData]);
  const handleExportResults = () => {
    console.log("Début de l'exportation des résultats");
    try {
      // Créer les données à exporter
      const dataToExport = {
        simulationName: params.name,
        date: new Date().toISOString(),
        parameters: params,
        results: results
      };
      // Convertir en JSON
      const jsonString = JSON.stringify(dataToExport, null, 2);
      console.log('Données JSON préparées:', jsonString.substring(0, 100) + '...');
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([jsonString], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      // Créer un élément de lien temporaire
      const link = document.createElement('a');
      link.href = url;
      link.download = `simulation-${params.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
      // Ajouter au DOM, cliquer, puis supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Libérer l'URL
      URL.revokeObjectURL(url);
      console.log('Exportation réussie');
      toast.success('Simulation exportée avec succès');
    } catch (error) {
      console.error("Erreur détaillée lors de l'exportation:", error);
      toast.error("Erreur lors de l'exportation des résultats");
    }
  };
  window.handleExportResults = handleExportResults;
  return <div className="w-full max-w-6xl mx-auto pb-20">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Simulateur Financier</h1>
        <p className={`${themeColors?.textSecondary || 'text-gray-400'}`}>
          Explorez différents scénarios et visualisez leur impact sur votre
          avenir financier
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation parameters */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 mb-6" animate>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <div className="h-5 w-5 mr-2 text-indigo-400" />
              Paramètres
            </h2>
            <div className="space-y-4">
              {/* Simulation name */}
              <div>
                <label className="block text-sm mb-1">
                  Nom de la simulation
                </label>
                <input type="text" value={params.name} onChange={e => setParams({
                ...params,
                name: e.target.value
              })} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white" />
              </div>
              {/* Simulation type */}
              <div>
                <label className="block text-sm mb-1">Type de simulation</label>
                <div className="grid grid-cols-2 gap-2">
                  {['normal', 'optimistic', 'pessimistic', 'crisis'].map(type => <button key={type} onClick={() => setParams({
                  ...params,
                  simulationType: type as any
                })} className={`py-2 px-3 rounded-lg text-sm ${params.simulationType === type ? 'bg-indigo-600' : 'bg-black/30 hover:bg-black/40'}`}>
                        {type === 'normal' ? 'Normal' : type === 'optimistic' ? 'Optimiste' : type === 'pessimistic' ? 'Pessimiste' : 'Crise'}
                      </button>)}
                </div>
              </div>
              {/* Years */}
              <div>
                <div className="flex justify-between">
                  <label className="block text-sm">Années de projection</label>
                  <span className="text-sm">{params.years} ans</span>
                </div>
                <input type="range" min="1" max="30" value={params.years} onChange={e => setParams({
                ...params,
                years: parseInt(e.target.value)
              })} className="w-full" />
              </div>
              {/* Income growth */}
              <div>
                <div className="flex justify-between">
                  <label className="block text-sm">
                    Croissance des revenus
                  </label>
                  <span className="text-sm">{params.incomeGrowth}% / an</span>
                </div>
                <input type="range" min="0" max="10" step="0.5" value={params.incomeGrowth} onChange={e => setParams({
                ...params,
                incomeGrowth: parseFloat(e.target.value)
              })} className="w-full" />
              </div>
              {/* Expense reduction */}
              <div>
                <div className="flex justify-between">
                  <label className="block text-sm">
                    Réduction des dépenses
                  </label>
                  <span className="text-sm">
                    {params.expenseReduction}% / an
                  </span>
                </div>
                <input type="range" min="0" max="5" step="0.5" value={params.expenseReduction} onChange={e => setParams({
                ...params,
                expenseReduction: parseFloat(e.target.value)
              })} className="w-full" />
              </div>
              {/* Advanced options toggle */}
              <button onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center">
                {showAdvancedOptions ? 'Masquer' : 'Afficher'} les options
                avancées
              </button>
              {/* Advanced options */}
              {showAdvancedOptions && <div className="space-y-4 pt-2 border-t border-white/10">
                  {/* Savings rate */}
                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm">Taux d'épargne</label>
                      <span className="text-sm">{params.savingsRate}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={params.savingsRate} onChange={e => setParams({
                  ...params,
                  savingsRate: parseInt(e.target.value)
                })} className="w-full" />
                  </div>
                  {/* Investment return */}
                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm">
                        Rendement des investissements
                      </label>
                      <span className="text-sm">
                        {params.investmentReturn}% / an
                      </span>
                    </div>
                    <input type="range" min="0" max="15" step="0.5" value={params.investmentReturn} onChange={e => setParams({
                  ...params,
                  investmentReturn: parseFloat(e.target.value)
                })} className="w-full" />
                  </div>
                  {/* Inflation rate */}
                  <div>
                    <div className="flex justify-between">
                      <label className="block text-sm">Taux d'inflation</label>
                      <span className="text-sm">
                        {params.inflationRate}% / an
                      </span>
                    </div>
                    <input type="range" min="0" max="10" step="0.5" value={params.inflationRate} onChange={e => setParams({
                  ...params,
                  inflationRate: parseFloat(e.target.value)
                })} className="w-full" />
                  </div>
                </div>}
              {/* Action buttons */}
              <div className="flex space-x-2 pt-4">
                <button onClick={handleRunSimulation} disabled={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg flex items-center justify-center">
                  {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <>
                      <RefreshCwIcon className="h-4 w-4 mr-2" />
                      Simuler
                    </>}
                </button>
                <button onClick={handleSaveSimulation} disabled={!results || isLoading} className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg flex items-center justify-center disabled:opacity-50">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Enregistrer
                </button>
                <button onClick={resetParams} className="bg-black/30 hover:bg-black/40 p-2 rounded-lg" title="Réinitialiser">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </GlassCard>
          {/* Predefined scenarios */}
          <GlassCard className="p-6" animate>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-indigo-400" />
              Scénarios prédéfinis
            </h2>
            <div className="space-y-3">
              {scenarios.map(scenario => <button key={scenario.id} onClick={() => applyScenario(scenario.id)} className={`w-full p-3 rounded-lg flex items-start text-left ${activeScenario === scenario.id ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-black/20 hover:bg-black/30'}`}>
                  <div className={`p-2 rounded-full bg-black/30 mr-3 ${activeScenario === scenario.id ? 'text-indigo-400' : 'text-gray-400'}`}>
                    {scenario.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{scenario.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {scenario.description}
                    </p>
                  </div>
                </button>)}
            </div>
          </GlassCard>
        </div>
        {/* Simulation results */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 mb-6" animate>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2 text-green-400" />
                Résultats de la simulation
              </h2>
              <div className="text-sm bg-black/30 px-3 py-1 rounded-full">
                {params.name}
              </div>
            </div>
            {isLoading ? <div className="h-80 flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div> : results ? <div className="space-y-8">
                {/* Net worth chart */}
                <div>
                  <h3 className="text-md font-medium mb-2">
                    Évolution de la valeur nette
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.years.map((year, i) => ({
                    year,
                    netWorth: results.netWorth[i]
                  }))} margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="year" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, 'Valeur nette']} contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }} />
                        <Area type="monotone" dataKey="netWorth" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Income vs expenses chart */}
                <div>
                  <h3 className="text-md font-medium mb-2">
                    Revenus vs Dépenses
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.years.map((year, i) => ({
                    year,
                    income: results.income[i],
                    expenses: results.expenses[i]
                  }))} margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="year" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, '']} contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }} />
                        <Legend />
                        <Line type="monotone" dataKey="income" name="Revenus" stroke="#82ca9d" activeDot={{
                      r: 8
                    }} />
                        <Line type="monotone" dataKey="expenses" name="Dépenses" stroke="#ff7300" activeDot={{
                      r: 8
                    }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Key metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/20 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">
                      Valeur nette finale
                    </h4>
                    <div className="text-2xl font-bold">
                      {results.netWorth[results.netWorth.length - 1].toLocaleString('fr-FR')}
                      €
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {`Année ${results.years[results.years.length - 1]}`}
                    </div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">
                      Croissance totale
                    </h4>
                    <div className="text-2xl font-bold">
                      {results.netWorth[0] !== 0 ? ((results.netWorth[results.netWorth.length - 1] / results.netWorth[0] - 1) * 100).toFixed(0) : 'N/A'}
                      %
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Sur {params.years} ans
                    </div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">
                      Revenu mensuel estimé
                    </h4>
                    <div className="text-2xl font-bold">
                      {(results.income[results.income.length - 1] / 12).toLocaleString('fr-FR')}
                      €
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {`Année ${results.years[results.years.length - 1]}`}
                    </div>
                  </div>
                </div>
                {/* Impact analysis */}
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-md font-medium mb-3">Analyse d'impact</h3>
                  <div className="space-y-3">
                    {/* Net worth impact */}
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${results.netWorth[results.netWorth.length - 1] > results.netWorth[0] * 2 ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                        {results.netWorth[results.netWorth.length - 1] > results.netWorth[0] * 2 ? <CheckIcon className="h-4 w-4" /> : <InfoIcon className="h-4 w-4" />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">
                          {results.netWorth[results.netWorth.length - 1] > results.netWorth[0] * 2 ? `Votre valeur nette devrait plus que doubler en ${params.years} ans.` : `Votre valeur nette progressera, mais moins que le potentiel optimal.`}
                        </p>
                      </div>
                    </div>
                    {/* Income vs expenses */}
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${results.income[results.income.length - 1] > results.expenses[results.expenses.length - 1] * 1.5 ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                        {results.income[results.income.length - 1] > results.expenses[results.expenses.length - 1] * 1.5 ? <CheckIcon className="h-4 w-4" /> : <InfoIcon className="h-4 w-4" />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">
                          {results.income[results.income.length - 1] > results.expenses[results.expenses.length - 1] * 1.5 ? `Vos revenus seront 1.5x supérieurs à vos dépenses, un excellent ratio.` : `Le ratio revenus/dépenses pourrait être amélioré pour plus de sécurité financière.`}
                        </p>
                      </div>
                    </div>
                    {/* Scenario specific analysis */}
                    {activeScenario && <div className="flex items-center">
                        <div className="p-2 rounded-full bg-indigo-900/20 text-indigo-400">
                          <InfoIcon className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm">
                            {activeScenario === 'job-loss' ? "Malgré une perte d'emploi temporaire, votre plan financier devrait rester viable avec des ajustements." : activeScenario === 'medical-emergency' ? 'Une urgence médicale aurait un impact significatif mais gérable sur vos finances.' : activeScenario === 'inflation-shock' ? "Un choc d'inflation réduirait votre pouvoir d'achat. Envisagez des investissements indexés sur l'inflation." : activeScenario === 'interest-rate-rise' ? 'La hausse des taux affecterait vos dettes à taux variable. Envisagez de renégocier vos prêts.' : "L'achat immobilier impacte vos liquidités à court terme mais construit du patrimoine à long terme."}
                          </p>
                        </div>
                      </div>}
                  </div>
                </div>
                {/* Action recommendations */}
                <div className="bg-black/20 p-4 rounded-lg">
                  <h3 className="text-md font-medium mb-3">Recommandations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                      <span className="text-sm">
                        {params.savingsRate < 20 ? "Augmentez votre taux d'épargne à au moins 20% pour améliorer significativement vos résultats à long terme." : "Continuez avec votre excellent taux d'épargne, cela aura un impact majeur sur votre avenir financier."}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                      <span className="text-sm">
                        {params.investmentReturn < 5 ? 'Diversifiez vos investissements pour viser un rendement moyen de 5-7% sur le long terme.' : "Votre stratégie d'investissement semble équilibrée, maintenez une diversification appropriée."}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                      <span className="text-sm">
                        {params.incomeGrowth < 2 ? 'Explorez des opportunités pour augmenter vos revenus: formation continue, négociation salariale ou sources de revenus complémentaires.' : 'Votre projection de croissance des revenus est réaliste, continuez à investir dans vos compétences.'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div> : <div className="h-80 flex items-center justify-center">
                <p className="text-gray-400">
                  Aucune donnée de simulation disponible
                </p>
              </div>}
          </GlassCard>
          {/* Saved simulations */}
          {savedSimulations.length > 0 && <GlassCard className="p-6" animate>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <SaveIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Simulations enregistrées
              </h2>
              <div className="space-y-3">
                {savedSimulations.map((sim, index) => <div key={index} className="bg-black/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">
                        {sim.name || `Simulation ${index + 1}`}
                      </h3>
                      <div className="text-sm text-gray-400">
                        {sim.years?.length ? `${sim.years.length} années` : ''}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" style={{
                    width: `${sim.netWorth?.[0] ? Math.min(100, sim.netWorth[sim.netWorth.length - 1] / sim.netWorth[0] * 50) : 0}%`
                  }}></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {sim.netWorth?.[0] ? `${Math.round((sim.netWorth[sim.netWorth.length - 1] / sim.netWorth[0] - 1) * 100)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>)}
              </div>
            </GlassCard>}
        </div>
      </div>
    </div>;
}