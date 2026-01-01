import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Menu, X, PlusCircle, Moon, Sun, Globe, Check } from 'lucide-react';
import { StorageService } from '../services/storage';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = StorageService.isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleLogout = () => {
    StorageService.logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;
  const isReaderPage = location.pathname.startsWith('/read/');

  const languages: Language[] = ['Original', 'English', 'Indonesian', 'Spanish'];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50 dark:bg-gray-950 dark:text-gray-200 transition-colors duration-300">
      {!isReaderPage && (
        <nav className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-700 group-hover:scale-105 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="font-serif text-2xl font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">NoVelia</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 text-base font-medium transition-colors ${isActive('/') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Discover
              </Link>

              <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-6 ml-2">
                 <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-yellow-300 dark:hover:bg-gray-800 transition-all"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Language Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none"
                    aria-label="Change Language"
                  >
                    <Globe size={20} />
                    <span className="text-sm font-semibold">{language.substring(0, 2)}</span>
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-4 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                          className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between transition-colors"
                        >
                          {lang}
                          {language === lang && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Backdrop to close */}
                  {langMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}></div>}
                </div>
              </div>
              
              {isAdmin ? (
                <div className="flex items-center gap-4">
                  <Link 
                    to="/admin/dashboard" 
                    className={`px-3 py-2 text-base font-medium transition-colors ${isActive('/admin/dashboard') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/story/new" 
                    className="flex items-center gap-1.5 px-3 py-2 text-base font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400"
                  >
                    <PlusCircle size={18} />
                    New Story
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gray-900 dark:bg-gray-700 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className="ml-4 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 rounded-full hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-400 dark:hover:text-gray-900 transition-all"
                >
                  <User size={16} />
                  Owner Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden gap-2">
               <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="p-3 rounded-full text-gray-500 dark:text-gray-400 relative active:bg-gray-100 dark:active:bg-gray-800"
                >
                  <Globe size={24} />
                  <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded-full shadow-sm">{language.substring(0, 2)}</span>
                  {langMenuOpen && (
                  <div className="absolute right-0 mt-4 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 text-left overflow-hidden">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => { e.stopPropagation(); setLanguage(lang); setLangMenuOpen(false); }}
                        className="w-full text-left px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        {lang}
                        {language === lang && <Check size={18} className="text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
                {langMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}></div>}
               </button>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none active:bg-gray-100 dark:active:bg-gray-800"
              >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:outline-none active:scale-95 transition-transform"
              >
                {mobileMenuOpen ? <X className="block h-7 w-7" /> : <Menu className="block h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-5">
            <div className="pt-4 pb-6 space-y-2 px-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-4 rounded-xl text-lg font-medium text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 transition-colors"
              >
                Discover Stories
              </Link>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-4 rounded-xl text-lg font-medium text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-4 rounded-xl text-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-4 rounded-xl text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Owner Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      )}

      <main className={`flex-grow ${isReaderPage ? '' : 'pt-16 md:pt-20'}`}>
        {children}
      </main>

      {!isReaderPage && (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              <span className="font-serif text-xl font-bold text-gray-900 dark:text-white">NoVelia</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-md">
               A personal sanctuary for stories, imagination, and worlds waiting to be discovered.
            </p>
            <div className="mt-8 text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} NoVelia (Jihad). All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
