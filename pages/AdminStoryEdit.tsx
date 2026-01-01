
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Story, Chapter } from '../types';
import { improveGrammar } from '../geminiService';

export const AdminStoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [story, setStory] = useState<Partial<Story>>({
    title: '', genre: '', synopsis: '', author_bio: '', cover_url: ''
  });
  const [chapters, setChapters] = useState<Partial<Chapter>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    if (isEdit) fetchStoryData();
  }, [id]);

  const fetchStoryData = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from('stories').select('*').eq('id', id).single();
    const { data: cData } = await supabase.from('chapters').select('*').eq('story_id', id).order('order_index', { ascending: true });
    
    if (sData) setStory(sData);
    if (cData) setChapters(cData);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let storyId = id;
      if (isEdit) {
        await supabase.from('stories').update(story).eq('id', id);
      } else {
        const { data } = await supabase.from('stories').insert([story]).select().single();
        if (data) storyId = data.id;
      }

      // Save Chapters
      // Simpler approach: delete old and insert new or update based on ID
      // For this MVP, we'll just handle adding/editing sequentially
      for (const [idx, ch] of chapters.entries()) {
        const payload = { ...ch, story_id: storyId, order_index: idx };
        if (ch.id) {
          await supabase.from('chapters').update(payload).eq('id', ch.id);
        } else {
          await supabase.from('chapters').insert([payload]);
        }
      }

      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error saving story.');
    } finally {
      setLoading(false);
    }
  };

  const addChapter = () => {
    setChapters([...chapters, { title: '', content: '' }]);
  };

  const updateChapter = (index: number, field: keyof Chapter, value: any) => {
    const newChaps = [...chapters];
    newChaps[index] = { ...newChaps[index], [field]: value };
    setChapters(newChaps);
  };

  const deleteChapterLocal = async (index: number) => {
    const ch = chapters[index];
    if (ch.id) {
      if (confirm('Delete this chapter from database?')) {
        await supabase.from('chapters').delete().eq('id', ch.id);
      }
    }
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleAiImprove = async (index: number) => {
    const content = chapters[index].content;
    if (!content) return;
    setIsAiProcessing(true);
    const improved = await improveGrammar(content);
    updateChapter(index, 'content' as any, improved);
    setIsAiProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-black">{isEdit ? 'Edit Story' : 'New Story'}</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-100 dark:border-zinc-800 pb-4">Story Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-500 uppercase">Title</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-amber-500"
                value={story.title}
                onChange={(e) => setStory({ ...story, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-500 uppercase">Genre</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-amber-500"
                value={story.genre}
                onChange={(e) => setStory({ ...story, genre: e.target.value })}
                placeholder="Fantasy, Romance, etc."
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 uppercase">Synopsis</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-amber-500"
              value={story.synopsis}
              onChange={(e) => setStory({ ...story, synopsis: e.target.value })}
              required
            ></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 uppercase">Author Bio</label>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-amber-500"
              value={story.author_bio}
              onChange={(e) => setStory({ ...story, author_bio: e.target.value })}
              placeholder="Short bio for the author section..."
            ></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 uppercase">Cover Image URL</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-amber-500"
              value={story.cover_url}
              onChange={(e) => setStory({ ...story, cover_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chapters</h2>
            <button 
              type="button" 
              onClick={addChapter}
              className="text-amber-500 font-bold hover:underline flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Chapter
            </button>
          </div>

          <div className="space-y-6">
            {chapters.map((ch, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative group">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-zinc-400">Chapter {idx + 1}</h3>
                   <button 
                    type="button"
                    onClick={() => deleteChapterLocal(idx)}
                    className="text-red-500 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                   </button>
                </div>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Chapter Title"
                    className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none"
                    value={ch.title}
                    onChange={(e) => updateChapter(idx, 'title' as any, e.target.value)}
                  />
                  <div className="relative">
                    <textarea 
                      rows={10}
                      placeholder="Write your story content here..."
                      className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none font-serif text-lg"
                      value={ch.content}
                      onChange={(e) => updateChapter(idx, 'content' as any, e.target.value)}
                    ></textarea>
                    
                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={() => handleAiImprove(idx)}
                      className="absolute bottom-4 right-4 bg-amber-500 text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                      title="AI Grammar Improve"
                    >
                      {isAiProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="sticky bottom-8 py-4 px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl flex justify-end items-center gap-4 z-40">
           <button 
            type="button" 
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-2 font-bold text-zinc-500 hover:text-zinc-700"
           >
             Cancel
           </button>
           <button 
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 disabled:opacity-50"
           >
             {loading ? 'Saving...' : 'Publish Story'}
           </button>
        </div>
      </form>
    </div>
  );
};
