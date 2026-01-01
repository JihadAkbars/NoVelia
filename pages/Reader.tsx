import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { Chapter, Story } from '../types';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Moon, Sun, BookOpen, Search, X, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export const Reader: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [originalChapter, setOriginalChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  
  const { language } = useLanguage();
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  
  const [displayChapter, setDisplayChapter] = useState<Chapter | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Reading preferences state
  const [fontSize, setFontSize] = useState(18);
  const [sepiaMode, setSepiaMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (chapterId) {
        const c = await StorageService.getChapter(chapterId);
        if (c) {
          setOriginalChapter(c);
          const s = await StorageService.getStory(c.storyId);
          if (s) setStory(s);
          const chapters = await StorageService.getChaptersByStory(c.storyId);
          setAllChapters(chapters);
          window.scrollTo(0, 0);
          setSearchQuery('');
          setShowSearch(false);
        }
      }
    };
    fetchData();
  }, [chapterId]);

  // Handle Translation
  useEffect(() => {
    if (!originalChapter) return;

    if (language === 'Original') {
      setDisplayChapter(originalChapter);
      setIsTranslating(false);
      return;
    }

    const translateContent = async () => {
      setIsTranslating(true);
      try {
        const [title, content] = await Promise.all([
          GeminiService.translate(originalChapter.title, language),
          GeminiService.translate(originalChapter.content, language, true) // true for isHtml
        ]);
        
        setDisplayChapter({
          ...originalChapter,
          title,
          content
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [originalChapter, language]);


  // Search Processing Logic
  const processedContent = useMemo(() => {
    if (!displayChapter) return { html: '', count: 0 };
    if (!searchQuery.trim()) return { html: displayChapter.content, count: 0 };
    
    const query = searchQuery.trim();
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    
    const parts = displayChapter.content.split(/(<[^>]+>)/g);
    let count = 0;
    
    const newParts = parts.map(part => {
      if (part.startsWith('<')) return part;
      
      return part.replace(regex, (match) => {
        count++;
        const isCurrent = count === currentMatch;
        const activeClass = isCurrent 
          ? 'bg-orange-500 text-white shadow-sm ring-2 ring-orange-300 z-10 relative' 
          : 'bg-yellow-300 text-black';
          
        return `<mark id="search-match-${count}" class="${activeClass} rounded-sm px-0.5 transition-colors duration-200">${match}</mark>`;
      });
    });
    
    return { html: newParts.join(''), count };
  }, [displayChapter, searchQuery, currentMatch]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setCurrentMatch(1);
    } else {
      setCurrentMatch(0);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (currentMatch > 0 && showSearch) {
      const el = document.getElementById(`search-match-${currentMatch}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatch, showSearch]);

  const handleNextMatch = () => {
    if (processedContent.count === 0) return;
    setCurrentMatch(prev => prev >= processedContent.count ? 1 : prev + 1);
  };

  const handlePrevMatch = () => {
    if (processedContent.count === 0) return;
    setCurrentMatch(prev => prev <= 1 ? processedContent.count : prev - 1);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch && searchQuery && currentMatch === 0) setCurrentMatch(1);
  };

  if (!displayChapter || !story) return <div className="p-10 text-center">Loading...</div>;

  const currentIndex = allChapters.findIndex(c => c.id === displayChapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Theme Logic
  // If Sepia is active, it overrides Light/Dark for the content area background.
  // The Navbar follows globalTheme.
  
  const getContainerClass = () => {
    if (sepiaMode) return 'bg-[#f4ecd8] text-[#5b4636]';
    return globalTheme === 'dark' ? 'bg-gray-950 text-gray-300' : 'bg-white text-gray-900';
  };

  const navbarClass = globalTheme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-200' : 'bg-white border-gray-200 text-gray-800';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getContainerClass()}`}>
      {/* Navbar for Reader */}
      <div className={`sticky top-0 z-50 transition-colors duration-300 border-b ${navbarClass}`}>
        <div className="px-4 h-16 flex items-center justify-between">
          <Link to={`/story/${story.id}`} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline text-sm font-medium truncate max-w-[150px]">{story.title}</span>
          </Link>
          
          <div className="flex flex-col items-center">
             <div className="text-sm font-semibold truncate px-4">{displayChapter.title}</div>
             {isTranslating && <div className="text-xs text-indigo-500 flex items-center gap-1 animate-pulse"><Loader2 size={10} className="animate-spin" /> Translating to {language}...</div>}
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleSearch} 
              className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-gray-200/20'}`}
              title="Search in Chapter"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'hover:bg-gray-200/20'}`}
              title="Appearance Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Search Toolbar */}
        {showSearch && (
          <div className={`px-4 py-2 border-t flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 ${globalTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="relative flex-grow max-w-md">
              <input 
                type="text" 
                autoFocus
                placeholder="Find in chapter..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) handlePrevMatch();
                    else handleNextMatch();
                  }
                  if (e.key === 'Escape') toggleSearch();
                }}
                className={`w-full pl-9 pr-4 py-1.5 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${globalTheme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'}`}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            </div>
            
            <div className="flex items-center text-xs font-mono opacity-70 min-w-[60px] justify-center">
              {processedContent.count > 0 ? `${currentMatch} / ${processedContent.count}` : '0 / 0'}
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMatch} 
                disabled={processedContent.count === 0}
                className="p-1.5 rounded hover:bg-gray-200/20 disabled:opacity-30"
              >
                <ChevronUp size={18} />
              </button>
              <button 
                onClick={handleNextMatch} 
                disabled={processedContent.count === 0}
                className="p-1.5 rounded hover:bg-gray-200/20 disabled:opacity-30"
              >
                <ChevronDown size={18} />
              </button>
              <button 
                onClick={() => { setShowSearch(false); setSearchQuery(''); }} 
                className="p-1.5 rounded hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 ml-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute top-16 right-4 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 z-50 text-gray-800 dark:text-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Appearance</h4>
            
            {/* Theme Toggle */}
            <div className="flex gap-2 mb-6">
               <button onClick={() => { setGlobalTheme('light'); setSepiaMode(false); }} className={`flex-1 p-2 rounded-lg border ${!sepiaMode && globalTheme === 'light' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
                 <Sun size={18} className="mx-auto mb-1" />
                 <span className="text-xs block text-center">Light</span>
               </button>
               <button onClick={() => setSepiaMode(true)} className={`flex-1 p-2 rounded-lg border bg-[#f4ecd8] text-[#5b4636] ${sepiaMode ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200 dark:border-gray-600'}`}>
                 <BookOpen size={18} className="mx-auto mb-1" />
                 <span className="text-xs block text-center">Sepia</span>
               </button>
               <button onClick={() => { setGlobalTheme('dark'); setSepiaMode(false); }} className={`flex-1 p-2 rounded-lg border bg-gray-900 text-gray-300 ${!sepiaMode && globalTheme === 'dark' ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-600'}`}>
                 <Moon size={18} className="mx-auto mb-1" />
                 <span className="text-xs block text-center">Dark</span>
               </button>
            </div>

            {/* Font Size */}
            <div className="mb-2">
              <div className="flex justify-between mb-2 text-xs text-gray-500 font-medium">
                <span>Aa</span>
                <span>Size</span>
                <span className="text-lg">Aa</span>
              </div>
              <input 
                type="range" 
                min="14" 
                max="28" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reading Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <article className="prose max-w-none">
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                <p>Translating to {language}...</p>
              </div>
            ) : (
            <>
              <h1 className={`font-serif text-center font-bold mb-12 ${globalTheme === 'dark' && !sepiaMode ? 'text-gray-100' : 'text-gray-900'}`} style={{ fontSize: `${fontSize * 1.5}px` }}>
                {displayChapter.title}
              </h1>
              <div 
                className={`font-serif leading-relaxed space-y-6 ${globalTheme === 'dark' && !sepiaMode ? 'prose-invert' : ''}`}
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: processedContent.html }}
              />
            </>
            )}
        </article>
      </div>

      {/* Navigation Footer */}
      <div className={`max-w-4xl mx-auto px-4 py-12 border-t ${globalTheme === 'dark' && !sepiaMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex justify-between items-center">
          {prevChapter ? (
            <Link 
              to={`/read/${prevChapter.id}`} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200/10 transition-colors"
            >
              <ChevronLeft />
              <div className="text-left">
                <div className="text-xs opacity-60">Previous</div>
                <div className="font-medium max-w-[120px] sm:max-w-xs truncate">{prevChapter.title}</div>
              </div>
            </Link>
          ) : (
            <div></div>
          )}

          {nextChapter ? (
            <Link 
              to={`/read/${nextChapter.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-200/10 transition-colors text-right"
            >
              <div className="text-right">
                <div className="text-xs opacity-60">Next</div>
                <div className="font-medium max-w-[120px] sm:max-w-xs truncate">{nextChapter.title}</div>
              </div>
              <ChevronRight />
            </Link>
          ) : (
             <div className="text-sm opacity-60">End of content</div>
          )}
        </div>
      </div>
    </div>
  );
};
