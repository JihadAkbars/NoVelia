
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
  const [fontSize, setFontSize] = useState(18);
  const [isSerif, setIsSerif] = useState(true);
  const [language, setLanguage] = useState<Language>('English');
  const [searchTerm, setSearchTerm] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chapterId) fetchChapter(chapterId);
  }, [chapterId]);

  const fetchChapter = async (id: string) => {
    setLoading(true);
    const { data: cData } = await supabase.from('chapters').select('*').eq('id', id).single();
    if (cData) {
      setChapter(cData);
      const { data: sData } = await supabase.from('stories').select('*').eq('id', cData.story_id).single();
      const { data: allC } = await supabase.from('chapters').select('*').eq('story_id', cData.story_id).order('order_index', { ascending: true });
      if (sData) setStory(sData);
      if (allC) setChapters(allC);
    }
    setLoading(false);
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (newLang === language || !chapter) return;
    setIsTranslating(true);
    const translatedContent = await translateText(chapter.content, newLang);
    const translatedTitle = await translateText(chapter.title, newLang);
    setChapter({ ...chapter, content: translatedContent, title: translatedTitle });
    setLanguage(newLang);
    setIsTranslating(false);
  };

  const currentIdx = chapters.findIndex(c => c.id === chapterId);
  const nextChapter = chapters[currentIdx + 1];
  const prevChapter = chapters[currentIdx - 1];

  // Helper for text highlighting search
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return text.split(regex).map((part, i) => 
      part.toLowerCase() === search.toLowerCase() ? <mark key={i} className="bg-amber-500/30 text-amber-200 rounded px-0.5">{part}</mark> : part
    );
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 italic">Preparing the pages...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Top Header/Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link to={`/story/${story?.id}`} className="flex items-center text-zinc-400 hover:text-amber-500 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Index
          </Link>

          <div className="flex items-center space-x-4">
            {/* Search within text */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Find in text..." 
                className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-sm focus:ring-1 focus:ring-amber-500 outline-none w-32 md:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1">
              <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-2 py-1 hover:text-amber-500">A-</button>
              <div className="w-px h-4 bg-zinc-800 mx-1"></div>
              <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="px-2 py-1 hover:text-amber-500">A+</button>
            </div>

            <select 
              className="bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-sm outline-none"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              disabled={isTranslating}
            >
              <option value="English">English</option>
              <option value="Indonesian">Indonesian</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="Japanese">日本語</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-32 pb-24 px-4 max-w-3xl mx-auto relative">
        {isTranslating && (
          <div className="absolute inset-0 z-10 bg-zinc-950/60 backdrop-blur-sm flex flex-col items-center pt-40">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-amber-500 font-bold animate-pulse">Gemini is translating your world...</p>
          </div>
        )}

        <header className="mb-12 text-center">
          <h2 className="text-zinc-500 font-medium mb-2 uppercase tracking-widest text-sm">{story?.title}</h2>
          <h1 className="text-3xl md:text-5xl font-bold mb-8">{chapter?.title}</h1>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full"></div>
        </header>

        <div 
          ref={contentRef}
          className={`leading-relaxed transition-all whitespace-pre-wrap ${isSerif ? 'font-serif-reading' : ''}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter?.content ? highlightText(chapter.content, searchTerm) : ''}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-20 flex justify-between items-center border-t border-zinc-800 pt-10">
          {prevChapter ? (
            <button 
              onClick={() => navigate(`/read/${prevChapter.id}`)}
              className="flex items-center text-zinc-400 hover:text-amber-500 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous Chapter</span>
            </button>
          ) : <div />}

          <div className="flex flex-col items-center">
             <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-xs text-zinc-600 hover:text-zinc-400 uppercase tracking-widest font-bold">Back to top</button>
          </div>

          {nextChapter ? (
            <button 
              onClick={() => navigate(`/read/${nextChapter.id}`)}
              className="flex items-center text-zinc-400 hover:text-amber-500 transition-colors group"
            >
              <span>Next Chapter</span>
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="text-zinc-600 font-medium">End of Story</div>
          )}
        </div>
      </div>
    </div>
  );
};
