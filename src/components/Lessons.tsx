import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SearchIcon, GraduationCapIcon, BookOpenIcon, ClockIcon, StarIcon, FilterIcon, ChevronRightIcon, CheckCircleIcon, PlayCircleIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react';
import { fetchEducationContent, EducationResource } from '../services/education';
import { Lesson } from '@/types/domain';

export function Lessons() {
  const navigate = useNavigate();
  const {
    themeColors
  } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  useEffect(() => {
    const loadLessons = async () => {
      setIsLoading(true);
      try {
        const educationalContent = await fetchEducationContent();
        const lessonsData = educationalContent.map((resource, index) => ({
          id: resource.key,
          title: resource.title,
          description: `Un livre par ${resource.author_name.join(', ')}, publié en ${resource.first_publish_year}.`,
          category: 'Littérature financière',
          level: index % 3 === 0 ? 'débutant' : index % 3 === 1 ? 'intermédiaire' : 'avancé',
          duration: 60, // Placeholder
          image: `https://covers.openlibrary.org/b/id/${resource.key}-M.jpg`,
          url: `https://openlibrary.org${resource.key}`,
          completed: false,
          progress: 0,
          lastUpdated: resource.first_publish_year.toString(),
          source: 'Open Library',
          rating: 4.5, // Placeholder
        }));
        setLessons(lessonsData);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Erreur lors du chargement des leçons');
      } finally {
        setIsLoading(false);
      }
    };
    loadLessons();
  }, []);
  // Filter lessons based on search term, category, and level
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? lesson.category === selectedCategory : true;
    const matchesLevel = selectedLevel ? lesson.level === selectedLevel : true;
    return matchesSearch && matchesCategory && matchesLevel;
  });
  // Get unique categories
  const categories = Array.from(new Set(lessons.map(lesson => lesson.category)));
  // Get unique levels
  const levels = ['débutant', 'intermédiaire', 'avancé'];
  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    // Open the lesson URL in a new tab
    window.open(lesson.url, '_blank', 'noopener,noreferrer');
  };
  return <div className="w-full max-w-6xl mx-auto pb-20">
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
            <h1 className="text-3xl font-bold">Leçons financières</h1>
            <p className={`${themeColors?.textSecondary || 'text-gray-400'}`}>
              Développez vos connaissances avec nos leçons à jour et complètes
            </p>
          </div>
        </div>
        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Rechercher des leçons..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" aria-label="Rechercher des leçons" />
            </div>
          </div>
          <div>
            <select value={selectedCategory || ''} onChange={e => setSelectedCategory(e.target.value || null)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" aria-label="Filtrer par catégorie">
              <option value="">Toutes les catégories</option>
              {categories.map((category, index) => <option key={index} value={category}>
                  {category}
                </option>)}
            </select>
          </div>
          <div>
            <select value={selectedLevel || ''} onChange={e => setSelectedLevel(e.target.value || null)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" aria-label="Filtrer par niveau">
              <option value="">Tous les niveaux</option>
              {levels.map((level, index) => <option key={index} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>)}
            </select>
          </div>
        </div>
      </motion.div>
      {/* Lessons grid */}
      {isLoading ? <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div> : <>
          {filteredLessons.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map(lesson => <GlassCard key={lesson.id} className="flex flex-col overflow-hidden" animate hover>
                  <div className="h-40 bg-cover bg-center relative" style={{
            backgroundImage: `url(${lesson.image})`
          }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${lesson.level === 'débutant' ? 'bg-green-500/20 text-green-300' : lesson.level === 'intermédiaire' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                          {lesson.level.charAt(0).toUpperCase() + lesson.level.slice(1)}
                        </span>
                        <span className="flex items-center text-xs text-white">
                          <ClockIcon size={12} className="mr-1" />
                          {lesson.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                        {lesson.category}
                      </span>
                      <div className="flex items-center">
                        <StarIcon size={12} className="text-yellow-400" />
                        <span className="text-xs ml-1">
                          {lesson.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-2">{lesson.title}</h3>
                    <p className="text-sm text-gray-300 mb-4 flex-1">
                      {lesson.description}
                    </p>
                    <div className="mt-auto">
                      {lesson.progress > 0 && <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progression</span>
                            <span>{lesson.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{
                    width: `${lesson.progress}%`
                  }}></div>
                          </div>
                        </div>}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Mis à jour le {lesson.lastUpdated}
                        </span>
                        <span className="text-xs text-gray-400">
                          {lesson.source}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        {lesson.completed ? <span className="flex items-center text-xs text-green-400">
                            <CheckCircleIcon size={14} className="mr-1" />
                            Complété
                          </span> : <span className="text-xs text-gray-400">
                            {lesson.progress > 0 ? 'Continuer' : 'Non commencé'}
                          </span>}
                        <button onClick={() => handleLessonClick(lesson)} className={`py-1.5 px-3 rounded bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-white text-sm flex items-center`}>
                          <ExternalLinkIcon size={14} className="mr-1.5" />
                          Accéder
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>)}
            </div> : <GlassCard className="p-8 text-center">
              <BookOpenIcon size={48} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-medium mb-2">Aucune leçon trouvée</h3>
              <p className="text-gray-400 mb-4">
                Aucune leçon ne correspond à vos critères de recherche.
              </p>
              <button onClick={() => {
          setSearchTerm('');
          setSelectedCategory(null);
          setSelectedLevel(null);
        }} className={`py-2 px-4 rounded bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-white`}>
                Réinitialiser les filtres
              </button>
            </GlassCard>}
        </>}
      {/* Featured resources section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Ressources recommandées</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6" animate>
            <h3 className="font-medium mb-3 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-blue-400" />
              Publications officielles
            </h3>
            <div className="space-y-4">
              <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => window.open('https://www.amf-france.org/fr/actualites-publications/publications', '_blank')}>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  AMF - Publications et guides
                  <ExternalLinkIcon size={14} className="ml-1.5" />
                </h4>
                <p className="text-xs text-gray-400">
                  Guides et documents officiels de l'Autorité des Marchés
                  Financiers
                </p>
              </div>
              <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => window.open('https://www.banque-france.fr/publications', '_blank')}>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  Banque de France - Publications
                  <ExternalLinkIcon size={14} className="ml-1.5" />
                </h4>
                <p className="text-xs text-gray-400">
                  Rapports, études et analyses économiques de la Banque de
                  France
                </p>
              </div>
              <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => window.open('https://www.economie.gouv.fr/particuliers', '_blank')}>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  Ministère de l'Économie - Espace particuliers
                  <ExternalLinkIcon size={14} className="ml-1.5" />
                </h4>
                <p className="text-xs text-gray-400">
                  Informations officielles sur la fiscalité et les finances
                  personnelles
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-6" animate>
            <h3 className="font-medium mb-3 flex items-center">
              <PlayCircleIcon className="h-5 w-5 mr-2 text-red-400" />
              Webinaires et formations en ligne
            </h3>
            <div className="space-y-4">
              <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => window.open('https://www.lafinancepourtous.com/outils/agenda/', '_blank')}>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  La Finance Pour Tous - Webinaires
                  <ExternalLinkIcon size={14} className="ml-1.5" />
                </h4>
                <p className="text-xs text-gray-400">
                  Calendrier des webinaires gratuits sur l'éducation financière
                </p>
              </div>
              <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => window.open('https://www.amf-france.org/fr/espace-epargnants/lamf-et-vous/conferences-videos', '_blank')}>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  AMF - Conférences vidéo
                  <ExternalLinkIcon size={14} className="ml-1.5" />
                </h4>
                <p className="text-xs text-gray-400">
                  Vidéos et conférences sur les marchés financiers et
                  l'investissement
                </p>
              </div>
              <div className="bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors cursor-pointer" onClick={() => window.open('https://www.youtube.com/c/HeudeNicolas', '_blank')}>
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  Chaîne YouTube - Heu?reka
                  <ExternalLinkIcon size={14} className="ml-1.5" />
                </h4>
                <p className="text-xs text-gray-400">
                  Vidéos pédagogiques sur l'économie et la finance (par Nicolas
                  Heude)
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>;
}