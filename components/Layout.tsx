import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User, LogOut, Menu, X, PlusCircle, Moon, Sun, Globe, Check } from 'lucide-react';
import { StorageService } from '../services/storage';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = StorageService.isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isDark, setIsDark] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    StorageService.logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const languages: Language[] = ['Original', 'English', 'Indonesian', 'Spanish'];

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50 dark:bg-gray-950 dark:text-gray-200 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="font-serif text-xl font-bold text-gray-900 dark:text-white tracking-tight">NoVelia</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-6">
               <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1 p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none"
                  aria-label="Change Language"
                >
                  <Globe size={20} />
                  <span className="text-sm font-medium">{language.substring(0, 2)}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        {lang}
                        {language === lang && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
                {/* Backdrop to close */}
                {langMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}></div>}
              </div>

              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Discover
              </Link>
              
              {isAdmin ? (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className={`px-3 py-2 text-sm font-medium transition-colors ${isActive('/admin/dashboard') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/story/new" 
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                  >
                    <PlusCircle size={16} />
                    New Story
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <User size={16} />
                  Owner Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden gap-4">
               <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 relative"
                >
                  <Globe size={20} />
                  <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1 rounded">{language.substring(0, 2)}</span>
                  {langMenuOpen && (
                  <div className="absolute right-0 mt-8 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 text-left">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => { e.stopPropagation(); setLanguage(lang); setLangMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        {lang}
                        {language === lang && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
                {langMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)}></div>}
               </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Discover
              </Link>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Owner Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 NoVelia (Jhdz). All rights reserved.</p>
          <p className="mt-1">A curated space for storytelling.</p>
        </div>
      </footer>
    </div>
  );
};