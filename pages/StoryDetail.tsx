import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { Story, Chapter } from '../types';
import { BookOpen, Calendar, User, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [originalStory, setOriginalStory] = useState<Story | null>(null);
  const [originalChapters, setOriginalChapters] = useState<Chapter[]>([]);
  
  const { language } = useLanguage();
  const [displayStory, setDisplayStory] = useState<Story | null>(null);
  const [displayChapters, setDisplayChapters] = useState<Chapter[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (id) {
      const s = StorageService.getStory(id);
      if (s) {
        setOriginalStory(s);
        setOriginalChapters(StorageService.getChaptersByStory(id));
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!originalStory) return;

    if (language === 'Original') {
      setDisplayStory(originalStory);
      setDisplayChapters(originalChapters);
      return;
    }

    const translateData = async () => {
      setIsTranslating(true);
      try {
        const [title, synopsis, bio, genre] = await Promise.all([
          GeminiService.translate(originalStory.title, language),
          GeminiService.translate(originalStory.synopsis, language),
          originalStory.authorBio ? GeminiService.translate(originalStory.authorBio, language) : Promise.resolve(''),
          GeminiService.translate(originalStory.genre, language)
        ]);
        
        setDisplayStory({
          ...originalStory,
          title,
          synopsis,
          authorBio: bio,
          genre
        });

        const translatedChapters = await Promise.all(originalChapters.map(async (c) => {
           const tTitle = await GeminiService.translate(c.title, language);
           return { ...c, title: tTitle };
        }));
        setDisplayChapters(translatedChapters);

      } catch (e) {
        console.error(e);
      } finally {
        setIsTranslating(false);
      }
    };

    translateData();

  }, [originalStory, originalChapters, language]);

  if (!displayStory) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin" />
        <span>Loading story...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      {/* Adaptive Hero Section */}
      <div className="relative overflow-hidden transition-colors duration-300">
        
        {/* Adaptive Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
             {/* Base Image */}
            <img 
                src={displayStory.coverUrl} 
                className="w-full h-full object-cover blur-2xl scale-110 opacity-30 dark:opacity-40 transition-opacity duration-300" 
                alt="" 
            />
            {/* Gradient Overlay: Light Mode (White fade) vs Dark Mode (Dark fade) */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40 dark:from-gray-950 dark:via-gray-900/90 dark:to-gray-900/60 transition-colors duration-300"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Library
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            {/* Cover Image */}
            <div className="flex-shrink-0 w-48 md:w-64 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
              <img src={displayStory.coverUrl} alt={displayStory.title} className="w-full h-full object-cover" />
            </div>
            
            {/* Info */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                 <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-100 text-xs font-bold rounded-full uppercase tracking-wide border border-indigo-200 dark:border-indigo-800">
                   {displayStory.genre}
                 </span>
                 {isTranslating && <span className="text-sm flex items-center gap-1 text-indigo-600 dark:text-indigo-400 animate-pulse"><Loader2 size={14} className="animate-spin" /> Translating...</span>}
              </div>

              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900 dark:text-white transition-colors">
                  {displayStory.title}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-gray-600 dark:text-gray-300 text-sm mb-6 transition-colors">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{displayStory.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(displayStory.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${displayStory.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                   <span>{displayStory.status}</span>
                </div>
              </div>

              <div className="max-w-2xl text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8 transition-colors">
                {displayStory.synopsis}
              </div>

              {displayChapters.length > 0 && (
                <div>
                  <Link 
                    to={`/read/${displayChapters[0].id}`}
                    className="inline-flex items-center px-8 py-3 bg-gray-900 hover:bg-black text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Start Reading
                    <BookOpen size={20} className="ml-2" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Author Bio Section */}
        {displayStory.authorBio && (
          <div className="mb-12 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
             <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-lg font-serif">
                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                About {displayStory.author}
             </h3>
             <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {displayStory.authorBio}
             </p>
          </div>
        )}

        {/* Chapters List */}
        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
          Table of Contents ({displayChapters.length})
        </h2>
        
        {displayChapters.length > 0 ? (
          <div className="space-y-3">
            {displayChapters.map((chapter, index) => (
              <Link 
                key={chapter.id} 
                to={`/read/${chapter.id}`}
                className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-serif text-gray-400 dark:text-gray-600 font-bold w-8 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      {chapter.title}
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(chapter.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <BookOpen size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 italic">No chapters published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
