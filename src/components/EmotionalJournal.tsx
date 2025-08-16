import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';
import { useFinanceStore } from '../stores/financeStore';
import { BookIcon, CalendarIcon, TagIcon, PencilIcon, TrashIcon, SaveIcon, MicIcon, PauseIcon, HeartIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon, FilterIcon, BarChart3Icon, LineChartIcon } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { format, parseISO, subDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Type for journal entry
interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  tags: string[];
  text: string;
  financialContext?: {
    income?: number;
    expenses?: number;
    balance?: number;
  };
}
export function EmotionalJournal() {
  const {
    theme,
    themeColors
  } = useTheme();
  const {
    emotionalContext,
    financialData
  } = useFinance();
  const {
    questionHistory
  } = useFinanceStore();
  // State for journal entries
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  // State for new entry
  const [newEntry, setNewEntry] = useState<Omit<JournalEntry, 'id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: emotionalContext?.mood || 5,
    tags: emotionalContext?.tags || [],
    text: ''
  });
  // State for UI
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [showChart, setShowChart] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // Available tags
  const availableTags = ['Travail', 'Famille', 'Santé', 'Budget', 'Épargne', 'Investissement', 'Dette', 'Stress', 'Confiance', 'Inquiétude', 'Optimisme', 'Décision'];
  // Generate mock journal entries on component mount
  useEffect(() => {
    const generateMockEntries = () => {
      const mockEntries: JournalEntry[] = [];
      // Create entries for the last 30 days
      for (let i = 30; i >= 0; i -= 2) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        // Generate random mood and tags
        const mood = Math.floor(Math.random() * 10) + 1;
        const tags = [];
        const tagCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < tagCount; j++) {
          const randomTag = availableTags[Math.floor(Math.random() * availableTags.length)];
          if (!tags.includes(randomTag)) {
            tags.push(randomTag);
          }
        }
        // Generate entry text based on mood
        let text = '';
        if (mood > 7) {
          text = "Aujourd'hui je me sens stressé(e) par rapport à mes finances. J'ai des inquiétudes concernant mes dépenses récentes et je me demande si je pourrai atteindre mes objectifs d'épargne.";
        } else if (mood > 4) {
          text = "Je me sens plutôt neutre aujourd'hui concernant ma situation financière. J'ai fait quelques dépenses mais rien d'excessif.";
        } else {
          text = "Je me sens très confiant(e) aujourd'hui ! J'ai réussi à mettre de côté une bonne partie de mon revenu et je vois des progrès vers mes objectifs financiers.";
        }
        // Add financial context
        const financialContext = {
          income: Math.random() * 1000 + 1500,
          expenses: Math.random() * 800 + 700,
          balance: 0
        };
        financialContext.balance = financialContext.income - financialContext.expenses;
        mockEntries.push({
          id: `entry-${i}`,
          date: dateStr,
          mood,
          tags,
          text,
          financialContext
        });
      }
      return mockEntries;
    };
    setEntries(generateMockEntries());
  }, []);
  // Filter entries when search term, tags, or date range changes
  useEffect(() => {
    let filtered = [...entries];
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry => entry.text.toLowerCase().includes(searchTerm.toLowerCase()) || entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry => selectedTags.some(tag => entry.tags.includes(tag)));
    }
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return (isAfter(entryDate, dateRange.start) || isSameDay(entryDate, dateRange.start)) && (isBefore(entryDate, dateRange.end) || isSameDay(entryDate, dateRange.end));
      });
    }
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredEntries(filtered);
  }, [entries, searchTerm, selectedTags, dateRange]);
  // Handle adding a new entry
  const handleAddEntry = () => {
    if (!newEntry.text.trim()) {
      toast.error('Veuillez entrer du texte pour votre note de journal');
      return;
    }
    // Create financial context based on current data
    const totalIncome = financialData.incomes.reduce((sum, item) => {
      const value = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    const totalExpenses = financialData.expenses.reduce((sum, item) => {
      const value = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    const financialContext = {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
    const newEntryWithId: JournalEntry = {
      ...newEntry,
      id: `entry-${Date.now()}`,
      financialContext
    };
    setEntries([newEntryWithId, ...entries]);
    setNewEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      mood: emotionalContext?.mood || 5,
      tags: [],
      text: ''
    });
    setIsAdding(false);
    toast.success('Note de journal ajoutée avec succès');
  };
  // Handle editing an entry
  const handleEditEntry = (id: string) => {
    const entry = entries.find(entry => entry.id === id);
    if (entry) {
      setNewEntry({
        date: entry.date,
        mood: entry.mood,
        tags: [...entry.tags],
        text: entry.text
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };
  // Handle updating an edited entry
  const handleUpdateEntry = () => {
    if (!editingId) return;
    if (!newEntry.text.trim()) {
      toast.error('Veuillez entrer du texte pour votre note de journal');
      return;
    }
    setEntries(entries.map(entry => entry.id === editingId ? {
      ...entry,
      ...newEntry
    } : entry));
    setNewEntry({
      date: format(new Date(), 'yyyy-MM-dd'),
      mood: emotionalContext?.mood || 5,
      tags: [],
      text: ''
    });
    setEditingId(null);
    setIsAdding(false);
    toast.success('Note de journal mise à jour avec succès');
  };
  // Handle deleting an entry
  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setIsAdding(false);
    }
    toast.success('Note de journal supprimée avec succès');
  };
  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (newEntry.tags.includes(tag)) {
      setNewEntry({
        ...newEntry,
        tags: newEntry.tags.filter(t => t !== tag)
      });
    } else {
      setNewEntry({
        ...newEntry,
        tags: [...newEntry.tags, tag]
      });
    }
  };
  // Handle filter tag selection
  const handleFilterTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  // Handle voice recording (mock functionality)
  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.success('Enregistrement terminé et transcrit');
      setNewEntry({
        ...newEntry,
        text: newEntry.text + " J'ai ajouté cette partie par dictée vocale pour compléter mes réflexions sur ma situation financière."
      });
    } else {
      setIsRecording(true);
      toast('Enregistrement en cours...', {
        icon: '🎤',
        duration: 2000
      });
      // Simulate recording for 2 seconds
      setTimeout(() => {
        setIsRecording(false);
        toast.success('Enregistrement terminé et transcrit');
        setNewEntry({
          ...newEntry,
          text: newEntry.text + " J'ai ajouté cette partie par dictée vocale pour compléter mes réflexions sur ma situation financière."
        });
      }, 2000);
    }
  };
  // Prepare data for mood chart
  const chartData = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(entry => ({
    date: format(parseISO(entry.date), 'dd/MM'),
    mood: entry.mood,
    balance: entry.financialContext?.balance || 0
  }));
  return <div className="w-full max-w-6xl mx-auto pb-20">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Journal Émotionnel</h1>
        <p className={`${themeColors?.textSecondary || 'text-gray-400'}`}>
          Suivez vos émotions et leur impact sur vos décisions financières
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Add entry and filters */}
        <div className="lg:col-span-1">
          {/* Add entry card */}
          <GlassCard className="p-6 mb-6" animate>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <BookIcon className="h-5 w-5 mr-2 text-indigo-400" />
                {editingId ? 'Modifier la note' : 'Nouvelle note'}
              </h2>
              {isAdding && !editingId && <button onClick={() => setIsAdding(false)} className="text-sm text-gray-400 hover:text-white">
                  Annuler
                </button>}
            </div>
            {isAdding ? <div className="space-y-4">
                {/* Date picker */}
                <div>
                  <label className="block text-sm mb-1">Date</label>
                  <input type="date" value={newEntry.date} onChange={e => setNewEntry({
                ...newEntry,
                date: e.target.value
              })} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white" max={format(new Date(), 'yyyy-MM-dd')} />
                </div>
                {/* Mood slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm">Niveau d'humeur</label>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">{newEntry.mood}/10</span>
                      <span className="text-xl">
                        {newEntry.mood > 7 ? '😰' : newEntry.mood > 5 ? '😐' : newEntry.mood > 3 ? '🙂' : '😌'}
                      </span>
                    </div>
                  </div>
                  <input type="range" min="1" max="10" value={newEntry.mood} onChange={e => setNewEntry({
                ...newEntry,
                mood: parseInt(e.target.value)
              })} className="w-full" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>Détendu</span>
                    <span>Neutre</span>
                    <span>Stressé</span>
                  </div>
                </div>
                {/* Tags */}
                <div>
                  <label className="block text-sm mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag, index) => <button key={index} onClick={() => handleTagSelect(tag)} className={`px-2 py-1 rounded-full text-xs ${newEntry.tags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-black/30 text-gray-300 hover:bg-black/40'}`}>
                        {tag}
                      </button>)}
                  </div>
                </div>
                {/* Text area */}
                <div>
                  <label className="block text-sm mb-1">Votre note</label>
                  <div className="relative">
                    <textarea value={newEntry.text} onChange={e => setNewEntry({
                  ...newEntry,
                  text: e.target.value
                })} placeholder="Comment vous sentez-vous par rapport à votre situation financière aujourd'hui ?" className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white min-h-[150px]"></textarea>
                    <button onClick={handleVoiceRecord} className={`absolute bottom-2 right-2 p-2 rounded-full ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-black/40 hover:bg-black/50'}`} title="Enregistrer une note vocale">
                      {isRecording ? <PauseIcon className="h-4 w-4" /> : <MicIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {/* Submit button */}
                <div className="flex justify-end">
                  <button onClick={editingId ? handleUpdateEntry : handleAddEntry} className="flex items-center bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
                    <SaveIcon className="h-5 w-5 mr-2" />
                    {editingId ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </div> : <div className="flex flex-col items-center justify-center py-6">
                <p className="text-gray-400 mb-4 text-center">
                  Notez vos pensées et émotions pour mieux comprendre vos
                  décisions financières
                </p>
                <button onClick={() => setIsAdding(true)} className="flex items-center bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Nouvelle note
                </button>
              </div>}
          </GlassCard>
          {/* Filters card */}
          <GlassCard className="p-6" animate>
            <h2 className="text-xl font-bold flex items-center mb-4">
              <FilterIcon className="h-5 w-5 mr-2 text-indigo-400" />
              Filtres
            </h2>
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm mb-1">Recherche</label>
                <div className="relative">
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher dans vos notes..." className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white" />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              {/* Date range */}
              <div>
                <label className="block text-sm mb-1">Période</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1 text-gray-400">
                      Début
                    </label>
                    <input type="date" value={dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : ''} onChange={e => setDateRange({
                    ...dateRange,
                    start: e.target.value ? parseISO(e.target.value) : null
                  })} className="w-full bg-black/20 border border-white/10 rounded-lg py-1.5 px-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-400">
                      Fin
                    </label>
                    <input type="date" value={dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : ''} onChange={e => setDateRange({
                    ...dateRange,
                    end: e.target.value ? parseISO(e.target.value) : null
                  })} className="w-full bg-black/20 border border-white/10 rounded-lg py-1.5 px-2 text-white text-sm" max={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                </div>
              </div>
              {/* Filter by tags */}
              <div>
                <label className="block text-sm mb-1">Filtrer par tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag, index) => <button key={index} onClick={() => handleFilterTagSelect(tag)} className={`px-2 py-1 rounded-full text-xs ${selectedTags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-black/30 text-gray-300 hover:bg-black/40'}`}>
                      {tag}
                    </button>)}
                </div>
              </div>
              {/* Mood chart toggle */}
              <div>
                <button onClick={() => setShowChart(!showChart)} className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${showChart ? 'bg-indigo-600' : 'bg-black/30 hover:bg-black/40'}`}>
                  <LineChartIcon className="h-4 w-4 mr-1" />
                  {showChart ? 'Masquer le graphique' : "Afficher l'évolution d'humeur"}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
        {/* Right column: Journal entries and chart */}
        <div className="lg:col-span-2">
          {/* Mood chart */}
          {showChart && <GlassCard className="p-6 mb-6" animate>
              <h2 className="text-xl font-bold flex items-center mb-4">
                <LineChartIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Évolution de l'humeur
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#aaa" />
                    <YAxis yAxisId="left" stroke="#8884d8" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px'
                }} />
                    <Line yAxisId="left" type="monotone" dataKey="mood" name="Humeur" stroke="#8884d8" activeDot={{
                  r: 8
                }} />
                    <Line yAxisId="right" type="monotone" dataKey="balance" name="Balance (€)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-black/20 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Analyse</h3>
                <p className="text-sm text-gray-300">
                  {entries.length > 5 ? 'On observe une corrélation entre votre humeur et votre balance financière. Les jours où votre humeur est meilleure, votre balance financière tend également à être plus élevée.' : "Ajoutez plus d'entrées pour obtenir une analyse détaillée de la relation entre votre humeur et vos finances."}
                </p>
              </div>
            </GlassCard>}
          {/* Journal entries */}
          <GlassCard className="p-6" animate>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <BookIcon className="h-5 w-5 mr-2 text-indigo-400" />
                Vos notes de journal
              </h2>
              <span className="text-sm bg-black/30 px-3 py-1 rounded-full">
                {filteredEntries.length} notes
              </span>
            </div>
            {filteredEntries.length === 0 ? <div className="text-center py-10">
                <p className="text-gray-400 mb-2">Aucune note trouvée</p>
                <p className="text-sm text-gray-500">
                  {entries.length > 0 ? 'Essayez de modifier vos filtres' : 'Commencez à écrire votre première note de journal'}
                </p>
              </div> : <div className="space-y-4">
                {filteredEntries.map(entry => <div key={entry.id} className="bg-black/20 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">
                          {format(parseISO(entry.date), 'dd MMMM yyyy', {
                      locale: fr
                    })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-black/30 px-2 py-1 rounded-full">
                          <HeartIcon className="h-3 w-3 mr-1 text-indigo-400" />
                          <span className="text-xs">{entry.mood}/10</span>
                        </div>
                        <button onClick={() => handleEditEntry(entry.id)} className="p-1 bg-indigo-600/30 hover:bg-indigo-600/50 rounded-lg">
                          <PencilIcon className="h-4 w-4 text-indigo-400" />
                        </button>
                        <button onClick={() => handleDeleteEntry(entry.id)} className="p-1 bg-red-600/30 hover:bg-red-600/50 rounded-lg">
                          <TrashIcon className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    {entry.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-3">
                        {entry.tags.map((tag, index) => <span key={index} className="bg-black/30 text-gray-300 px-2 py-0.5 rounded-full text-xs flex items-center">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </span>)}
                      </div>}
                    <p className="text-sm mb-3">{entry.text}</p>
                    {entry.financialContext && <div className="bg-black/30 p-2 rounded-lg mt-2">
                        <h4 className="text-xs font-medium mb-1 text-gray-400">
                          Contexte financier
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Revenus:</span>
                            <span className="ml-1">
                              {entry.financialContext.income?.toLocaleString('fr-FR')}
                              €
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Dépenses:</span>
                            <span className="ml-1">
                              {entry.financialContext.expenses?.toLocaleString('fr-FR')}
                              €
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Balance:</span>
                            <span className={`ml-1 ${(entry.financialContext.balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {entry.financialContext.balance?.toLocaleString('fr-FR')}
                              €
                            </span>
                          </div>
                        </div>
                      </div>}
                  </div>)}
              </div>}
          </GlassCard>
        </div>
      </div>
    </div>;
}