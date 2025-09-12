import React, { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SearchIcon, BookOpenIcon, DownloadIcon, ClockIcon, StarIcon, FilterIcon, ChevronRightIcon, FileTextIcon, BookIcon, NewspaperIcon, FileIcon, ExternalLinkIcon, BarChartIcon, TrendingUpIcon, GlobeIcon, CreditCardIcon, HomeIcon, PiggyBankIcon, ShieldIcon } from 'lucide-react';
import { fetchEducationContent, EducationResource } from '../services/education';
interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'guide' | 'rapport' | 'outil';
  source: string;
  url: string;
  image?: string;
  date: string;
  featured?: boolean;
  tags: string[];
  rating?: number; // 1-5
}
export function Library() {
  const navigate = useNavigate();
  const {
    themeColors
  } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  useEffect(() => {
    const loadResources = async () => {
      setIsLoading(true);
      try {
        const educationalContent = await fetchEducationContent();
        const resourcesData = educationalContent.map((resource, index) => ({
          id: resource.key,
          title: resource.title,
          description: `Un livre par ${resource.author_name.join(', ')}, publié en ${resource.first_publish_year}.`,
          category: 'Littérature financière',
          type: 'guide',
          source: 'Open Library',
          url: `https://openlibrary.org${resource.key}`,
          image: `https://covers.openlibrary.org/b/id/${resource.key}-M.jpg`,
          date: resource.first_publish_year.toString(),
          featured: index < 3,
          tags: ['livre', 'finance'],
          // rating: 4.5, // Placeholder
        }));
        setResources(resourcesData);
      } catch (error) {
        console.error('Error fetching resources:', error);
        toast.error('Erreur lors du chargement des ressources');
      } finally {
        setIsLoading(false);
      }
    };
    loadResources();
  }, []);
  // Filter resources based on search term, category, and type
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || resource.description.toLowerCase().includes(searchTerm.toLowerCase()) || resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? resource.category === selectedCategory : true;
    const matchesType = selectedType ? resource.type === selectedType : true;
    return matchesSearch && matchesCategory && matchesType;
  });
  // Get unique categories
  const categories = Array.from(new Set(resources.map(resource => resource.category)));
  // Get unique types
  const types = ['article', 'guide', 'rapport', 'outil'];
  // Handle resource click
  const handleResourceClick = (resource: Resource) => {
    // Open the resource URL in a new tab
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };
  // Get icon for resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <NewspaperIcon size={16} />;
      case 'guide':
        return <BookIcon size={16} />;
      case 'rapport':
        return <FileTextIcon size={16} />;
      case 'outil':
        return <BarChartIcon size={16} />;
      default:
        return <FileIcon size={16} />;
    }
  };
  // Get icon for resource category
  const getResourceCategoryIcon = (category: string) => {
    switch (category) {
      case 'Investissement':
        return <TrendingUpIcon size={16} className="text-green-400" />;
      case 'Économie':
        return <GlobeIcon size={16} className="text-blue-400" />;
      case 'Fiscalité':
        return <FileTextIcon size={16} className="text-yellow-400" />;
      case 'Immobilier':
        return <HomeIcon size={16} className="text-orange-400" />;
      case 'Banque':
        return <CreditCardIcon size={16} className="text-indigo-400" />;
      case 'Assurance':
        return <ShieldIcon size={16} className="text-purple-400" />;
      case 'Retraite':
        return <PiggyBankIcon size={16} className="text-pink-400" />;
      case 'Cryptomonnaies':
        return <BarChartIcon size={16} className="text-cyan-400" />;
      default:
        return <BookOpenIcon size={16} className="text-gray-400" />;
    }
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
            <h1 className="text-3xl font-bold">Bibliothèque financière</h1>
            <p className={`${themeColors?.textSecondary || 'text-gray-400'}`}>
              Découvrez notre collection complète de ressources financières à
              jour
            </p>
          </div>
        </div>
        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Rechercher des ressources..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" aria-label="Rechercher des ressources" />
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
            <select value={selectedType || ''} onChange={e => setSelectedType(e.target.value || null)} className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" aria-label="Filtrer par type">
              <option value="">Tous les types</option>
              {types.map((type, index) => <option key={index} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>)}
            </select>
          </div>
        </div>
      </motion.div>
      {/* Featured resources */}
      {!isLoading && filteredResources.some(r => r.featured) && <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ressources en vedette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredResources.filter(r => r.featured).slice(0, 3).map(resource => <GlassCard key={resource.id} className="overflow-hidden flex flex-col" animate hover>
                  {resource.image && <div className="h-40 bg-cover bg-center relative" style={{
            backgroundImage: `url(${resource.image})`
          }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                            {getResourceCategoryIcon(resource.category)}
                            <span className="ml-1">{resource.category}</span>
                          </span>
                          <span className="flex items-center text-xs text-white">
                            <StarIcon size={12} className="text-yellow-400 mr-1" />
                            {resource.rating}
                          </span>
                        </div>
                      </div>
                    </div>}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <span className="flex items-center text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                        {getResourceTypeIcon(resource.type)}
                        <span className="ml-1">
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {resource.date}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4 flex-1">
                      {resource.description}
                    </p>
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {resource.tags.slice(0, 3).map((tag, idx) => <span key={idx} className="text-xs bg-black/20 px-2 py-1 rounded-full">
                            #{tag}
                          </span>)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Source: {resource.source}
                        </span>
                        <button onClick={() => handleResourceClick(resource)} className={`py-1.5 px-3 rounded bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-white text-sm flex items-center`}>
                          <ExternalLinkIcon size={14} className="mr-1.5" />
                          Consulter
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>)}
          </div>
        </div>}
      {/* All resources */}
      {isLoading ? <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div> : <>
          <h2 className="text-xl font-semibold mb-4">Toutes les ressources</h2>
          {filteredResources.length > 0 ? <div className="grid grid-cols-1 gap-4">
              {filteredResources.map(resource => <GlassCard key={resource.id} className="p-4 hover:bg-black/20 transition-colors" animate hover>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="flex items-center mr-3">
                            {getResourceCategoryIcon(resource.category)}
                            <span className="ml-1 text-sm">
                              {resource.category}
                            </span>
                          </span>
                          <span className="flex items-center text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                            {getResourceTypeIcon(resource.type)}
                            <span className="ml-1">
                              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                            </span>
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {resource.date}
                        </span>
                      </div>
                      <h3 className="font-medium text-lg mb-1">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {resource.tags.map((tag, idx) => <span key={idx} className="text-xs bg-black/20 px-2 py-1 rounded-full">
                            #{tag}
                          </span>)}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <div className="flex items-center mb-4">
                        <StarIcon size={14} className="text-yellow-400 mr-1" />
                        <span className="text-sm">{resource.rating}</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-400">
                          Source: {resource.source}
                        </span>
                        <button onClick={() => handleResourceClick(resource)} className={`py-1.5 px-3 rounded bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-white text-sm flex items-center`}>
                          <ExternalLinkIcon size={14} className="mr-1.5" />
                          Consulter
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>)}
            </div> : <GlassCard className="p-8 text-center">
              <BookOpenIcon size={48} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-medium mb-2">
                Aucune ressource trouvée
              </h3>
              <p className="text-gray-400 mb-4">
                Aucune ressource ne correspond à vos critères de recherche.
              </p>
              <button onClick={() => {
          setSearchTerm('');
          setSelectedCategory(null);
          setSelectedType(null);
        }} className={`py-2 px-4 rounded bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-white`}>
                Réinitialiser les filtres
              </button>
            </GlassCard>}
        </>}
      {/* Newsletter subscription */}
      <div className="mt-12">
        <GlassCard className="p-6" animate>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h3 className="text-xl font-semibold mb-2">Restez informé</h3>
              <p className="text-gray-300">
                Abonnez-vous pour recevoir les dernières ressources financières
                et analyses directement dans votre boîte mail.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex">
                <input type="email" placeholder="Votre adresse email" className="flex-1 bg-black/20 border border-white/10 rounded-l-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                <button className={`py-2 px-4 rounded-r-lg bg-gradient-to-r ${themeColors?.primary || 'from-indigo-500 to-purple-600'} hover:opacity-90 text-white`}>
                  S'abonner
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Nous respectons votre vie privée. Désabonnez-vous à tout moment.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>;
}