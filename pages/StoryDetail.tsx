import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Story, Chapter } from '../types';

export const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetails(id);
  }, [id]);

  const fetchDetails = async (storyId: string) => {
    setLoading(true);
    const { data: sData } = await supabase.from('stories').select('*').eq('id', storyId).single();
    const { data: cData } = await supabase.from('chapters').select('*').eq('story_id', storyId).order('order_index', { ascending: true });
    
    if (sData) setStory(sData);
    if (cData) setChapters(cData);
    setLoading(false);
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-20 animate-pulse">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/3 aspect-[2/3] bg-zinc-100 dark:bg-zinc-900 rounded-3xl"></div>
        <div className="flex-grow space-y-6">
          <div className="h-12 bg-zinc-100 dark:bg-zinc-900 w-3/4 rounded-xl"></div>
          <div className="h-4 bg-zinc-100 dark:bg-zinc-900 w-1/2 rounded-lg"></div>
          <div className="h-32 bg-zinc-100 dark:bg-zinc-900 w-full rounded-2xl"></div>
        </div>
      </div>
    </div>
  );

  if (!story) return <div className="text-center py-32 text-zinc-500">Story vanished into thin air.</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row gap-16 items-start">
        {/* Cover Art Section */}
        <div className="w-full md:w-1/3 flex-shrink-0 sticky top-24">
          <div className="relative group">
            <img 
              src={story.cover_url || `https://picsum.photos/seed/${story.id}/800/1200`} 
              alt={story.title} 
              className="w-full rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-500/10 blur-3xl -z-10 rounded-full"></div>
          </div>
          
          <div className="mt-12 p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-4">The Architect</h3>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed italic">
              "{story.author_bio || "A mysterious soul who lets their words do the talking."}"
            </p>
          </div>
        </div>
        
        {/* Story Information Section */}
        <div className="flex-grow">
          <header className="mb-12">
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              {story.genre}
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tighter">
              {story.title}
            </h1>
            
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {story.synopsis}
              </p>
            </div>
          </header>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
              <h2 className="text-2xl font-bold">Manuscript Index</h2>
              <span className="text-sm font-bold text-zinc-500">{chapters.length} Installments</span>
            </div>

            <div className="grid gap-3">
              {chapters.map((chapter, idx) => (
                <Link 
                  key={chapter.id} 
                  to={`/read/${chapter.id}`}
                  className="group flex items-center p-6 bg-white dark:bg-zinc-900/30 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 hover:border-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm"
                >
                  <span className="w-10 text-amber-500 font-black text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-grow">
                    <span className="block font-bold text-lg group-hover:text-amber-500 transition-colors">
                      {chapter.title}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Recorded on {new Date(chapter.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ))}
              
              {chapters.length === 0 && (
                <div className="text-center p-16 border-2 border-dashed border-zinc-800 rounded-[2.5rem] text-zinc-600 font-medium">
                  The pages of this story are yet to be written.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
