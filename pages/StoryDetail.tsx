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

  if (!displayStory) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      {/* Header with blurred background */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
            <img src={displayStory.coverUrl} className="w-full h-full object-cover blur-xl scale-110" alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Back to Library
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            {/* Cover Image */}
            <div className="flex-shrink-0 w-48 md:w-64 rounded-lg shadow-2xl overflow-hidden ring-4 ring-white/10">
              <img src={displayStory.coverUrl} alt={displayStory.title} className="w-full h-auto object-cover" />
            </div>
            
            {/* Info */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                 <span className="inline-block px-3 py-1 bg-indigo-600 text-xs font-bold rounded-full uppercase tracking-wide">
                   {displayStory.genre}
                 </span>
                 {isTranslating && <span className="text-sm flex items-center gap-1 text-indigo-300 animate-pulse"><Loader2 size={14} className="animate-spin" /> Translating...</span>}
              </div>

              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">{displayStory.title}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-gray-300 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{displayStory.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(displayStory.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${displayStory.status === 'Completed' ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                   <span>{displayStory.status}</span>
                </div>
              </div>

              <div className="max-w-2xl text-gray-200 leading-relaxed text-lg mb-6">
                {displayStory.synopsis}
              </div>

              {displayChapters.length > 0 && (
                <div className="mt-8">
                  <Link 
                    to={`/read/${displayChapters[0].id}`}
                    className="inline-flex items-center px-8 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
          <div className="mb-12 p-6 bg-indigo-50 dark:bg-gray-900 rounded-xl border border-indigo-100 dark:border-gray-800">
             <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-lg font-serif">
                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                About {displayStory.author}
             </h3>
             <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {displayStory.authorBio}
             </p>
          </div>
        )}

        {/* Chapters List */}
        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
          Table of Contents ({displayChapters.length})
        </h2>
        
        {displayChapters.length > 0 ? (
          <div className="space-y-4">
            {displayChapters.map((chapter, index) => (
              <Link 
                key={chapter.id} 
                to={`/read/${chapter.id}`}
                className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-serif text-gray-300 dark:text-gray-600 font-bold w-8 group-hover:text-indigo-400 transition-colors">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {chapter.title}
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Published {new Date(chapter.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 italic">No chapters published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};