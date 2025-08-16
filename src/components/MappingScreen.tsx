import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useFinanceStore } from '../stores/financeStore';
import { PlusIcon, ArrowRightIcon, XIcon, TrashIcon, CheckIcon, InfoIcon, DollarSignIcon, BarChart3Icon, PiggyBankIcon, CreditCardIcon, LineChartIcon, HeartIcon, BrainIcon, ReceiptIcon, CalendarIcon, TagIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon, SaveIcon, HelpCircleIcon } from 'lucide-react';
import { FinancialItem } from '../types/finance';
import { toast, Toaster } from 'react-hot-toast';
import { GlassCard } from './ui/GlassCard';
import { DataImportModal } from './data/DataImportModal';
import { RealTimeVisualization } from './data/RealTimeVisualization';
import { categorizeTransaction, improveModelWithFeedback } from '../utils/aiCategorization';
// Import des sons pour les micro-interactions
// Note: Dans une implémentation réelle, ces URLs devraient pointer vers des fichiers hébergés
const SOUNDS = {
  income: 'https://assets.mixkit.co/active_storage/sfx/2075/2075-preview.mp3',
  expense: 'https://assets.mixkit.co/active_storage/sfx/2032/2032-preview.mp3',
  saving: 'https://assets.mixkit.co/active_storage/sfx/888/888-preview.mp3',
  debt: 'https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3',
  delete: 'https://assets.mixkit.co/active_storage/sfx/650/650-preview.mp3',
  categorize: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
};
// Types for financial items
interface CategoryOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}
// Frequency options for financial items
const frequencyOptions = [{
  value: 'monthly',
  label: 'Mensuel'
}, {
  value: 'quarterly',
  label: 'Trimestriel'
}, {
  value: 'yearly',
  label: 'Annuel'
}, {
  value: 'once',
  label: 'Ponctuel'
}];
// Category options
const incomeCategories: CategoryOption[] = [{
  value: 'salary',
  label: 'Salaire',
  icon: <DollarSignIcon className="h-4 w-4" />
}, {
  value: 'freelance',
  label: 'Freelance',
  icon: <DollarSignIcon className="h-4 w-4" />
}, {
  value: 'investments',
  label: 'Investissements',
  icon: <LineChartIcon className="h-4 w-4" />
}, {
  value: 'rental',
  label: 'Revenus locatifs',
  icon: <BarChart3Icon className="h-4 w-4" />
}, {
  value: 'other_income',
  label: 'Autres revenus',
  icon: <DollarSignIcon className="h-4 w-4" />
}];
const expenseCategories: CategoryOption[] = [{
  value: 'housing',
  label: 'Logement',
  icon: <BarChart3Icon className="h-4 w-4" />
}, {
  value: 'food',
  label: 'Alimentation',
  icon: <ReceiptIcon className="h-4 w-4" />
}, {
  value: 'transport',
  label: 'Transport',
  icon: <BarChart3Icon className="h-4 w-4" />
}, {
  value: 'utilities',
  label: 'Factures',
  icon: <ReceiptIcon className="h-4 w-4" />
}, {
  value: 'entertainment',
  label: 'Loisirs',
  icon: <BarChart3Icon className="h-4 w-4" />
}, {
  value: 'health',
  label: 'Santé',
  icon: <HeartIcon className="h-4 w-4" />
}, {
  value: 'education',
  label: 'Éducation',
  icon: <BrainIcon className="h-4 w-4" />
}, {
  value: 'other_expense',
  label: 'Autres dépenses',
  icon: <ReceiptIcon className="h-4 w-4" />
}];
const savingCategories: CategoryOption[] = [{
  value: 'emergency',
  label: "Fonds d'urgence",
  icon: <PiggyBankIcon className="h-4 w-4" />
}, {
  value: 'retirement',
  label: 'Retraite',
  icon: <PiggyBankIcon className="h-4 w-4" />
}, {
  value: 'savings',
  label: 'Épargne générale',
  icon: <PiggyBankIcon className="h-4 w-4" />
}, {
  value: 'project',
  label: 'Projet',
  icon: <PiggyBankIcon className="h-4 w-4" />
}];
const debtCategories: CategoryOption[] = [{
  value: 'mortgage',
  label: 'Prêt immobilier',
  icon: <CreditCardIcon className="h-4 w-4" />
}, {
  value: 'credit_card',
  label: 'Carte de crédit',
  icon: <CreditCardIcon className="h-4 w-4" />
}, {
  value: 'loan',
  label: 'Prêt personnel',
  icon: <CreditCardIcon className="h-4 w-4" />
}, {
  value: 'other_debt',
  label: 'Autre dette',
  icon: <CreditCardIcon className="h-4 w-4" />
}];
export function MappingScreen() {
  const navigate = useNavigate();
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    userQuestion,
    emotionalContext,
    financialData,
    setFinancialData
  } = useFinance();
  const {
    setHasCompletedOnboarding
  } = useFinanceStore();

  // === VALIDATION ET INITIALISATION SÉCURISÉE DES DONNÉES ===

  // Vérifier et corriger la structure des données financières
  React.useEffect(() => {
    if (!financialData) {
      console.warn('financialData est null, initialisation avec des valeurs par défaut');
      setFinancialData({
        incomes: [],
        expenses: [],
        savings: [],
        debts: [],
        investments: []
      });
      return;
    }

    // Vérifier que toutes les propriétés requises existent et sont des tableaux
    const requiredProperties = ['incomes', 'expenses', 'savings', 'debts'] as const;
    let needsUpdate = false;
    const safeData = {
      ...financialData
    };
    requiredProperties.forEach(prop => {
      if (!Array.isArray(financialData[prop])) {
        console.warn(`financialData.${prop} n'est pas un tableau, correction en cours`);
        safeData[prop] = [];
        needsUpdate = true;
      }
    });

    // Ajouter investments si manquant
    if (!Array.isArray(financialData.investments)) {
      safeData.investments = [];
      needsUpdate = true;
    }
    if (needsUpdate) {
      console.log('Mise à jour de la structure des données financières:', safeData);
      setFinancialData(safeData);
    }
  }, [financialData, setFinancialData]);

  // State for current tab
  const [activeTab, setActiveTab] = useState<'incomes' | 'expenses' | 'savings' | 'debts'>('incomes');
  // State for adding new items
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<FinancialItem>({
    value: '',
    category: '',
    description: '',
    frequency: 'monthly',
    isRecurring: true
  });
  // State for editing items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);
  // State for emotional journal entry
  const [journalEntry, setJournalEntry] = useState('');
  const [showJournal, setShowJournal] = useState(false);
  // State for behavioral insights
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  // State for financial health score
  const [healthScore, setHealthScore] = useState(0);
  // State for contextual tags
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Calculate financial health score
  useEffect(() => {
    // Simple scoring algorithm based on income, expenses, savings, and debts
    const totalIncome = calculateTotal(financialData.incomes);
    const totalExpenses = calculateTotal(financialData.expenses);
    const totalSavings = calculateTotal(financialData.savings);
    const totalDebts = calculateTotal(financialData.debts);
    let score = 50; // Base score
    // Adjust for income vs expenses
    if (totalIncome > totalExpenses) {
      score += 10 * Math.min(1, (totalIncome - totalExpenses) / totalIncome);
    } else {
      score -= 10 * Math.min(1, (totalExpenses - totalIncome) / totalIncome);
    }
    // Adjust for savings
    if (totalIncome > 0) {
      score += 10 * Math.min(1, totalSavings / totalIncome);
    }
    // Adjust for debts
    if (totalIncome > 0) {
      score -= 10 * Math.min(1, totalDebts / totalIncome);
    }
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    setHealthScore(score);
  }, [financialData]);
  // Generate behavioral insights
  useEffect(() => {
    if (emotionalContext && financialData) {
      const newInsights = [];
      // Check for emotional spending patterns
      if (emotionalContext.mood > 7 && financialData.expenses.length > 0) {
        newInsights.push('Votre niveau de stress élevé pourrait influencer vos dépenses impulsives. Essayez la règle des 24h avant tout achat non essentiel.');
      }
      // Check for savings vs mood
      if (emotionalContext.mood < 5 && financialData.savings.length > 0) {
        newInsights.push("Les jours où votre humeur est basse, vous avez tendance à moins épargner. Envisagez d'automatiser vos virements d'épargne.");
      }
      // Check for income diversification
      if (financialData.incomes.length === 1) {
        newInsights.push("Vous dépendez d'une seule source de revenu, ce qui peut représenter un risque. Envisagez de développer des sources complémentaires.");
      }
      // Check for debt vs income ratio
      const totalIncome = calculateTotal(financialData.incomes);
      const totalDebt = calculateTotal(financialData.debts);
      if (totalIncome > 0 && totalDebt / totalIncome > 0.4) {
        newInsights.push('Votre ratio dette/revenu est supérieur à 40%, ce qui est considéré comme élevé. Priorisez le remboursement de vos dettes.');
      }
      setInsights(newInsights);
    }
  }, [emotionalContext, financialData]);
  // Generate contextual tags based on time, day, and financial data
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const tags = [];
    // Time-based tags
    if (hour < 10) {
      tags.push('Matin');
    } else if (hour < 14) {
      tags.push('Midi');
    } else if (hour < 18) {
      tags.push('Après-midi');
    } else {
      tags.push('Soir');
    }
    // Day-based tags
    if (day === 0 || day === 6) {
      tags.push('Weekend');
    } else {
      tags.push('Semaine');
    }
    // Financial data based tags
    const totalIncome = calculateTotal(financialData.incomes);
    const totalExpenses = calculateTotal(financialData.expenses);
    if (totalExpenses > totalIncome * 0.8) {
      tags.push('Budget serré');
    }
    if (financialData.savings.length > 0) {
      tags.push('Épargnant');
    }
    if (financialData.debts.length > 0) {
      tags.push('Dette active');
    }
    // Emotional context based tags
    if (emotionalContext) {
      if (emotionalContext.mood > 7) {
        tags.push('Stressé');
      } else if (emotionalContext.mood < 4) {
        tags.push('Détendu');
      }
      // Add emotional context tags
      emotionalContext.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    setAvailableTags([...new Set([...tags, 'Travail', 'Famille', 'Santé', 'Loisir', 'Urgence'])]);
  }, [emotionalContext, financialData]);
  // Helper function to calculate total value of financial items
  const calculateTotal = (items: FinancialItem[]) => {
    return items.reduce((sum, item) => {
      const value = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };
  // Memoized totals
  const totalIncome = useMemo(() => calculateTotal(financialData.incomes), [financialData.incomes]);
  const totalExpenses = useMemo(() => calculateTotal(financialData.expenses), [financialData.expenses]);
  const totalSavings = useMemo(() => calculateTotal(financialData.savings), [financialData.savings]);
  const totalDebts = useMemo(() => calculateTotal(financialData.debts), [financialData.debts]);
  const monthlyBalance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  // Handle tab change
  const handleTabChange = (tab: 'incomes' | 'expenses' | 'savings' | 'debts') => {
    setActiveTab(tab);
    setIsAdding(false);
    setEditingItemId(null);
    setEditingItem(null);
  };
  // Handle adding a new item
  const handleAddItem = () => {
    try {
      console.log('=== DÉBUT AJOUT ÉLÉMENT ===');
      console.log('Données reçues:', {
        newItem,
        activeTab,
        financialData
      });

      // === VALIDATION STRICTE ===

      // 1. Validation du montant
      if (!newItem.value || newItem.value === '' || newItem.value === '0') {
        console.error('Montant manquant ou invalide:', newItem.value);
        toast.error('Veuillez entrer un montant valide');
        return;
      }

      // 2. Conversion et validation numérique
      let numericValue: number;
      try {
        const cleanValue = typeof newItem.value === 'string' ? newItem.value.replace(',', '.').trim() : String(newItem.value);
        numericValue = parseFloat(cleanValue);
        if (isNaN(numericValue) || !isFinite(numericValue) || numericValue <= 0) {
          console.error('Conversion numérique échouée:', {
            original: newItem.value,
            converted: numericValue
          });
          toast.error('Le montant doit être un nombre positif valide');
          return;
        }
      } catch (conversionError) {
        console.error('Erreur lors de la conversion du montant:', conversionError);
        toast.error('Format de montant invalide');
        return;
      }

      // 3. Validation de la catégorie
      if (!newItem.category || newItem.category.trim() === '') {
        console.error('Catégorie manquante');
        toast.error('Veuillez sélectionner une catégorie');
        return;
      }

      // 4. Validation de l'onglet actif
      const validTabs = ['incomes', 'expenses', 'savings', 'debts'] as const;
      if (!validTabs.includes(activeTab)) {
        console.error('Onglet actif invalide:', activeTab);
        toast.error('Erreur: catégorie financière invalide');
        return;
      }

      // 5. Validation de la fréquence
      const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'] as const;
      const frequency = newItem.frequency || 'monthly';
      if (!validFrequencies.includes(frequency as any)) {
        console.error('Fréquence invalide:', frequency);
        toast.error('Fréquence invalide');
        return;
      }

      // === CRÉATION DE L'ÉLÉMENT ===

      // Générer un ID unique et robuste
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 9);
      const uniqueId = `${activeTab}_${timestamp}_${randomSuffix}`;

      // Créer le nouvel élément financier avec toutes les validations
      const newFinancialItem: FinancialItem = {
        id: uniqueId,
        value: numericValue,
        category: newItem.category.trim(),
        description: newItem.description?.trim() || '',
        frequency: frequency as FinancialItem['frequency'],
        isRecurring: Boolean(newItem.isRecurring)
      };
      console.log('Nouvel élément créé:', newFinancialItem);

      // === VALIDATION DES DONNÉES EXISTANTES ===

      if (!financialData) {
        console.error('financialData est null ou undefined');
        toast.error('Erreur: données financières non initialisées');
        return;
      }
      if (typeof financialData !== 'object') {
        console.error('financialData n\'est pas un objet:', typeof financialData);
        toast.error('Erreur: structure de données incorrecte');
        return;
      }

      // Vérifier que l'onglet existe dans les données
      if (!financialData.hasOwnProperty(activeTab)) {
        console.error(`L'onglet ${activeTab} n'existe pas dans financialData:`, Object.keys(financialData));
        toast.error('Erreur: catégorie financière non trouvée');
        return;
      }

      // Vérifier que c'est un tableau
      if (!Array.isArray(financialData[activeTab])) {
        console.error(`financialData[${activeTab}] n'est pas un tableau:`, financialData[activeTab]);
        toast.error('Erreur: format de données incorrect');
        return;
      }

      // === MISE À JOUR SÉCURISÉE ===

      console.log('Tentative de mise à jour des données...');
      setFinancialData(currentData => {
        // Validation supplémentaire des données courantes
        if (!currentData || typeof currentData !== 'object') {
          console.error('currentData invalide dans setFinancialData:', currentData);
          throw new Error('Données courantes invalides');
        }

        // Créer une nouvelle structure avec toutes les propriétés garanties
        const safeCurrentData = {
          incomes: Array.isArray(currentData.incomes) ? currentData.incomes : [],
          expenses: Array.isArray(currentData.expenses) ? currentData.expenses : [],
          savings: Array.isArray(currentData.savings) ? currentData.savings : [],
          debts: Array.isArray(currentData.debts) ? currentData.debts : [],
          investments: Array.isArray(currentData.investments) ? currentData.investments : []
        };

        // Ajouter le nouvel élément au bon endroit
        const updatedData = {
          ...safeCurrentData,
          [activeTab]: [...safeCurrentData[activeTab], newFinancialItem]
        };
        console.log('Nouvelles données après ajout:', updatedData);
        console.log(`Nombre d'éléments dans ${activeTab}:`, updatedData[activeTab].length);
        return updatedData;
      });

      // === NETTOYAGE ET FEEDBACK ===

      // Réinitialiser le formulaire
      setNewItem({
        value: '',
        category: '',
        description: '',
        frequency: 'monthly',
        isRecurring: true
      });

      // Fermer le formulaire d'ajout
      setIsAdding(false);

      // Notification de succès
      toast.success(`Élément ajouté avec succès à ${activeTab === 'incomes' ? 'vos revenus' : activeTab === 'expenses' ? 'vos dépenses' : activeTab === 'savings' ? 'votre épargne' : 'vos dettes'}`);

      // Son de succès (optionnel)
      try {
        const audio = new Audio(SOUNDS.success);
        audio.volume = 0.3;
        audio.play().catch(audioError => {
          console.log('Son non disponible (normal en développement):', audioError);
        });
      } catch (audioError) {
        console.log('Erreur audio (non critique):', audioError);
      }
      console.log('=== AJOUT ÉLÉMENT TERMINÉ AVEC SUCCÈS ===');
    } catch (error) {
      // === GESTION D'ERREUR DÉTAILLÉE ===

      console.error('=== ERREUR LORS DE L\'AJOUT ===');
      console.error('Type d\'erreur:', typeof error);
      console.error('Erreur complète:', error);
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message);
        console.error('Stack trace:', error.stack);

        // Messages d'erreur spécifiques selon le type d'erreur
        let errorMessage = 'Une erreur est survenue lors de l\'ajout';
        if (error.message.includes('Cannot read propert')) {
          errorMessage = 'Erreur de structure des données. Veuillez recharger la page.';
        } else if (error.message.includes('setFinancialData')) {
          errorMessage = 'Erreur de sauvegarde des données. Veuillez réessayer.';
        } else if (error.message.includes('Invalid')) {
          errorMessage = 'Données invalides. Vérifiez vos saisies.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Erreur de connexion. Veuillez réessayer.';
        } else if (error.message.length > 0) {
          errorMessage = `Erreur: ${error.message}`;
        }
        toast.error(errorMessage);
      } else {
        console.error('Erreur non-standard:', error);
        toast.error('Erreur inconnue lors de l\'ajout. Veuillez recharger la page et réessayer.');
      }

      // En cas d'erreur, on peut essayer de réinitialiser le formulaire
      try {
        setIsAdding(false);
      } catch (resetError) {
        console.error('Impossible de réinitialiser le formulaire:', resetError);
      }
    }
  };
  // Handle editing an item
  const handleEditItem = (id: string) => {
    const item = financialData[activeTab].find(item => item.id === id);
    if (item) {
      setEditingItem({
        ...item
      });
      setEditingItemId(id);
    }
  };
  // Handle updating an edited item
  const handleUpdateItem = () => {
    try {
      if (!editingItem || !editingItemId) {
        toast.error('Aucun élément à mettre à jour');
        return;
      }
      console.log("Mise à jour de l'élément:", editingItem);
      // Validation de base
      if (!editingItem.value) {
        toast.error('Veuillez entrer un montant');
        return;
      }
      // Conversion de la valeur en nombre
      let numericValue;
      try {
        numericValue = typeof editingItem.value === 'string' ? parseFloat(editingItem.value) : Number(editingItem.value);
        if (isNaN(numericValue)) {
          toast.error('Le montant doit être un nombre valide');
          return;
        }
      } catch (error) {
        console.error('Erreur lors de la conversion du montant:', error);
        toast.error('Le montant est invalide');
        return;
      }
      // Vérifier la catégorie
      if (!editingItem.category) {
        toast.error('Veuillez sélectionner une catégorie');
        return;
      }
      // Créer une copie complète des données financières actuelles
      const currentData = JSON.parse(JSON.stringify(financialData));
      // Mettre à jour l'élément spécifique
      const updatedItems = currentData[activeTab].map((item: any) => {
        if (item.id === editingItemId) {
          return {
            ...editingItem,
            value: numericValue
          };
        }
        return item;
      });
      // Créer un nouvel objet de données financières
      const updatedData = {
        ...currentData,
        [activeTab]: updatedItems
      };
      console.log('Données financières après mise à jour:', updatedData);
      // Mettre à jour l'état avec les nouvelles données
      setFinancialData(updatedData);
      // Réinitialiser l'état d'édition
      setEditingItemId(null);
      setEditingItem(null);
      // Afficher une confirmation
      toast.success('Élément mis à jour avec succès');
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'élément:", error);
      toast.error('Une erreur est survenue lors de la mise à jour');
    }
  };
  // Handle deleting an item
  const handleDeleteItem = (id: string) => {
    try {
      console.log("Suppression de l'élément avec ID:", id);
      // Créer une copie complète des données financières actuelles
      const currentData = JSON.parse(JSON.stringify(financialData));
      // Filtrer pour supprimer l'élément spécifique
      const updatedItems = currentData[activeTab].filter((item: any) => item.id !== id);
      // Créer un nouvel objet de données financières
      const updatedData = {
        ...currentData,
        [activeTab]: updatedItems
      };
      console.log('Données financières après suppression:', updatedData);
      // Mettre à jour l'état avec les nouvelles données
      setFinancialData(updatedData);
      // Réinitialiser l'état d'édition si nécessaire
      if (editingItemId === id) {
        setEditingItemId(null);
        setEditingItem(null);
      }
      // Afficher une confirmation
      toast.success('Élément supprimé avec succès');
      // Jouer le son de suppression
      try {
        const audio = new Audio(SOUNDS.delete);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Son désactivé:', e));
      } catch (audioError) {
        console.log('Erreur lors de la lecture du son:', audioError);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'élément:", error);
      toast.error('Une erreur est survenue lors de la suppression');
    }
  };
  // Handle saving journal entry
  const handleSaveJournal = () => {
    if (!journalEntry.trim()) {
      toast.error('Veuillez entrer une note dans votre journal');
      return;
    }
    // In a real app, this would be saved to a database
    toast.success('Note de journal enregistrée avec succès');
    setShowJournal(false);
  };
  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  // Handle continue to next screen
  const handleContinue = () => {
    // Set onboarding completion status
    setHasCompletedOnboarding(true);
    // Navigate to the reveal screen
    navigate('/reveal');
  };
  // Get categories based on active tab
  const getCategories = () => {
    switch (activeTab) {
      case 'incomes':
        return incomeCategories;
      case 'expenses':
        return expenseCategories;
      case 'savings':
        return savingCategories;
      case 'debts':
        return debtCategories;
      default:
        return [];
    }
  };
  return <div className="w-full max-w-4xl mx-auto pb-20">
      <Toaster position="top-right" />
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
          <h1 className="text-3xl font-bold">Cartographie Financière</h1>
        </div>
      </motion.div>
      {/* Question and emotional context */}
      <GlassCard className="p-6 mb-6" animate>
        <h2 className="text-xl font-bold mb-2">Votre question</h2>
        <p className="text-lg bg-black/20 p-3 rounded-lg mb-4">
          {userQuestion || 'Comment optimiser ma situation financière ?'}
        </p>
        {emotionalContext && <div className="mt-4">
            <h3 className="text-md font-medium mb-2 flex items-center">
              <HeartIcon className="h-4 w-4 mr-2 text-red-400" />
              Votre contexte émotionnel
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotionalContext.tags.map((tag, index) => <span key={index} className="bg-indigo-900/30 text-indigo-200 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>)}
            </div>
            <div className="mt-3 flex items-center">
              <span className="text-sm mr-2">Niveau de stress:</span>
              <div className="w-full bg-black/20 h-2 rounded-full">
                <div className={`h-2 rounded-full bg-gradient-to-r ${emotionalContext.mood > 7 ? 'from-red-500 to-orange-500' : emotionalContext.mood > 4 ? 'from-yellow-500 to-green-500' : 'from-green-500 to-blue-500'}`} style={{
              width: `${emotionalContext.mood * 10}%`
            }}></div>
              </div>
              <span className="ml-2 text-sm">{emotionalContext.mood}/10</span>
            </div>
            <div className="mt-3 flex items-center">
              <span className="text-sm mr-2">Archétype:</span>
              <span className="text-md">
                {emotionalContext.mood > 7 ? '🐅 Tigre en chasse' : emotionalContext.mood > 5 ? '🦊 Renard rusé' : emotionalContext.mood > 3 ? '🐬 Dauphin équilibré' : '🐼 Panda nocturne'}
              </span>
            </div>
          </div>}
        {/* Journal button */}
        <div className="mt-4 flex justify-end">
          <button onClick={() => setShowJournal(!showJournal)} className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${showJournal ? 'bg-indigo-600' : 'bg-black/30'}`}>
            <PencilIcon className="h-4 w-4 mr-1" />
            Journal émotionnel
          </button>
        </div>
        {/* Emotional journal */}
        <AnimatePresence>
          {showJournal && <motion.div key="journal" initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: 0.2
        }} className="overflow-hidden">
              <div className="mt-4 bg-black/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Note de journal</h4>
                <textarea value={journalEntry} onChange={e => setJournalEntry(e.target.value)} placeholder="Comment vous sentez-vous par rapport à votre situation financière actuelle ? Notez vos pensées ici..." className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 min-h-[100px]"></textarea>
                <div className="flex justify-end mt-2">
                  <button onClick={handleSaveJournal} className="flex items-center bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-sm">
                    <SaveIcon className="h-4 w-4 mr-1" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
      </GlassCard>
      {/* Financial health score */}
      <GlassCard className="p-6 mb-6" animate>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <HeartIcon className="h-5 w-5 mr-2 text-red-400" />
          Indice de Santé Financière
        </h2>
        <div className="flex items-center mb-4">
          <div className="w-full bg-black/20 h-4 rounded-full mr-4">
            <div className={`h-4 rounded-full bg-gradient-to-r ${healthScore > 70 ? 'from-green-500 to-green-300' : healthScore > 50 ? 'from-yellow-500 to-yellow-300' : 'from-red-500 to-red-300'}`} style={{
            width: `${healthScore}%`
          }}></div>
          </div>
          <span className="text-xl font-bold">{Math.round(healthScore)}</span>
        </div>
        <div className="text-sm text-gray-300">
          {healthScore > 70 ? 'Excellent ! Votre santé financière est très bonne.' : healthScore > 50 ? 'Bonne santé financière. Quelques points à améliorer.' : healthScore > 30 ? "Santé financière moyenne. Attention à l'équilibre revenus/dépenses." : 'Attention : votre santé financière nécessite une action immédiate.'}
        </div>
        {/* Behavioral insights button */}
        <div className="mt-4 flex justify-end">
          <button onClick={() => setShowInsights(!showInsights)} className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${showInsights ? 'bg-indigo-600' : 'bg-black/30'}`}>
            <BrainIcon className="h-4 w-4 mr-1" />
            Insights comportementaux
          </button>
        </div>
        {/* Behavioral insights */}
        <AnimatePresence>
          {showInsights && <motion.div key="insights" initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: 0.2
        }} className="overflow-hidden">
              <div className="mt-4 bg-black/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">
                  Patterns comportementaux détectés
                </h4>
                {insights.length > 0 ? <ul className="space-y-2">
                    {insights.map((insight, index) => <li key={index} className="flex items-start">
                        <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-indigo-400" />
                        <span className="text-sm">{insight}</span>
                      </li>)}
                  </ul> : <p className="text-sm text-gray-400">
                    Ajoutez plus de données financières pour obtenir des
                    insights personnalisés.
                  </p>}
              </div>
            </motion.div>}
        </AnimatePresence>
      </GlassCard>
      {/* Financial data tabs */}
      <GlassCard className="p-6 mb-6" animate>
        <div className="flex flex-wrap border-b border-white/10 mb-4">
          <button className={`mr-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'incomes' ? `border-indigo-500 text-indigo-400` : 'border-transparent text-gray-400 hover:text-gray-300'}`} onClick={() => handleTabChange('incomes')}>
            Revenus
          </button>
          <button className={`mr-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'expenses' ? `border-indigo-500 text-indigo-400` : 'border-transparent text-gray-400 hover:text-gray-300'}`} onClick={() => handleTabChange('expenses')}>
            Dépenses
          </button>
          <button className={`mr-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'savings' ? `border-indigo-500 text-indigo-400` : 'border-transparent text-gray-400 hover:text-gray-300'}`} onClick={() => handleTabChange('savings')}>
            Épargne
          </button>
          <button className={`py-2 text-sm font-medium border-b-2 ${activeTab === 'debts' ? `border-indigo-500 text-indigo-400` : 'border-transparent text-gray-400 hover:text-gray-300'}`} onClick={() => handleTabChange('debts')}>
            Dettes
          </button>
        </div>
        {/* List of items */}
        <div className="mb-4">
          {financialData[activeTab].length === 0 ? <div className="text-center py-8">
              <p className="text-gray-400 mb-2">Aucun élément ajouté</p>
              <p className="text-sm text-gray-500">
                Cliquez sur "Ajouter" pour commencer
              </p>
            </div> : <div className="space-y-3">
              {financialData[activeTab].map(item => <div key={item.id} className="bg-black/20 p-3 rounded-lg">
                  {editingItemId === item.id ?
            // Editing mode
            <div>
                      <div className="flex items-center mb-3">
                        <input type="number" value={editingItem?.value || ''} onChange={e => setEditingItem({
                  ...editingItem!,
                  value: e.target.value
                })} className="bg-black/30 border border-white/10 rounded-lg py-1 px-2 w-28 text-white mr-2" placeholder="Montant" />
                        <span className="text-sm">€</span>
                        <div className="ml-auto flex space-x-2">
                          <button onClick={handleUpdateItem} className="p-1 bg-green-600/30 hover:bg-green-600/50 rounded-lg">
                            <CheckIcon className="h-4 w-4 text-green-400" />
                          </button>
                          <button onClick={() => {
                    setEditingItemId(null);
                    setEditingItem(null);
                  }} className="p-1 bg-red-600/30 hover:bg-red-600/50 rounded-lg">
                            <XIcon className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <select value={editingItem?.category || ''} onChange={e => setEditingItem({
                  ...editingItem!,
                  category: e.target.value
                })} className="bg-black/30 border border-white/10 rounded-lg py-1 px-2 text-white text-sm">
                          <option value="">Sélectionner une catégorie</option>
                          {getCategories().map(cat => <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>)}
                        </select>
                        <select value={editingItem?.frequency || 'monthly'} onChange={e => setEditingItem({
                  ...editingItem!,
                  frequency: e.target.value as any
                })} className="bg-black/30 border border-white/10 rounded-lg py-1 px-2 text-white text-sm">
                          {frequencyOptions.map(option => <option key={option.value} value={option.value}>
                              {option.label}
                            </option>)}
                        </select>
                      </div>
                      <input type="text" value={editingItem?.description || ''} onChange={e => setEditingItem({
                ...editingItem!,
                description: e.target.value
              })} className="bg-black/30 border border-white/10 rounded-lg py-1 px-2 w-full text-white text-sm" placeholder="Description (optionnel)" />
                    </div> :
            // Display mode
            <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg font-medium mr-1">
                            {typeof item.value === 'string' ? parseFloat(item.value).toLocaleString('fr-FR') : item.value.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-sm">€</span>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditItem(item.id!)} className="p-1 bg-indigo-600/30 hover:bg-indigo-600/50 rounded-lg">
                            <PencilIcon className="h-4 w-4 text-indigo-400" />
                          </button>
                          <button onClick={() => handleDeleteItem(item.id!)} className="p-1 bg-red-600/30 hover:bg-red-600/50 rounded-lg">
                            <TrashIcon className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="bg-black/30 px-2 py-1 rounded-lg text-xs mr-2">
                          {getCategories().find(cat => cat.value === item.category)?.label || item.category}
                        </div>
                        <div className="bg-black/30 px-2 py-1 rounded-lg text-xs">
                          {frequencyOptions.find(opt => opt.value === item.frequency)?.label || 'Mensuel'}
                        </div>
                      </div>
                      {item.description && <div className="mt-2 text-sm text-gray-300">
                          {item.description}
                        </div>}
                    </div>}
                </div>)}
            </div>}
        </div>
        {/* Add button */}
        <div className="flex justify-center mb-4">
          <button onClick={() => setIsAdding(!isAdding)} className={`flex items-center justify-center px-4 py-2 rounded-lg ${isAdding ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}>
            {isAdding ? <>
                <XIcon className="h-5 w-5 mr-2" />
                Annuler
              </> : <>
                <PlusIcon className="h-5 w-5 mr-2" />
                Ajouter
              </>}
          </button>
        </div>
        {/* Add form */}
        <AnimatePresence>
          {isAdding && <motion.div key="form-animation" initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} transition={{
          duration: 0.2,
          ease: 'easeInOut'
        }} className="overflow-hidden">
              <div className="bg-black/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-3">
                  Ajouter un élément à{' '}
                  {activeTab === 'incomes' ? 'vos revenus' : activeTab === 'expenses' ? 'vos dépenses' : activeTab === 'savings' ? 'votre épargne' : 'vos dettes'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input type="number" value={newItem.value} onChange={e => setNewItem({
                  ...newItem,
                  value: e.target.value
                })} className={`bg-black/30 border rounded-lg py-2 px-3 w-full text-white mr-2 ${!newItem.value || newItem.value === '' || parseFloat(newItem.value.toString()) <= 0 ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`} placeholder="Montant" min="0.01" step="0.01" required />
                    <span className="text-lg">€</span>
                  </div>
                  {(!newItem.value || newItem.value === '' || parseFloat(newItem.value.toString()) <= 0) && <div className="text-red-400 text-sm mt-1">
                      Veuillez entrer un montant positif valide
                    </div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select value={newItem.category} onChange={e => setNewItem({
                  ...newItem,
                  category: e.target.value
                })} className={`bg-black/30 border rounded-lg py-2 px-3 text-white ${!newItem.category || newItem.category === '' ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'}`} required>
                      <option value="">Sélectionner une catégorie</option>
                      {getCategories().map(cat => <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>)}
                    </select>
                    <select value={newItem.frequency} onChange={e => setNewItem({
                  ...newItem,
                  frequency: e.target.value as any
                })} className="bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white">
                      {frequencyOptions.map(option => <option key={option.value} value={option.value}>
                          {option.label}
                        </option>)}
                    </select>
                  </div>
                  {(!newItem.category || newItem.category === '') && <div className="text-red-400 text-sm mt-1">
                      Veuillez sélectionner une catégorie
                    </div>}
                  <input type="text" value={newItem.description} onChange={e => setNewItem({
                ...newItem,
                description: e.target.value
              })} className="bg-black/30 border border-white/10 rounded-lg py-2 px-3 w-full text-white" placeholder="Description (optionnel)" />
                  <div className="flex items-center">
                    <input type="checkbox" id="isRecurring" checked={newItem.isRecurring} onChange={e => setNewItem({
                  ...newItem,
                  isRecurring: e.target.checked
                })} className="mr-2" />
                    <label htmlFor="isRecurring" className="text-sm">
                      Récurrent
                    </label>
                  </div>
                  {/* Contextual tags */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-indigo-400" />
                      Tags contextuels
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag, index) => <button key={index} onClick={() => handleTagSelect(tag)} className={`px-2 py-1 rounded-full text-xs ${selectedTags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-black/30 text-gray-300 hover:bg-black/40'}`}>
                          {tag}
                        </button>)}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleAddItem} disabled={
                // Validation complète pour activation du bouton
                !newItem.value || newItem.value === '' || newItem.value === '0' || !newItem.category || newItem.category === '' || isNaN(parseFloat(newItem.value.toString())) || parseFloat(newItem.value.toString()) <= 0} className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                // Conditions pour déterminer l'apparence du bouton
                !newItem.value || newItem.value === '' || newItem.value === '0' || !newItem.category || newItem.category === '' || isNaN(parseFloat(newItem.value.toString())) || parseFloat(newItem.value.toString()) <= 0 ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none'}`}>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
        {/* Summary */}
        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <h3 className="text-sm font-medium mb-3">Résumé</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Revenus totaux</div>
              <div className="text-lg font-medium">
                {totalIncome.toLocaleString('fr-FR')}€
                <span className="text-xs text-gray-400 ml-1">/ mois</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Dépenses totales</div>
              <div className="text-lg font-medium">
                {totalExpenses.toLocaleString('fr-FR')}€
                <span className="text-xs text-gray-400 ml-1">/ mois</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Épargne totale</div>
              <div className="text-lg font-medium">
                {totalSavings.toLocaleString('fr-FR')}€
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Dettes totales</div>
              <div className="text-lg font-medium">
                {totalDebts.toLocaleString('fr-FR')}€
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400 mb-1">
                  Balance mensuelle
                </div>
                <div className={`text-lg font-medium ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {monthlyBalance.toLocaleString('fr-FR')}€
                </div>
              </div>
              <div className="flex items-center">
                {monthlyBalance >= 0 ? <ArrowUpIcon className="h-5 w-5 text-green-400 mr-1" /> : <ArrowDownIcon className="h-5 w-5 text-red-400 mr-1" />}
                <span className={`${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(monthlyBalance / (totalIncome || 1) * 100).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
      {/* Continue button */}
      <div className="flex justify-end">
        <button onClick={handleContinue} className={`btn btn-primary flex items-center justify-center`}>
          Continuer
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </button>
      </div>

      {/* Debug section - can be removed in production */}
      {process.env.NODE_ENV === 'development' && <GlassCard className="mt-6 p-4" animate>
          <h3 className="text-sm font-medium mb-2">Debug Info</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Active Tab: {activeTab}</div>
            <div>Items count: {financialData[activeTab]?.length || 0}</div>
            <div>New Item Value: {newItem.value || 'empty'}</div>
            <div>Is Adding: {isAdding ? 'true' : 'false'}</div>
            <div>Financial Data Valid: {financialData ? 'true' : 'false'}</div>
          </div>
        </GlassCard>}
    </div>;
}