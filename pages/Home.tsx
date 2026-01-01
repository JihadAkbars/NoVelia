import React, { useState, useEffect } from 'react';
import { StoryCard } from '../components/StoryCard';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { Story, GENRES } from '../types';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Home: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  const { language } = useLanguage();
  const [displayStories, setDisplayStories] = useState<Story[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const fetchedStories = StorageService.getStories();
    setStories(fetchedStories);
  }, []);

  // Handle Translation
  useEffect(() => {
    if (language === 'Original') {
      setDisplayStories(stories);
      return;
    }

    const translateStories = async () => {
      if (stories.length === 0) return;
      setIsTranslating(true);
      
      const translated = await Promise.all(stories.map(async (story) => {
         try {
           const [title, synopsis] = await Promise.all([
             GeminiService.translate(story.title, language),
             GeminiService.translate(story.synopsis, language)
           ]);
           return { ...story, title, synopsis };
         } catch (e) {
           return story;
         }
      }));
      
      setDisplayStories(translated);
      setIsTranslating(false);
    };

    translateStories();
  }, [stories, language]);

  const filteredStories = displayStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          story.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || story.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-12 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-16 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Welcome to NoVelia
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover a collection of curated stories and novels, written and managed directly by the author.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-8 relative">
            <input 
              type="text" 
              placeholder="Search by title or synopsis..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
                <Filter size={18} />
                <span>Genres</span>
              </div>
              <div className="flex flex-wrap md:flex-col gap-2">
                <button
                  onClick={() => setSelectedGenre('All')}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedGenre === 'All' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  All Stories
                </button>
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedGenre === genre ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Latest Stories 
                {language !== 'Original' && <span className="text-sm font-normal text-indigo-500 ml-2">({language})</span>}
              </h2>
              <div className="flex items-center gap-2">
                 {isTranslating && <span className="flex items-center text-sm text-indigo-500 animate-pulse"><Loader2 size={14} className="animate-spin mr-1"/> Translating...</span>}
                 <span className="text-sm text-gray-500 dark:text-gray-400">{filteredStories.length} results</span>
              </div>
            </div>

            {filteredStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No stories found matching your criteria.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedGenre('All')}}
                  className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};