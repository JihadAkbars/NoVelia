
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAdmin, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
              NoVelia
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-500 font-medium transition-colors">
              Explore
            </Link>
            
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-md font-medium text-sm">
                  Dashboard
                </Link>
                <button 
                  onClick={() => { onLogout(); navigate('/'); }}
                  className="text-red-500 hover:text-red-600 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
