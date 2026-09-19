import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition-all duration-200 border border-slate-200/60 dark:border-slate-700/60 shadow-sm ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-90" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
