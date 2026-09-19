import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  colorClass = 'text-brand-500 bg-brand-50 dark:bg-brand-950/40',
}) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>

        {trendValue && (
          <div
            className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend === 'up'
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400'
                : trend === 'down'
                ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400'
                : 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {trendValue}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
