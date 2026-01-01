import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Story } from '../types';
import { Plus, Edit2, Trash2, Eye, BookOpen } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!StorageService.isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    setStories(StorageService.getStories());
  }, [navigate]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      StorageService.deleteStory(id);
      setStories(StorageService.getStories());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">Dashboard</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your library content</p>
        </div>
        <Link 
          to="/admin/story/new" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-all"
        >
          <Plus size={20} />
          Create New Story
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Story</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Genre</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {stories.map((story) => (
              <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img className="h-10 w-10 rounded-md object-cover bg-gray-200 dark:bg-gray-700" src={story.coverUrl} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{story.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(story.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${story.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                    {story.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {story.genre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <Link to={`/story/${story.id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="View Public Page">
                      <Eye size={18} />
                    </Link>
                    <Link to={`/admin/story/edit/${story.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300" title="Edit Story Details">
                      <Edit2 size={18} />
                    </Link>
                     <Link to={`/admin/story/${story.id}/chapters`} className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300" title="Manage Chapters">
                      <BookOpen size={18} />
                    </Link>
                    <button onClick={() => handleDelete(story.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {stories.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No stories yet. Create one to get started!
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};