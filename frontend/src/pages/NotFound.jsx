import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Home, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-6 text-center relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-20 h-20 rounded-3xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-glow">
        <Wrench className="w-10 h-10 rotate-12" />
      </div>

      <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mb-3">
        404 ERROR
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        Roadblock! Page Not Found
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The route you requested could not be located in the MechMate application registry. It may have been moved or archived.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/admin/dashboard"
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Admin Dashboard
        </Link>
        <Link
          to="/forgot-password"
          className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Password Recovery
        </Link>
      </div>
    </div>
  );
}
