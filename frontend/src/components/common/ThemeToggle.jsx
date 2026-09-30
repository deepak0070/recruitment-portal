import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700/80 hover:text-amber-200 shadow-inner'
          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 shadow-2xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
