import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Chapter, Story, Language } from '../types';
import { translateText } from '../geminiService';

export const Reader: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Customization
  const [fontSize, setFontSize] = useState(20);
  const [isSerif, setIsSerif] = useState(true);
  const [language, setLanguage] = useState<Language>('English');
  const [searchTerm, setSearchTerm] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (chapterId) fetchChapter(chapterId);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterId]);

  const fetchChapter = async (id: string) => {
    setLoading(true);
    try {
      const { data: cData, error: cErr } = await supabase.from('chapters').select('*').eq('id', id).single();
      if (cErr) throw cErr;

      if (cData) {
        setChapter(cData);
        const { data: sData } = await supabase.from('stories').select('*').eq('id', cData.story_id).single();
        const { data: allC } = await supabase.from('chapters').select('*').eq('story_id', cData.story_id).order('order_index', { ascending: true });
        if (sData) setStory(sData);
        if (allC) setChapters(allC);
      }
    } catch (err) {
      console.error("Reader load error:", err);
      setChapter(null);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (newLang === language || !chapter) return;
    
    setIsTranslating(true);
    try {
      const translatedContent = await translateText(chapter.content, newLang);
      const translatedTitle = await translateText(chapter.title, newLang);
      setChapter({ ...chapter, content: translatedContent, title: translatedTitle });
      setLanguage(newLang);
    } catch (err: any) {
      alert(err.message || "Failed to translate chapter.");
    } finally {
      setIsTranslating(false);
    }
  };

  const currentIdx = chapters.findIndex(c => c.id === chapterId);
  const nextChapter = chapters[currentIdx + 1];
  const prevChapter = chapters[currentIdx - 1];

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    // Escape special regex characters to prevent crashes
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    return text.split(regex).map((part, i) => 
      part.toLowerCase() === search.toLowerCase() ? <mark key={i} className="bg-amber-500 text-zinc-950 font-bold px-0.5 rounded-sm">{part}</mark> : part
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase">Opening Manuscript...</p>
    </div>
  );

  if (!chapter) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-black text-zinc-100 mb-4">Chapter Not Found</h1>
      <p className="text-zinc-500 mb-8 max-w-md">The manuscript you are looking for has been moved or deleted.</p>
      <Link to="/" className="px-8 py-3 bg-amber-500 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105">
        Return to Library
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-amber-500/40">
      {/* Dynamic Zen Header */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="glass px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to={`/story/${story?.id}`} className="text-zinc-400 hover:text-white transition-colors flex items-center font-bold text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {story?.title || 'Back to Story'}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative group hidden sm:block">
              <input 
                type="text" 
                placeholder="Find..." 
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none w-32 focus:w-48 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-3 h-3 absolute right-3 top-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-xl px-2 py-1">
              <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-8 h-8 hover:text-amber-500 transition-colors font-bold text-sm">A-</button>
              <button onClick={() => setIsSerif(!isSerif)} className={`w-8 h-8 rounded-lg transition-all text-xs font-black ${isSerif ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500'}`}>S</button>
              <button onClick={() => setFontSize(Math.min(36, fontSize + 2))} className="w-8 h-8 hover:text-amber-500 transition-colors font-bold text-lg">A+</button>
            </div>

            <select 
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-amber-500 transition-colors"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              disabled={isTranslating}
            >
              <option value="English">ENG</option>
              <option value="Indonesian">IND</option>
              <option value="Spanish">ESP</option>
              <option value="French">FRA</option>
              <option value="Japanese">JPN</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Main Reading Frame */}
      <div className="pt-40 pb-32 px-6 max-w-2xl lg:max-w-3xl mx-auto">
        {isTranslating && (
          <div className="fixed inset-0 z-[60] bg-zinc-950/80 backdrop-blur-xl flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6 shadow-2xl shadow-amber-500/20"></div>
            <p className="text-amber-500 font-black tracking-[0.3em] uppercase animate-pulse text-xs">AI Translation Active</p>
          </div>
        )}

        <header className="mb-20 text-center">
          <h2 className="text-zinc-600 font-black mb-4 uppercase tracking-[0.4em] text-[10px]">Installment {currentIdx + 1}</h2>
          <h1 className="text-4xl md:text-6xl font-black mb-12 text-zinc-100 leading-tight tracking-tighter">
            {chapter?.title}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full opacity-50"></div>
        </header>

        <article 
          ref={contentRef}
          className={`reader-body leading-[1.8] whitespace-pre-wrap ${isSerif ? 'font-serif-reading' : 'font-sans'}`}
          style={{ fontSize: `${fontSize}px`, color: '#d4d4d8' }}
        >
          {chapter?.content ? highlightText(chapter.content, searchTerm) : ''}
        </article>

        <footer className="mt-32 border-t border-zinc-900 pt-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            {prevChapter ? (
              <button 
                onClick={() => navigate(`/read/${prevChapter.id}`)}
                className="group flex flex-col items-start"
              >
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Previous chapter</span>
                <span className="text-lg font-bold text-zinc-400 group-hover:text-zinc-100 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  {prevChapter.title}
                </span>
              </button>
            ) : <div />}

            <button 
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-amber-500 hover:border-amber-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>

            {nextChapter ? (
              <button 
                onClick={() => navigate(`/read/${nextChapter.id}`)}
                className="group flex flex-col items-end text-right"
              >
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Next chapter</span>
                <span className="text-lg font-bold text-zinc-400 group-hover:text-zinc-100 transition-colors flex items-center">
                  {nextChapter.title}
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status</span>
                 <span className="text-lg font-bold text-amber-500 italic">Complete</span>
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
