
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Story } from '../types';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (data) setStories(data);
    setLoading(false);
  };

  const deleteStory = async (id: string) => {
    if (confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      await supabase.from('stories').delete().eq('id', id);
      fetchStories();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Manager Dashboard</h1>
          <p className="text-zinc-500">Control everything happening on NoVelia.</p>
        </div>
        <Link 
          to="/admin/story/new" 
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center transition-colors shadow-lg shadow-amber-500/20"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Story
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Story</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Genre</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date Created</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {stories.map(story => (
              <tr key={story.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <img 
                      src={story.cover_url || `https://picsum.photos/seed/${story.id}/100/150`} 
                      className="w-12 h-16 object-cover rounded shadow-sm mr-4 border border-zinc-700" 
                    />
                    <span className="font-bold text-lg">{story.title}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold">
                    {story.genre}
                  </span>
                </td>
                <td className="px-6 py-5 text-zinc-500 text-sm">
                  {new Date(story.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-5 text-right space-x-3">
                  <Link 
                    to={`/admin/story/edit/${story.id}`}
                    className="text-amber-500 hover:text-amber-600 font-bold text-sm"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => deleteStory(story.id)}
                    className="text-red-500 hover:text-red-600 font-bold text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && stories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-zinc-500 italic">
                  No stories created yet. Start by clicking "Create New Story".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
