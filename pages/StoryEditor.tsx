import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/geminiService';
import { Story, GENRES } from '../types';
import { Save, ArrowLeft, Wand2 } from 'lucide-react';

export const StoryEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Story>>({
    title: '',
    author: 'Jihad',
    authorBio: '',
    synopsis: '',
    genre: 'Fantasy',
    coverUrl: 'https://picsum.photos/300/450',
    status: 'Ongoing'
  });

  useEffect(() => {
    if (!StorageService.isAuthenticated()) {
        navigate('/admin/login');
        return;
    }
    const fetch = async () => {
      if (id) {
        const story = await StorageService.getStory(id);
        if (story) setFormData(story);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateAISynopsis = async () => {
    if (!formData.title || !formData.genre) {
        alert("Please enter a title and genre first.");
        return;
    }
    setAiLoading(true);
    try {
        const synopsis = await GeminiService.generateSynopsis(formData.title, formData.genre);
        setFormData(prev => ({ ...prev, synopsis }));
    } catch (e) {
        console.error(e);
        alert("Failed to generate synopsis. Check console for details.");
    } finally {
        setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newStory: Story = {
      id: id || crypto.randomUUID(), // Generate UUID for Supabase
      title: formData.title!,
      author: formData.author!,
      authorBio: formData.authorBio,
      synopsis: formData.synopsis!,
      genre: formData.genre!,
      coverUrl: formData.coverUrl!,
      status: formData.status as 'Ongoing' | 'Completed',
      createdAt: (formData as Story).createdAt || Date.now(),
    };

    await StorageService.saveStory(newStory);
    
    setLoading(false);
    navigate('/admin/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
        <h1 className="text-2xl font-bold mb-6 font-serif text-gray-900 dark:text-white">{id ? 'Edit Story' : 'New Story'}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="The Lost Kingdom"
                />
            </div>
            
             <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author Name (Display)</label>
                <input
                    name="author"
                    type="text"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
            </div>
             <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                 <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>
          </div>

           <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author Biography</label>
                <textarea
                    name="authorBio"
                    rows={3}
                    value={formData.authorBio || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Tell readers about the author..."
                />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
             <div className="flex gap-4">
                <input
                    name="coverUrl"
                    type="text"
                    value={formData.coverUrl}
                    onChange={handleChange}
                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="https://..."
                />
                <img src={formData.coverUrl} alt="Preview" className="h-10 w-10 object-cover rounded border border-gray-200 dark:border-gray-700" />
             </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tip: Use <code>https://picsum.photos/300/450?random=1</code> for random placeholders.</p>
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Synopsis</label>
                <button 
                    type="button" 
                    onClick={generateAISynopsis}
                    disabled={aiLoading}
                    className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
                >
                    <Wand2 size={12} />
                    {aiLoading ? 'Generating...' : 'AI Generate'}
                </button>
             </div>
            <textarea
                name="synopsis"
                rows={4}
                required
                value={formData.synopsis}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Write a compelling summary..."
            />
          </div>

          <div className="pt-4 flex justify-end">
             <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gray-900 dark:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
             >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Story'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
