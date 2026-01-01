import React from 'react';
import { Link } from 'react-router-dom';
import { Story } from '../types';
import { Book, Clock, ChevronRight } from 'lucide-react';

interface StoryCardProps {
  story: Story;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <Link to={`/story/${story.id}`} className="group flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-800 relative isolate">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img 
          src={story.coverUrl} 
          alt={story.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
        
        <div className="absolute top-3 right-3 z-10">
           <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md ${story.status === 'Completed' ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
             {story.status}
           </span>
        </div>
        
        {/* Mobile/Quick View Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 md:hidden">
             <h3 className="font-serif text-xl font-bold text-white leading-tight drop-shadow-md">{story.title}</h3>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{story.genre}</span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                <span>{new Date(story.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        
        <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
          {story.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
          {story.synopsis}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-colors">
          <span className="text-sm font-semibold text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400 flex items-center gap-2 transition-colors">
            <Book size={16} />
            Read Now
          </span>
          <span className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};
