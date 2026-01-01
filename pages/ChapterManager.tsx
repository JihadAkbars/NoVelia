import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { Chapter, Story } from '../types';
import { Plus, Trash2, Edit2, ArrowLeft, Wand2, Save } from 'lucide-react';

export const ChapterManager: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Partial<Chapter>>({});
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!StorageService.isAuthenticated()) {
        navigate('/admin/login');
        return;
    }
    if (storyId) {
        setStory(StorageService.getStory(storyId) || null);
        setChapters(StorageService.getChaptersByStory(storyId));
    }
  }, [storyId, navigate]);

  const handleEdit = (chapter?: Chapter) => {
    if (chapter) {
        setCurrentChapter(chapter);
    } else {
        setCurrentChapter({
            title: '',
            content: '',
            storyId: storyId,
            order: chapters.length + 1
        });
    }
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this chapter?")) {
        StorageService.deleteChapter(id);
        if (storyId) setChapters(StorageService.getChaptersByStory(storyId));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChapter.title || !currentChapter.content || !storyId) return;

    const chapterToSave: Chapter = {
        id: currentChapter.id || `c${Date.now()}`,
        storyId: storyId,
        title: currentChapter.title,
        content: currentChapter.content,
        order: currentChapter.order || chapters.length + 1,
        publishedAt: (currentChapter as Chapter).publishedAt || Date.now()
    };

    StorageService.saveChapter(chapterToSave);
    setChapters(StorageService.getChaptersByStory(storyId));
    setIsEditing(false);
  };

  const improveContent = async () => {
      if (!currentChapter.content) return;
      setAiLoading(true);
      try {
          const improved = await GeminiService.improveContent(currentChapter.content);
          setCurrentChapter(prev => ({ ...prev, content: improved }));
      } catch (e) {
          alert("AI Error");
      } finally {
          setAiLoading(false);
      }
  };

  if (!story) return <div>Loading...</div>;

  if (isEditing) {
      return (
          <div className="max-w-4xl mx-auto px-4 py-8">
              <button onClick={() => setIsEditing(false)} className="flex items-center text-gray-500 dark:text-gray-400 mb-4 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <ArrowLeft size={16} className="mr-2" /> Cancel
              </button>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
                  <h2 className="text-2xl font-bold mb-6 font-serif text-gray-900 dark:text-white">{currentChapter.id ? 'Edit Chapter' : 'New Chapter'}</h2>
                  <form onSubmit={handleSave} className="space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter Title</label>
                          <input 
                              type="text" 
                              value={currentChapter.title}
                              onChange={(e) => setCurrentChapter({...currentChapter, title: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Number</label>
                          <input 
                              type="number" 
                              value={currentChapter.order}
                              onChange={(e) => setCurrentChapter({...currentChapter, order: parseInt(e.target.value)})}
                              className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              required
                          />
                      </div>
                      <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content (HTML supported)</label>
                            {process.env.API_KEY && (
                                <button type="button" onClick={improveContent} disabled={aiLoading} className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50">
                                    <Wand2 size={12} /> {aiLoading ? 'Improving...' : 'AI Improve Grammar'}
                                </button>
                            )}
                          </div>
                          <textarea 
                              rows={15}
                              value={currentChapter.content}
                              onChange={(e) => setCurrentChapter({...currentChapter, content: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-serif text-lg leading-relaxed bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="<p>Write your story here...</p>"
                              required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use HTML tags like &lt;p&gt; for paragraphs.</p>
                      </div>
                      <div className="flex justify-end pt-4">
                          <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                              <Save size={18} /> Save Chapter
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
            <Link to="/admin/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors">
                 <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">
                Chapters: {story.title}
            </h1>
        </div>
        <button 
            onClick={() => handleEdit()}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
            <Plus size={18} /> Add Chapter
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
         {chapters.length > 0 ? (
             <div className="divide-y divide-gray-100 dark:divide-gray-800">
                 {chapters.map(chapter => (
                     <div key={chapter.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors">
                         <div className="flex items-center gap-4">
                             <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300">
                                 {chapter.order}
                             </span>
                             <h3 className="font-medium text-gray-900 dark:text-white">{chapter.title}</h3>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={() => handleEdit(chapter)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full">
                                 <Edit2 size={18} />
                             </button>
                             <button onClick={() => handleDelete(chapter.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full">
                                 <Trash2 size={18} />
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
         ) : (
             <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                 No chapters found. Add one to start writing.
             </div>
         )}
      </div>
    </div>
  );
};