import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useFinanceStore } from '../stores/financeStore';
import { GlassCard } from './ui/GlassCard';
import { ArrowRightIcon, SearchIcon, HeartIcon, BrainIcon, LayoutDashboardIcon, RefreshCwIcon, TrendingUpIcon, AlertCircleIcon, ThumbsUpIcon, ThumbsDownIcon, SmileIcon, FrownIcon, MehIcon, CheckIcon, XIcon, HistoryIcon, TagIcon, MessageCircleIcon, RefreshCcwIcon, LightbulbIcon, ChevronRightIcon } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { QuestionSuggestion } from '../types/finance';
// Type pour l'historique des questions avec contexte
interface QuestionHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  emotionalContext?: {
    mood: number;
    tags: string[];
  };
}
// Type pour les tags contextuels
interface ContextualTag {
  id: string;
  label: string;
  category: 'work' | 'family' | 'health' | 'finance' | 'other';
}
// Type pour les archétypes animaux d'humeur
interface MoodArchetype {
  id: string;
  animal: string;
  label: string;
  description: string;
  moodValue: number;
  emoji: string;
}
export function QuestionScreen() {
  const navigate = useNavigate();
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    setUserQuestion,
    setEmotionalContext
  } = useFinance();
  const {
    addQuestionToHistory,
    setHasCompletedOnboarding,
    questionHistory
  } = useFinanceStore();
  // États locaux
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: question, 2: émotion
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  // Nouveaux états pour les fonctionnalités demandées
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showMicroSurvey, setShowMicroSurvey] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('neutral');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState<QuestionHistoryItem[]>([]);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  // Référence pour l'animation du slider d'humeur
  const sliderRef = useRef<HTMLDivElement>(null);
  // Archétypes animaux pour le slider d'humeur
  const moodArchetypes: MoodArchetype[] = [{
    id: 'turtle',
    animal: 'Tortue',
    label: 'Prudent(e)',
    description: 'Vous êtes prudent et méthodique dans vos décisions financières',
    moodValue: 3,
    emoji: '🐢'
  }, {
    id: 'owl',
    animal: 'Hibou',
    label: 'Réfléchi(e)',
    description: 'Vous analysez soigneusement vos options avant de prendre des décisions',
    moodValue: 4,
    emoji: '🦉'
  }, {
    id: 'neutral',
    animal: 'Dauphin',
    label: 'Équilibré(e)',
    description: 'Vous êtes équilibré entre prudence et opportunisme',
    moodValue: 5,
    emoji: '🐬'
  }, {
    id: 'fox',
    animal: 'Renard',
    label: 'Astucieux(se)',
    description: 'Vous cherchez les opportunités et les solutions créatives',
    moodValue: 6,
    emoji: '🦊'
  }, {
    id: 'rabbit',
    animal: 'Lapin',
    label: 'Nerveux(se)',
    description: 'Vous êtes souvent anxieux concernant vos finances',
    moodValue: 8,
    emoji: '🐇'
  }];
  // Tags contextuels disponibles
  const contextualTags: ContextualTag[] = [{
    id: 'work_stress',
    label: 'Stress au travail',
    category: 'work'
  }, {
    id: 'salary_negotiation',
    label: 'Négociation salariale',
    category: 'work'
  }, {
    id: 'job_change',
    label: "Changement d'emploi",
    category: 'work'
  }, {
    id: 'family_event',
    label: 'Événement familial',
    category: 'family'
  }, {
    id: 'education_costs',
    label: "Coûts d'éducation",
    category: 'family'
  }, {
    id: 'medical_expenses',
    label: 'Dépenses médicales',
    category: 'health'
  }, {
    id: 'market_volatility',
    label: 'Volatilité du marché',
    category: 'finance'
  }, {
    id: 'unexpected_expense',
    label: 'Dépense imprévue',
    category: 'finance'
  }, {
    id: 'major_purchase',
    label: 'Achat important',
    category: 'finance'
  }, {
    id: 'retirement_planning',
    label: 'Planification retraite',
    category: 'finance'
  }, {
    id: 'debt_concern',
    label: 'Inquiétude dette',
    category: 'finance'
  }];
  // Suggestions de questions prédéfinies
  const questionSuggestions: QuestionSuggestion[] = [{
    id: 'budget',
    text: 'Comment optimiser mon budget mensuel ?',
    category: 'budget',
    icon: <LayoutDashboardIcon className="h-4 w-4" />
  }, {
    id: 'investment',
    text: 'Quels investissements me conviendraient avec mon profil de risque ?',
    category: 'investment',
    icon: <TrendingUpIcon className="h-4 w-4" />
  }, {
    id: 'emergency',
    text: "Comment constituer un fonds d'urgence efficace ?",
    category: 'saving',
    icon: <AlertCircleIcon className="h-4 w-4" />
  }, {
    id: 'debt',
    text: 'Quelle est la meilleure stratégie pour rembourser mes dettes ?',
    category: 'debt',
    icon: <RefreshCwIcon className="h-4 w-4" />
  }];
  // Liste des émotions disponibles
  const emotions = [{
    id: 'inquiet',
    label: 'Inquiet(e)',
    icon: <FrownIcon className="h-4 w-4" />
  }, {
    id: 'confiant',
    label: 'Confiant(e)',
    icon: <ThumbsUpIcon className="h-4 w-4" />
  }, {
    id: 'stresse',
    label: 'Stressé(e)',
    icon: <AlertCircleIcon className="h-4 w-4" />
  }, {
    id: 'optimiste',
    label: 'Optimiste',
    icon: <SmileIcon className="h-4 w-4" />
  }, {
    id: 'frustre',
    label: 'Frustré(e)',
    icon: <ThumbsDownIcon className="h-4 w-4" />
  }, {
    id: 'confus',
    label: 'Confus(e)',
    icon: <MehIcon className="h-4 w-4" />
  }, {
    id: 'motive',
    label: 'Motivé(e)',
    icon: <TrendingUpIcon className="h-4 w-4" />
  }, {
    id: 'curieux',
    label: 'Curieux(se)',
    icon: <SearchIcon className="h-4 w-4" />
  }];
  // Fonction pour simuler une analyse IA de la question
  const analyzeQuestion = (input: string) => {
    // Dans une implémentation réelle, on utiliserait Transformers.js ici
    if (input.length < 3) return [];
    const suggestions = [];
    // Suggestions basées sur des mots-clés simples
    if (input.toLowerCase().includes('budget')) {
      suggestions.push('Comment puis-je réduire mes dépenses mensuelles ?');
      suggestions.push('Comment créer un budget qui fonctionne sur le long terme ?');
    }
    if (input.toLowerCase().includes('investir') || input.toLowerCase().includes('investissement')) {
      suggestions.push('Quels sont les investissements à faible risque adaptés aux débutants ?');
      suggestions.push("Comment diversifier mon portefeuille d'investissement ?");
    }
    if (input.toLowerCase().includes('dette') || input.toLowerCase().includes('crédit')) {
      suggestions.push('Quelle dette devrais-je rembourser en premier ?');
      suggestions.push("Comment négocier un meilleur taux d'intérêt sur mes crédits ?");
    }
    if (input.toLowerCase().includes('épargne')) {
      suggestions.push('Combien devrais-je épargner chaque mois ?');
      suggestions.push("Quels sont les meilleurs comptes d'épargne actuellement ?");
    }
    // Limiter à 3 suggestions maximum
    return suggestions.slice(0, 3);
  };
  // Gérer la recherche dans l'historique
  const handleHistorySearch = (term: string) => {
    setHistorySearchTerm(term);
    // Recherche floue simple
    if (!term.trim()) {
      setFilteredHistory([]);
      return;
    }
    // Convertir l'historique des questions en format approprié
    const historyItems: QuestionHistoryItem[] = questionHistory.map((q, index) => ({
      id: `hist-${index}`,
      text: q,
      timestamp: Date.now() - index * 86400000 // Juste pour simuler des dates différentes
    }));
    // Recherche simple (dans une implémentation réelle, utiliser une bibliothèque de recherche floue)
    const results = historyItems.filter(item => item.text.toLowerCase().includes(term.toLowerCase()));
    setFilteredHistory(results);
  };
  // Détecter quand l'utilisateur est en train de taper
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    if (question.length > 0) {
      setIsTyping(true);
      const timeout = setTimeout(() => {
        setIsTyping(false);
        // Générer des suggestions IA après que l'utilisateur ait arrêté de taper
        const suggestions = analyzeQuestion(question);
        setAiSuggestions(suggestions);
        // Afficher le micro-sondage si la question est assez longue
        if (question.length > 15 && !showMicroSurvey) {
          setShowMicroSurvey(true);
        }
      }, 1000);
      setTypingTimeout(timeout);
    } else {
      setIsTyping(false);
      setAiSuggestions([]);
      setShowMicroSurvey(false);
    }
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [question]);
  // Mettre à jour le niveau de stress en fonction de l'archétype sélectionné
  useEffect(() => {
    const archetype = moodArchetypes.find(a => a.id === selectedArchetype);
    if (archetype) {
      setStressLevel(archetype.moodValue);
    }
  }, [selectedArchetype]);
  // Gérer la sélection d'une question suggérée
  const handleSuggestionClick = (suggestion: QuestionSuggestion) => {
    setQuestion(suggestion.text);
  };
  // Gérer la sélection d'une suggestion IA
  const handleAiSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    setAiSuggestions([]);
    setShowMicroSurvey(true);
  };
  // Gérer la sélection d'un élément de l'historique
  const handleHistoryItemClick = (item: QuestionHistoryItem) => {
    setQuestion(item.text);
    setShowHistory(false);
    setHistorySearchTerm('');
    setFilteredHistory([]);
  };
  // Gérer la sélection/déselection d'une émotion
  const toggleEmotion = (emotionId: string) => {
    if (selectedEmotions.includes(emotionId)) {
      setSelectedEmotions(selectedEmotions.filter(id => id !== emotionId));
    } else {
      // Limiter à 3 émotions maximum
      if (selectedEmotions.length < 3) {
        setSelectedEmotions([...selectedEmotions, emotionId]);
      } else {
        toast.error('Vous pouvez sélectionner 3 émotions maximum');
      }
    }
  };
  // Gérer la sélection/déselection d'un tag contextuel
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      // Limiter à 3 tags maximum
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tagId]);
      } else {
        toast.error('Vous pouvez sélectionner 3 tags maximum');
      }
    }
  };
  // Soumettre la question et passer à l'étape suivante
  const handleSubmitQuestion = () => {
    if (!question.trim()) {
      toast.error('Veuillez entrer une question');
      return;
    }
    setIsSubmitting(true);
    // Simuler un délai de traitement
    setTimeout(() => {
      setUserQuestion(question);
      addQuestionToHistory(question);
      setIsSubmitting(false);
      setStep(2); // Passer à l'étape des émotions
    }, 800);
  };
  // Soumettre le contexte émotionnel et continuer
  const handleSubmitEmotions = () => {
    setIsSubmitting(true);
    // Créer le contexte émotionnel
    const emotionalContext = {
      mood: stressLevel,
      tags: [...selectedEmotions.map(id => {
        const emotion = emotions.find(e => e.id === id);
        return emotion ? emotion.label : id;
      }), ...selectedTags.map(id => {
        const tag = contextualTags.find(t => t.id === id);
        return tag ? tag.label : id;
      })]
    };
    // Simuler un délai de traitement
    setTimeout(() => {
      setEmotionalContext(emotionalContext);
      setHasCompletedOnboarding(true);
      setIsSubmitting(false);
      navigate('/mapping'); // Naviguer vers l'écran de cartographie
    }, 800);
  };
  // Animation pour le slider d'humeur
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setStressLevel(value);
    // Trouver l'archétype le plus proche
    let closestArchetype = moodArchetypes[0];
    let minDifference = Math.abs(moodArchetypes[0].moodValue - value);
    moodArchetypes.forEach(archetype => {
      const difference = Math.abs(archetype.moodValue - value);
      if (difference < minDifference) {
        minDifference = difference;
        closestArchetype = archetype;
      }
    });
    setSelectedArchetype(closestArchetype.id);
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
          <h1 className="text-3xl font-bold">Rivela</h1>
        </div>
      </motion.div>

      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${step === 1 ? `bg-gradient-to-r ${themeColors.primary}` : 'bg-white'}`}></div>
          <div className="w-12 h-1 bg-white/20 rounded-full"></div>
          <div className={`w-3 h-3 rounded-full ${step === 2 ? `bg-gradient-to-r ${themeColors.primary}` : 'bg-white/20'}`}></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Étape 1: Question financière */}
        {step === 1 && <motion.div key="question-step" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: -20
      }} transition={{
        duration: 0.3
      }}>
            <GlassCard className="p-6 mb-6" animate>
              <h2 className="text-xl font-bold mb-4">
                Quelle est votre question financière ?
              </h2>
              <p className={`text-sm ${themeColors.textSecondary} mb-6`}>
                Posez votre question pour obtenir des réponses personnalisées et
                des insights sur votre situation financière.
              </p>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex: Comment optimiser mon budget mensuel ?" className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex">
                  {isTyping && <div className="flex space-x-1 mr-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{
                  animationDelay: '0ms'
                }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{
                  animationDelay: '150ms'
                }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{
                  animationDelay: '300ms'
                }}></div>
                    </div>}
                  {questionHistory.length > 0 && <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-black/30 rounded-full" title="Historique des questions">
                      <HistoryIcon className="h-4 w-4 text-gray-400" />
                    </button>}
                </div>
              </div>
              {/* Historique des questions */}
              <AnimatePresence>
                {showHistory && <motion.div className="bg-black/30 rounded-lg p-4 mb-4" initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: 'auto'
            }} exit={{
              opacity: 0,
              height: 0
            }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">
                        Historique des questions
                      </h3>
                      <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-black/30 rounded-full">
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative mb-2">
                      <input type="text" value={historySearchTerm} onChange={e => handleHistorySearch(e.target.value)} placeholder="Rechercher dans l'historique..." className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {historySearchTerm ? filteredHistory.length > 0 ? filteredHistory.map(item => <button key={item.id} onClick={() => handleHistoryItemClick(item)} className="w-full text-left p-2 hover:bg-black/20 rounded-lg flex items-center text-sm mb-1">
                              <HistoryIcon className="h-3 w-3 mr-2 text-gray-400" />
                              <span className="truncate">{item.text}</span>
                            </button>) : <p className="text-sm text-gray-500 p-2">
                            Aucun résultat trouvé
                          </p> : questionHistory.slice(0, 5).map((q, index) => <button key={index} onClick={() => handleHistoryItemClick({
                  id: `hist-${index}`,
                  text: q,
                  timestamp: Date.now() - index * 86400000
                })} className="w-full text-left p-2 hover:bg-black/20 rounded-lg flex items-center text-sm mb-1">
                            <HistoryIcon className="h-3 w-3 mr-2 text-gray-400" />
                            <span className="truncate">{q}</span>
                          </button>)}
                    </div>
                  </motion.div>}
              </AnimatePresence>
              {/* Suggestions IA */}
              <AnimatePresence>
                {aiSuggestions.length > 0 && <motion.div className="mb-4" initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }}>
                    <div className="flex items-center mb-2">
                      <LightbulbIcon className="h-4 w-4 text-yellow-400 mr-2" />
                      <h3 className="text-sm font-medium">
                        Suggestions intelligentes
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => <button key={index} onClick={() => handleAiSuggestionClick(suggestion)} className="w-full text-left p-2 bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-500/20 rounded-lg text-sm flex items-center">
                          <span className="mr-2">💡</span>
                          {suggestion}
                        </button>)}
                    </div>
                  </motion.div>}
              </AnimatePresence>
              {/* Micro-sondage */}
              <AnimatePresence>
                {showMicroSurvey && <motion.div className="mb-6 bg-black/20 p-3 rounded-lg" initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: 0.95
            }}>
                    <div className="flex items-center mb-2">
                      <MessageCircleIcon className="h-4 w-4 text-indigo-400 mr-2" />
                      <p className="text-sm">
                        Cette question vous semble-t-elle juste ?
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => {
                  setShowMicroSurvey(false);
                  toast.success('Merci pour votre feedback !');
                }} className="flex-1 py-1.5 bg-green-900/20 hover:bg-green-900/30 border border-green-500/20 rounded-lg text-sm flex items-center justify-center">
                        <ThumbsUpIcon className="h-4 w-4 mr-2 text-green-400" />
                        Oui, c'est bien ça
                      </button>
                      <button onClick={() => {
                  setShowMicroSurvey(false);
                  // Proposer de nouvelles suggestions
                  setAiSuggestions(['Comment puis-je améliorer ma situation financière ?', "Quelles sont les meilleures stratégies d'épargne pour moi ?", 'Comment puis-je réduire mon stress financier ?']);
                  toast.success('Nous avons généré de nouvelles suggestions pour vous');
                }} className="flex-1 py-1.5 bg-yellow-900/20 hover:bg-yellow-900/30 border border-yellow-500/20 rounded-lg text-sm flex items-center justify-center">
                        <RefreshCcwIcon className="h-4 w-4 mr-2 text-yellow-400" />
                        Suggérer des alternatives
                      </button>
                    </div>
                  </motion.div>}
              </AnimatePresence>
              {/* Suggestions prédéfinies */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Suggestions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {questionSuggestions.map(suggestion => <button key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)} className="flex items-center p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors text-left">
                      <div className={`p-2 rounded-full bg-gradient-to-r ${themeColors.primary} bg-opacity-20 mr-3`}>
                        {suggestion.icon}
                      </div>
                      <span className="text-sm">{suggestion.text}</span>
                    </button>)}
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSubmitQuestion} disabled={isSubmitting || !question.trim()} className={`btn btn-primary flex items-center justify-center ${isSubmitting || !question.trim() ? 'opacity-70' : ''}`}>
                  {isSubmitting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <ArrowRightIcon className="mr-2 h-5 w-5" />}
                  Continuer
                </button>
              </div>
            </GlassCard>
            <GlassCard className="p-6" animate>
              <div className="flex items-center mb-4">
                <LayoutDashboardIcon className="h-5 w-5 mr-2 text-indigo-400" />
                <h3 className="font-medium">À propos de Rivela</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Rivela combine l'analyse financière avancée avec votre contexte
                émotionnel pour vous offrir des insights personnalisés et vous
                aider à prendre de meilleures décisions financières.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center p-3 bg-black/20 rounded-lg">
                  <BrainIcon className="h-5 w-5 mr-3 text-purple-400" />
                  <span className="text-sm">Analyse intelligente</span>
                </div>
                <div className="flex items-center p-3 bg-black/20 rounded-lg">
                  <HeartIcon className="h-5 w-5 mr-3 text-red-400" />
                  <span className="text-sm">Contexte émotionnel</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>}

        {/* Étape 2: Contexte émotionnel */}
        {step === 2 && <motion.div key="emotion-step" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: 20
      }} transition={{
        duration: 0.3
      }}>
            <GlassCard className="p-6 mb-6" animate>
              <h2 className="text-xl font-bold mb-2">
                Votre contexte émotionnel
              </h2>
              <p className={`text-sm ${themeColors.textSecondary} mb-6`}>
                Pour vous offrir des conseils vraiment personnalisés, nous
                prenons en compte votre état émotionnel actuel face à vos
                finances.
              </p>
              <div className="bg-black/20 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-medium mb-3">Votre question</h3>
                <p className="text-lg bg-black/20 p-3 rounded-lg">{question}</p>
              </div>
              {/* Slider d'humeur avec archétypes animaux */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-2">
                  Comment vous sentez-vous par rapport à vos finances ?
                </h3>
                <div className="relative mt-8 mb-10" ref={sliderRef}>
                  {/* Archétypes animaux */}
                  <div className="absolute -top-14 w-full flex justify-between px-4">
                    {moodArchetypes.map(archetype => <div key={archetype.id} className={`flex flex-col items-center transition-all duration-300 transform ${selectedArchetype === archetype.id ? 'scale-125' : 'opacity-60 scale-100'}`} style={{
                  left: `${(archetype.moodValue - 1) * 11.1}%`,
                  position: 'absolute'
                }}>
                        <div className={`text-2xl ${selectedArchetype === archetype.id ? 'animate-bounce' : ''}`} style={{
                    animationDuration: '2s'
                  }}>
                          {archetype.emoji}
                        </div>
                        <span className="text-xs mt-1 whitespace-nowrap">
                          {archetype.label}
                        </span>
                      </div>)}
                  </div>
                  {/* Slider */}
                  <input type="range" min="1" max="10" value={stressLevel} onChange={handleSliderChange} className="w-full" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>Détendu</span>
                    <span>Neutre</span>
                    <span>Très stressé</span>
                  </div>
                </div>
                {/* Description de l'archétype sélectionné */}
                <motion.div className="bg-black/20 p-3 rounded-lg mt-4" key={selectedArchetype} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.3
            }}>
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">
                      {moodArchetypes.find(a => a.id === selectedArchetype)?.emoji}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        {moodArchetypes.find(a => a.id === selectedArchetype)?.animal}{' '}
                        -
                        {moodArchetypes.find(a => a.id === selectedArchetype)?.label}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {moodArchetypes.find(a => a.id === selectedArchetype)?.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
              {/* Tags contextuels */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <TagIcon className="h-4 w-4 mr-2 text-indigo-400" />
                  <h3 className="text-sm font-medium">
                    Contexte de votre question
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Sélectionnez jusqu'à 3 tags qui décrivent votre situation
                  actuelle
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {contextualTags.map(tag => <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`flex items-center p-2 rounded-lg transition-colors text-sm ${selectedTags.includes(tag.id) ? `bg-gradient-to-r ${themeColors.secondary} text-white` : 'bg-black/20 hover:bg-black/30'}`}>
                      <TagIcon className="h-3 w-3 mr-2" />
                      <span>{tag.label}</span>
                    </button>)}
                </div>
              </div>
              {/* Émotions */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">
                  Comment vous sentez-vous par rapport à vos finances ?
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Sélectionnez jusqu'à 3 émotions
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {emotions.map(emotion => <button key={emotion.id} onClick={() => toggleEmotion(emotion.id)} className={`flex items-center p-2 rounded-lg transition-colors ${selectedEmotions.includes(emotion.id) ? `bg-gradient-to-r ${themeColors.primary} text-white` : 'bg-black/20 hover:bg-black/30'}`}>
                      <div className="p-1 mr-2">{emotion.icon}</div>
                      <span className="text-sm">{emotion.label}</span>
                    </button>)}
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn btn-outline flex items-center">
                  Retour
                </button>
                <button onClick={handleSubmitEmotions} disabled={isSubmitting} className={`btn btn-primary flex items-center justify-center ${isSubmitting ? 'opacity-70' : ''}`}>
                  {isSubmitting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div> : <ArrowRightIcon className="mr-2 h-5 w-5" />}
                  Continuer
                </button>
              </div>
            </GlassCard>
            <GlassCard className="p-6" animate>
              <div className="flex items-center mb-4">
                <HeartIcon className="h-5 w-5 mr-2 text-red-400" />
                <h3 className="font-medium">
                  Pourquoi prendre en compte vos émotions ?
                </h3>
              </div>
              <p className="text-sm text-gray-300">
                Les décisions financières sont souvent influencées par nos
                émotions. En comprenant votre état émotionnel, Rivela peut vous
                offrir des conseils plus adaptés à votre situation personnelle
                et vous aider à prendre des décisions plus équilibrées.
              </p>
            </GlassCard>
          </motion.div>}
      </AnimatePresence>
    </div>;
}