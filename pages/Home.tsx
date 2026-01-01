import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Story } from '../types';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setStories(data);
    } catch (err) {
      console.error("Home fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(s => {
    const title = s.title || '';
    const genre = s.genre || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                         genre.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genreFilter === 'All' || genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const genres = ['All', ...Array.from(new Set(stories.map(s => s.genre || 'Uncategorized')))];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              Worlds waiting to be <span className="text-amber-500 italic">unfolded.</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium">
              A curated collection of exclusive stories, designed for the serious reader.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search titles..."
                className="w-full md:w-64 pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-zinc-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-4 top-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              className="px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all cursor-pointer font-bold text-sm"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-100 dark:bg-zinc-900 aspect-[2/3] rounded-3xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {filteredStories.map(story => (
            <Link to={`/story/${story.id}`} key={story.id} className="group">
              <article className="relative h-full flex flex-col">
                <div className="aspect-[2/3] overflow-hidden rounded-3xl mb-4 relative shadow-md group-hover:shadow-2xl group-hover:shadow-amber-500/10 transition-all duration-500 border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={story.cover_url || `https://picsum.photos/seed/${story.id}/600/900`}
                    alt={story.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x900?text=No+Cover'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-zinc-950/40 backdrop-blur-md border border-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {story.genre || 'Story'}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-amber-500 transition-colors duration-300">
                    {story.title}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 font-medium leading-relaxed">
                    {story.synopsis}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredStories.length === 0 && (
        <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-400 text-lg font-medium italic">We couldn't find any stories matching that criteria.</p>
        </div>
      )}
    </div>
  );
};
