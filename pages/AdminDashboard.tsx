
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Story } from '../types';
import { Link } from 'react-router-dom';
import { testAiConnection } from '../geminiService';

export const AdminDashboard: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [aiErrorMessage, setAiErrorMessage] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (data) setStories(data);
    setLoading(false);
  };

  const handleTestAi = async () => {
    setAiStatus('testing');
    setAiErrorMessage('');
    try {
      const success = await testAiConnection();
      if (success) {
        setAiStatus('success');
      } else {
        throw new Error("Received empty response from AI.");
      }
    } catch (err: any) {
      setAiStatus('error');
      setAiErrorMessage(err.message || "Failed to connect to Gemini API.");
    }
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
          <h1 className="text-4xl font-black mb-2 tracking-tight text-zinc-900 dark:text-zinc-100">Manager Dashboard</h1>
          <p className="text-zinc-500">Control everything happening on NoVelia.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="mr-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">AI Engine Status</p>
              <p className={`text-xs font-bold ${aiStatus === 'success' ? 'text-green-500' : aiStatus === 'error' ? 'text-red-500' : 'text-zinc-500'}`}>
                {aiStatus === 'idle' && 'Not Tested'}
                {aiStatus === 'testing' && 'Verifying...'}
                {aiStatus === 'success' && 'Connected'}
                {aiStatus === 'error' && 'Setup Required'}
              </p>
            </div>
            <button 
              onClick={handleTestAi}
              disabled={aiStatus === 'testing'}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title="Test Gemini Connection"
            >
              <svg className={`w-4 h-4 ${aiStatus === 'testing' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
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
      </div>

      {aiStatus === 'error' && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-bold text-red-500">Gemini AI Setup Issue</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-2">{aiErrorMessage}</p>
            <p className="text-xs text-zinc-500">Ensure 'Generative Language API' is enabled in your Google Cloud Project tied to the API Key.</p>
          </div>
        </div>
      )}

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
                      alt=""
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
                <td colSpan={4} className="px-6 py-20 text-center text-zinc-500 italic">
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
