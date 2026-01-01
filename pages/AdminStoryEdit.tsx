
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
    try {
      const { data: sData, error: sErr } = await supabase.from('stories').select('*').eq('id', id).single();
      if (sErr) throw sErr;
      
      const { data: cData, error: cErr } = await supabase.from('chapters').select('*').eq('story_id', id).order('order_index', { ascending: true });
      if (cErr) throw cErr;
      
      if (sData) setStory(sData);
      if (cData) setChapters(cData);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
      alert("Failed to load story details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("--- Starting Save Process ---");
    
    if (!story.title || !story.genre) {
      alert("Title and Genre are required.");
      return;
    }

    setLoading(true);

    try {
      let storyId = id;
      const storyPayload = { ...story };
      if (!isEdit) delete storyPayload.id;

      console.log("Step 1: Saving story metadata...", storyPayload);

      if (isEdit) {
        const { error } = await supabase.from('stories').update(storyPayload).eq('id', id);
        if (error) throw error;
        console.log("Story metadata updated.");
      } else {
        const { data, error } = await supabase.from('stories').insert([storyPayload]).select().single();
        if (error) throw error;
        if (!data) throw new Error("Supabase returned no data after insert. Check RLS policies.");
        storyId = data.id;
        console.log("Story created with ID:", storyId);
      }

      console.log("Step 2: Processing chapters...", chapters.length);
      for (const [idx, ch] of chapters.entries()) {
        const chapterPayload = { 
          title: ch.title || `Chapter ${idx + 1}`, 
          content: ch.content || '', 
          story_id: storyId, 
          order_index: idx 
        };

        if (ch.id) {
          console.log(`Updating chapter ${idx + 1}...`);
          const { error } = await supabase.from('chapters').update(chapterPayload).eq('id', ch.id);
          if (error) throw error;
        } else {
          console.log(`Inserting new chapter ${idx + 1}...`);
          const { error } = await supabase.from('chapters').insert([chapterPayload]);
          if (error) throw error;
        }
      }

      console.log("--- Save Process Complete ---");
      alert("Published successfully!");
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error("CRITICAL SAVE ERROR:", error);
      alert('PUBLISH FAILED:\n\n' + (error.message || 'Unknown database error.') + '\n\nMake sure you have run the SQL script in your Supabase SQL Editor.');
    } finally {
      setLoading(false);
    }
  };

  const addChapter = () => setChapters([...chapters, { title: '', content: '' }]);

  const updateChapter = (index: number, field: keyof Chapter, value: any) => {
    const newChaps = [...chapters];
    newChaps[index] = { ...newChaps[index], [field]: value };
    setChapters(newChaps);
  };

  const deleteChapterLocal = async (index: number) => {
    const ch = chapters[index];
    if (ch.id) {
      if (confirm('Delete this chapter forever?')) {
        const { error } = await supabase.from('chapters').delete().eq('id', ch.id);
        if (error) { alert("Error: " + error.message); return; }
      }
    }
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleAiImprove = async (index: number) => {
    const content = chapters[index].content;
    if (!content) return;
    setIsAiProcessing(true);
    try {
      const improved = await improveGrammar(content);
      updateChapter(index, 'content' as any, improved);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <button type="button" onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-3xl font-black">{isEdit ? 'Edit Story' : 'New Story'}</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-10 pb-24">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-100 dark:border-zinc-800 pb-4">General Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input 
              placeholder="Story Title"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-amber-500"
              value={story.title}
              onChange={(e) => setStory({ ...story, title: e.target.value })}
              required
            />
            <input 
              placeholder="Genre (e.g. Fantasy)"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-amber-500"
              value={story.genre}
              onChange={(e) => setStory({ ...story, genre: e.target.value })}
              required
            />
          </div>
          <textarea 
            placeholder="Short Synopsis"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none"
            value={story.synopsis}
            onChange={(e) => setStory({ ...story, synopsis: e.target.value })}
            required
          />
          <textarea 
            placeholder="Author Bio"
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none"
            value={story.author_bio}
            onChange={(e) => setStory({ ...story, author_bio: e.target.value })}
          />
          <input 
            placeholder="Cover URL (Image Link)"
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none"
            value={story.cover_url}
            onChange={(e) => setStory({ ...story, cover_url: e.target.value })}
          />
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chapters</h2>
            <button type="button" onClick={addChapter} className="text-amber-500 font-bold hover:underline">+ Add Chapter</button>
          </div>

          <div className="space-y-6">
            {chapters.map((ch, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-zinc-500 font-bold text-xs uppercase">Chapter {idx + 1}</span>
                  <button type="button" onClick={() => deleteChapterLocal(idx)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <input 
                    placeholder="Chapter Title"
                    className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none"
                    value={ch.title}
                    onChange={(e) => updateChapter(idx, 'title' as any, e.target.value)}
                  />
                  <div className="relative">
                    <textarea 
                      rows={8}
                      placeholder="Chapter content..."
                      className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none font-serif"
                      value={ch.content}
                      onChange={(e) => updateChapter(idx, 'content' as any, e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={() => handleAiImprove(idx)}
                      className="absolute bottom-4 right-4 bg-amber-500 text-white p-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                      title="AI Grammar Fix"
                    >
                      {isAiProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 z-50 flex justify-center">
          <div className="max-w-4xl w-full flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-6 py-3 font-bold text-zinc-500">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all flex items-center shadow-lg shadow-amber-500/20"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
              {isEdit ? 'Save Changes' : 'Publish to NoVelia'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
