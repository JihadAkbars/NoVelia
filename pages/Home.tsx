
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
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setStories(data);
    setLoading(false);
  };

  const filteredStories = stories.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                         s.genre.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genreFilter === 'All' || s.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const genres = ['All', ...Array.from(new Set(stories.map(s => s.genre)))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
          Read Your <span className="text-amber-500">Next Story</span>
        </h1>
        <p className="text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
          Dive into original worlds created by our exclusive authors. No distractions, just pure reading.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by title or genre..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-zinc-900 h-80 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredStories.map(story => (
            <Link to={`/story/${story.id}`} key={story.id} className="group">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 transform group-hover:-translate-y-1">
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={story.cover_url || `https://picsum.photos/seed/${story.id}/400/600`}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-zinc-950/70 backdrop-blur px-2 py-1 rounded text-xs font-bold text-amber-500">
                    {story.genre}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm line-clamp-2">
                    {story.synopsis}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredStories.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-zinc-500 text-xl italic">No stories found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
