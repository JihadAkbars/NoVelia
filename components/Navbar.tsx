import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAdmin, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isReader = location.pathname.startsWith('/read/');

  if (isReader) return null; // Let the reader handle its own navigation

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform shadow-lg shadow-amber-500/20">
            <span className="text-zinc-950 font-black text-xl">N</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
            NoVelia
          </span>
        </Link>

        <div className="flex items-center space-x-8">
          <Link to="/" className={`text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-amber-500' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
            Library
          </Link>
          
          {isAdmin ? (
            <div className="flex items-center space-x-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <Link to="/admin/dashboard" className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-transform">
                Console
              </Link>
              <button 
                onClick={() => { onLogout(); navigate('/'); }}
                className="text-red-500 hover:text-red-600 p-2 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 007.13 4.153M15 11c0-2.136-.87-4.069-2.286-5.464M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
