import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  Wrench,
  Cpu,
  Terminal,
  Star,
  Car,
  MessageSquare,
  X,
} from 'lucide-react';

export const navigationLinks = [
  {
    name: 'Dashboard Overview',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'User Management',
    to: '/admin/users',
    icon: Users,
  },
  {
    name: 'Provider Approvals',
    to: '/admin/provider-approvals',
    icon: ShieldCheck,
    badge: '2 New',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  },
  {
    name: 'Part Categories',
    to: '/admin/part-categories',
    icon: Package,
  },
  {
    name: 'Service Categories',
    to: '/admin/service-categories',
    icon: Wrench,
  },
  {
    name: 'Diagnosis Data',
    to: '/admin/diagnosis-data',
    icon: Cpu,
  },
  {
    name: 'API Logs',
    to: '/admin/api-logs',
    icon: Terminal,
  },
  {
    name: 'Reviews',
    to: '/admin/reviews',
    icon: Star,
  },
  {
    name: 'Mechanic Requests',
    to: '/admin/mechanic-requests',
    icon: Car,
    badge: 'Live',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse',
  },
  {
    name: 'Inquiries',
    to: '/admin/inquiries',
    icon: MessageSquare,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-glow-sm">
              <Wrench className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-sky-400 bg-clip-text text-transparent">
                MechMate
              </span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                Admin Console
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-5 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </div>

          {navigationLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-brand-500 dark:text-slate-500 dark:group-hover:text-brand-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Platform Status Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Firestore Sync: OK</span>
            </div>
            <span className="font-mono text-[11px] bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
              v1.0.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
