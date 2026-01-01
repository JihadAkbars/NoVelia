import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-20 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-8">
           <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center mr-2">
             <span className="text-[10px] font-black">NV</span>
           </div>
           <span className="font-black text-lg tracking-tighter">NoVelia</span>
        </div>
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
          Copyright 2026 NoVelia (Jihad)
        </p>
        <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-3 italic max-w-sm mx-auto leading-relaxed">
          The quietest place on the web to lose yourself in a story.
        </p>
      </div>
    </footer>
  );
};
