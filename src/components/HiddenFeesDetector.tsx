import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { SearchIcon, AlertCircleIcon, CheckCircleIcon, TrendingDownIcon, RefreshCwIcon, DownloadIcon, BarChart3Icon, CreditCardIcon, InfoIcon, PhoneIcon, MailIcon, ExternalLinkIcon, CalendarIcon, TagIcon } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// Types for hidden fees
interface HiddenFee {
  id: string;
  category: string;
  amount: number;
  description: string;
  potentialSaving: number;
  actionable: boolean;
  actionType?: 'call' | 'email' | 'cancel' | 'negotiate' | 'switch';
  actionDetails?: string;
  recurrenceType?: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
}
export function HiddenFeesDetector() {
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    financialData,
    detectHiddenFees
  } = useFinance();
  // State for hidden fees
  const [hiddenFees, setHiddenFees] = useState<HiddenFee[]>([]);
  const [filteredFees, setFilteredFees] = useState<HiddenFee[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(0);
  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showActionable, setShowActionable] = useState(false);
  const [sortOrder, setSortOrder] = useState<'amount' | 'saving'>('saving');
  // Detect hidden fees on component mount
  useEffect(() => {
    const detectFees = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would call an API
        // For now, we'll create mock data
        const mockHiddenFees: HiddenFee[] = [{
          id: 'fee-1',
          category: 'Abonnements',
          amount: 14.99,
          description: 'Abonnement streaming non utilisé depuis 3 mois',
          potentialSaving: 14.99,
          actionable: true,
          actionType: 'cancel',
          actionDetails: "Annuler l'abonnement sur le site du fournisseur",
          recurrenceType: 'monthly'
        }, {
          id: 'fee-2',
          category: 'Frais bancaires',
          amount: 9.9,
          description: 'Frais de tenue de compte supérieurs à la moyenne du marché',
          potentialSaving: 7.5,
          actionable: true,
          actionType: 'negotiate',
          actionDetails: 'Contacter votre conseiller pour négocier une réduction',
          recurrenceType: 'monthly'
        }, {
          id: 'fee-3',
          category: 'Assurances',
          amount: 45.0,
          description: 'Assurance habitation - tarif 20% au-dessus du marché',
          potentialSaving: 9.0,
          actionable: true,
          actionType: 'switch',
          actionDetails: 'Comparer les offres et changer de fournisseur',
          recurrenceType: 'monthly'
        }, {
          id: 'fee-4',
          category: 'Énergie',
          amount: 120.0,
          description: "Facture d'électricité - tarif non optimisé",
          potentialSaving: 18.0,
          actionable: true,
          actionType: 'switch',
          actionDetails: 'Changer de fournisseur pour un tarif plus avantageux',
          recurrenceType: 'monthly'
        }, {
          id: 'fee-5',
          category: 'Télécom',
          amount: 39.99,
          description: 'Forfait mobile avec options inutilisées',
          potentialSaving: 15.0,
          actionable: true,
          actionType: 'call',
          actionDetails: 'Appeler le service client pour ajuster votre forfait',
          recurrenceType: 'monthly'
        }, {
          id: 'fee-6',
          category: 'Abonnements',
          amount: 9.99,
          description: 'Abonnement application mobile redondant',
          potentialSaving: 9.99,
          actionable: true,
          actionType: 'cancel',
          actionDetails: "Annuler l'abonnement via les paramètres de votre téléphone",
          recurrenceType: 'monthly'
        }, {
          id: 'fee-7',
          category: 'Frais bancaires',
          amount: 32.0,
          description: 'Frais de découvert bancaire évitables',
          potentialSaving: 32.0,
          actionable: false,
          recurrenceType: 'quarterly'
        }, {
          id: 'fee-8',
          category: 'Taxes',
          amount: 120.0,
          description: 'Optimisation fiscale manquante sur vos placements',
          potentialSaving: 120.0,
          actionable: true,
          actionType: 'email',
          actionDetails: 'Contacter un conseiller fiscal pour optimiser vos placements',
          recurrenceType: 'yearly'
        }];
        // Calculate total potential savings
        const total = mockHiddenFees.reduce((sum, fee) => sum + fee.potentialSaving, 0);
        const annual = mockHiddenFees.reduce((sum, fee) => {
          const multiplier = fee.recurrenceType === 'monthly' ? 12 : fee.recurrenceType === 'quarterly' ? 4 : fee.recurrenceType === 'yearly' ? 1 : 1;
          return sum + fee.potentialSaving * multiplier;
        }, 0);
        setHiddenFees(mockHiddenFees);
        setTotalSavings(total);
        setAnnualSavings(annual);
      } catch (error) {
        console.error('Error detecting hidden fees:', error);
        toast.error('Erreur lors de la détection des frais cachés');
      } finally {
        setIsLoading(false);
      }
    };
    detectFees();
  }, []);
  // Filter and sort fees when search term, category, or actionable filter changes
  useEffect(() => {
    let filtered = [...hiddenFees];
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(fee => fee.description.toLowerCase().includes(searchTerm.toLowerCase()) || fee.category.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(fee => fee.category === selectedCategory);
    }
    // Filter by actionable
    if (showActionable) {
      filtered = filtered.filter(fee => fee.actionable);
    }
    // Sort by amount or potential saving
    filtered.sort((a, b) => sortOrder === 'amount' ? b.amount - a.amount : b.potentialSaving - a.potentialSaving);
    setFilteredFees(filtered);
  }, [hiddenFees, searchTerm, selectedCategory, showActionable, sortOrder]);
  // Get unique categories
  const categories = Array.from(new Set(hiddenFees.map(fee => fee.category)));
  // Prepare data for pie chart
  const chartData = categories.map(category => {
    const categoryFees = hiddenFees.filter(fee => fee.category === category);
    const totalAmount = categoryFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalSaving = categoryFees.reduce((sum, fee) => sum + fee.potentialSaving, 0);
    return {
      name: category,
      amount: totalAmount,
      saving: totalSaving
    };
  });
  // Colors for pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'];
  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    toast.promise(new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 1500);
    }), {
      loading: 'Analyse en cours...',
      success: 'Analyse des frais cachés terminée',
      error: "Erreur lors de l'analyse"
    }).finally(() => {
      setIsLoading(false);
    });
  };
  // Handle action click
  const handleActionClick = (fee: HiddenFee) => {
    toast.success(`Action pour "${fee.description}" initiée`);
    // In a real app, this would open a modal or redirect to the appropriate page
  };
  // Format recurrence type
  const formatRecurrence = (type?: string) => {
    switch (type) {
      case 'monthly':
        return 'par mois';
      case 'quarterly':
        return 'par trimestre';
      case 'yearly':
        return 'par an';
      case 'one-time':
        return 'ponctuel';
      default:
        return '';
    }
  };
  // Calculate equivalent value
  const calculateEquivalent = (amount: number) => {
    if (amount < 10) return `${Math.round(amount * 3)} cafés`;
    if (amount < 50) return `${Math.round(amount / 10)} livres`;
    if (amount < 100) return `${Math.round(amount / 50)} repas au restaurant`;
    if (amount < 500) return `${Math.round(amount / 100)} mois de streaming`;
    return `${Math.round(amount / 1000)} mois de loyer moyen`;
  };
  return <div className="w-full max-w-6xl mx-auto pb-20">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Détecteur de Frais Cachés</h1>
        <p className={`${themeColors?.textSecondary || 'text-gray-400'}`}>
          Identifiez et éliminez les frais inutiles pour économiser chaque mois
        </p>
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4" animate hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
              Économies potentielles
            </h3>
            <div className="p-2 rounded-full bg-green-500/20">
              <TrendingDownIcon className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {totalSavings.toLocaleString('fr-FR')}€
          </div>
          <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'}`}>
            {annualSavings.toLocaleString('fr-FR')}€ par an
          </div>
        </GlassCard>
        <GlassCard className="p-4" animate hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
              Frais détectés
            </h3>
            <div className="p-2 rounded-full bg-red-500/20">
              <AlertCircleIcon className="h-4 w-4 text-red-400" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{hiddenFees.length}</div>
          <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'}`}>
            {hiddenFees.filter(fee => fee.actionable).length} actions
            possibles
          </div>
        </GlassCard>
        <GlassCard className="p-4" animate hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm ${themeColors?.textSecondary || 'text-gray-400'}`}>
              Équivalent
            </h3>
            <div className="p-2 rounded-full bg-blue-500/20">
              <CreditCardIcon className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {calculateEquivalent(annualSavings)}
          </div>
          <div className={`text-xs ${themeColors?.textSecondary || 'text-gray-400'}`}>
            par an
          </div>
        </GlassCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Filters and chart */}
        <div className="lg:col-span-1">
          {/* Filters card */}
          <GlassCard className="p-6 mb-6" animate>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <SearchIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Filtres
              </h2>
              <button onClick={handleRefresh} className="bg-black/30 hover:bg-black/40 p-2 rounded-lg" disabled={isLoading}>
                <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm mb-1">Recherche</label>
                <div className="relative">
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher des frais..." className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white" />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              {/* Category filter */}
              <div>
                <label className="block text-sm mb-1">Catégorie</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory(null)} className={`px-2 py-1 rounded-full text-xs ${selectedCategory === null ? 'bg-indigo-600 text-white' : 'bg-black/30 text-gray-300 hover:bg-black/40'}`}>
                    Toutes
                  </button>
                  {categories.map((category, index) => <button key={index} onClick={() => setSelectedCategory(category)} className={`px-2 py-1 rounded-full text-xs ${selectedCategory === category ? 'bg-indigo-600 text-white' : 'bg-black/30 text-gray-300 hover:bg-black/40'}`}>
                      {category}
                    </button>)}
                </div>
              </div>
              {/* Actionable filter */}
              <div className="flex items-center">
                <input type="checkbox" id="actionable" checked={showActionable} onChange={e => setShowActionable(e.target.checked)} className="mr-2" />
                <label htmlFor="actionable" className="text-sm">
                  Afficher uniquement les frais actionnables
                </label>
              </div>
              {/* Sort order */}
              <div>
                <label className="block text-sm mb-1">Trier par</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setSortOrder('amount')} className={`py-1.5 px-3 rounded-lg text-sm ${sortOrder === 'amount' ? 'bg-indigo-600' : 'bg-black/30 hover:bg-black/40'}`}>
                    Montant
                  </button>
                  <button onClick={() => setSortOrder('saving')} className={`py-1.5 px-3 rounded-lg text-sm ${sortOrder === 'saving' ? 'bg-indigo-600' : 'bg-black/30 hover:bg-black/40'}`}>
                    Économie
                  </button>
                </div>
              </div>
              {/* Download report button */}
              <div className="pt-2">
                <button className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-lg text-sm">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Télécharger le rapport
                </button>
              </div>
            </div>
          </GlassCard>
          {/* Chart card */}
          <GlassCard className="p-6" animate>
            <h2 className="text-xl font-bold flex items-center mb-4">
              <BarChart3Icon className="h-5 w-5 mr-2 text-indigo-400" />
              Répartition par catégorie
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="saving" label={({
                  name,
                  percent
                }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => [`${value.toLocaleString('fr-FR')}€`, 'Économie potentielle']} contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Top catégories</h3>
              <div className="space-y-2">
                {chartData.sort((a, b) => b.saving - a.saving).slice(0, 3).map((item, index) => <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{
                    backgroundColor: COLORS[index % COLORS.length]
                  }}></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {item.saving.toLocaleString('fr-FR')}€
                      </span>
                    </div>)}
              </div>
            </div>
          </GlassCard>
        </div>
        {/* Right column: Hidden fees list */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6" animate>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <AlertCircleIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Frais cachés détectés
              </h2>
              <span className="text-sm bg-black/30 px-3 py-1 rounded-full">
                {filteredFees.length} frais
              </span>
            </div>
            {isLoading ? <div className="h-64 flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div> : filteredFees.length === 0 ? <div className="text-center py-10">
                <p className="text-gray-400 mb-2">Aucun frais trouvé</p>
                <p className="text-sm text-gray-500">
                  {hiddenFees.length > 0 ? 'Essayez de modifier vos filtres' : 'Aucun frais caché détecté dans vos transactions'}
                </p>
              </div> : <div className="space-y-4">
                {filteredFees.map(fee => <div key={fee.id} className="bg-black/20 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{fee.description}</h3>
                        <div className="flex items-center mt-1">
                          <TagIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-400">
                            {fee.category}
                          </span>
                          <span className="mx-2 text-gray-500">•</span>
                          <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-400">
                            {formatRecurrence(fee.recurrenceType)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium">
                          {fee.amount.toLocaleString('fr-FR')}€
                        </div>
                        <div className="text-xs text-gray-400">Montant</div>
                      </div>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <TrendingDownIcon className="h-4 w-4 text-green-400 mr-1" />
                          <span className="text-sm font-medium text-green-400">
                            Économie potentielle:{' '}
                            {fee.potentialSaving.toLocaleString('fr-FR')}€{' '}
                            {formatRecurrence(fee.recurrenceType)}
                          </span>
                        </div>
                        <div className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">
                          {(fee.potentialSaving / fee.amount * 100).toFixed(0)}
                          % d'économie
                        </div>
                      </div>
                      <div className="text-xs text-gray-300 mb-2">
                        Équivalent à{' '}
                        {calculateEquivalent(fee.potentialSaving * (fee.recurrenceType === 'monthly' ? 12 : fee.recurrenceType === 'quarterly' ? 4 : 1))}{' '}
                        par an
                      </div>
                      {fee.actionable && <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center text-xs text-gray-300">
                            <InfoIcon className="h-3 w-3 mr-1 text-indigo-400" />
                            {fee.actionDetails}
                          </div>
                          <button onClick={() => handleActionClick(fee)} className="flex items-center bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg text-xs">
                            {fee.actionType === 'call' ? <PhoneIcon className="h-3 w-3 mr-1" /> : fee.actionType === 'email' ? <MailIcon className="h-3 w-3 mr-1" /> : fee.actionType === 'cancel' ? <AlertCircleIcon className="h-3 w-3 mr-1" /> : fee.actionType === 'negotiate' ? <RefreshCwIcon className="h-3 w-3 mr-1" /> : <ExternalLinkIcon className="h-3 w-3 mr-1" />}
                            {fee.actionType === 'call' ? 'Appeler' : fee.actionType === 'email' ? 'Contacter' : fee.actionType === 'cancel' ? 'Annuler' : fee.actionType === 'negotiate' ? 'Négocier' : fee.actionType === 'switch' ? 'Changer' : 'Action'}
                          </button>
                        </div>}
                    </div>
                  </div>)}
              </div>}
          </GlassCard>
        </div>
      </div>
    </div>;
}