import React from 'react';
import { Link } from 'react-router-dom';
import { Story } from '../types';
import { Book, Clock } from 'lucide-react';

interface StoryCardProps {
  story: Story;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <Link to={`/story/${story.id}`} className="group flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <img 
          src={story.coverUrl} 
          alt={story.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
           <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${story.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'}`}>
             {story.status}
           </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">{story.genre}</span>
        <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {story.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
          {story.synopsis}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <Book size={14} />
            <span>Read Now</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};