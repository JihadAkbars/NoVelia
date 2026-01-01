
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
    <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
      <div className="h-64 bg-zinc-800 rounded-3xl mb-8"></div>
      <div className="h-10 bg-zinc-800 w-1/2 mx-auto rounded mb-4"></div>
      <div className="h-4 bg-zinc-800 w-3/4 mx-auto rounded"></div>
    </div>
  );

  if (!story) return <div className="text-center py-20">Story not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="w-full md:w-1/3 flex-shrink-0">
          <img 
            src={story.cover_url || `https://picsum.photos/seed/${story.id}/600/900`} 
            alt={story.title} 
            className="w-full rounded-2xl shadow-2xl border border-zinc-800"
          />
        </div>
        
        <div className="flex-grow">
          <div className="mb-6">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-2 block">{story.genre}</span>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">{story.title}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Synopsis
            </h2>
            <p className="text-gray-700 dark:text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">
              {story.synopsis}
            </p>
          </div>

          <div className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-10">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              About Author
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 italic">
              {story.author_bio || "The author hasn't provided a biography yet."}
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
              <span>Chapter List</span>
              <span className="text-sm font-normal text-zinc-500">{chapters.length} chapters total</span>
            </h2>
            <div className="space-y-3">
              {chapters.map((chapter, idx) => (
                <Link 
                  key={chapter.id} 
                  to={`/read/${chapter.id}`}
                  className="group flex items-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-amber-500 transition-all shadow-sm"
                >
                  <span className="w-8 text-amber-500 font-bold">{idx + 1}.</span>
                  <span className="flex-grow font-medium group-hover:text-amber-500 transition-colors">{chapter.title}</span>
                  <svg className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
              {chapters.length === 0 && (
                <div className="text-center p-10 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                  No chapters published yet. Stay tuned!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
