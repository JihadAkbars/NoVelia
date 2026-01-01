import React, { useState, useEffect } from 'react';
import { StoryCard } from '../components/StoryCard';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { Story, GENRES } from '../types';
import { Search, Filter, Loader2, Sparkles, Feather } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Home: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  const { language } = useLanguage();
  const [displayStories, setDisplayStories] = useState<Story[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const fetchedStories = await StorageService.getStories();
      setStories(fetchedStories);
      setLoading(false);
    };
    fetchStories();
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
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-20 transition-colors duration-300">
      {/* Immersive Hero Section */}
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-indigo-200 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} />
            <span>Curated Storytelling Platform</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Worlds Beyond <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">Imagination</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Welcome to NoVelia, a personal sanctuary for original novels. 
            Immerse yourself in stories crafted with passion, available exclusively here.
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="w-full max-w-2xl relative group animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-2xl p-2">
              <Search className="ml-4 text-gray-400 h-6 w-6" />
              <input 
                type="text" 
                placeholder="Search for titles, characters, or plots..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-full text-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none bg-transparent"
              />
              <button className="hidden md:block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About / Introduction Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 p-6 rounded-full">
            <Feather size={48} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 dark:text-white mb-4">
              Written by the Owner, Read by You
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Unlike other platforms, NoVelia offers a carefully curated experience where each chapter is personally crafted by its owner, Jihad. With no distractions and no user uploads, it delivers pure, uninterrupted storytelling designed entirely for the reader.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar Filters - Sticky and Styled */}
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 sticky top-24 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white font-bold text-lg border-b border-gray-100 dark:border-gray-800 pb-4">
                <Filter size={20} className="text-indigo-500" />
                <span>Explore Genres</span>
              </div>
              <div className="flex flex-wrap md:flex-col gap-2">
                <button
                  onClick={() => setSelectedGenre('All')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 flex items-center justify-between group ${selectedGenre === 'All' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  All Stories
                  {selectedGenre === 'All' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </button>
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 flex items-center justify-between group ${selectedGenre === genre ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
                  {selectedGenre === 'All' ? 'Latest Releases' : `${selectedGenre} Novels`}
                </h2>
                {language !== 'Original' && <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1 block">Translated to {language}</span>}
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
                 {loading ? (
                    <span className="flex items-center text-sm text-gray-500"><Loader2 size={16} className="animate-spin mr-2"/> Loading...</span>
                 ) : isTranslating ? (
                   <span className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                     <Loader2 size={16} className="animate-spin mr-2"/> Translating content...
                   </span>
                 ) : (
                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{filteredStories.length} stories available</span>
                 )}
              </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-indigo-500" />
                </div>
            ) : filteredStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors duration-300">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No stories found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">We couldn't find any stories matching "{searchQuery}" or the selected genre.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedGenre('All')}}
                  className="px-6 py-2.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
