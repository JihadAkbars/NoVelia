
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-900 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">
          Copyright 2026 NoVelia (Jihad)
        </p>
        <p className="text-gray-400 dark:text-zinc-600 text-xs mt-2 italic">
          Crafting worlds, one chapter at a time.
        </p>
      </div>
    </footer>
  );
};
