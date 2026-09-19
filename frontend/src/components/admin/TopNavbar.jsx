import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, Shield, ChevronDown, CheckCheck, AlertCircle, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

export default function TopNavbar({ onToggleSidebar, onOpenLogoutModal }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: 'New Provider Application',
      desc: 'Apex Performance Motors submitted verification certificates.',
      time: '12m ago',
      unread: true,
      icon: Shield,
      color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40',
    },
    {
      id: 2,
      title: 'Emergency Dispatch Active',
      desc: 'Stranded vehicle reported on Interstate 80 (Toyota RAV4).',
      time: '24m ago',
      unread: true,
      icon: AlertCircle,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      id: 3,
      title: 'DTC Code Diagnostic Sync',
      desc: 'Firestore updated 14 new OBD-II code remedies.',
      time: '1h ago',
      unread: true,
      icon: Wrench,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    },
  ];

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Toggle & Welcome / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation drawer"
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">
              Administrator Operations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              System monitoring, service providers, and catalog administration
            </p>
          </div>
        </div>

        {/* Right Side: Theme Toggle, Notifications, Profile Badge & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />

          {/* Notifications Counter & Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="View notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold">
                      {unreadCount} new
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.map((notif) => {
                    const NotifIcon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${notif.color}`}>
                          <NotifIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {notif.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                            {notif.time}
                          </span>
                        </div>
                        {notif.unread && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600"
                  >
                    Close Notification Center
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Admin Profile Badge */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="relative">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt="Admin Avatar"
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-500/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'Admin Manager'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                    {user?.role || 'Super Admin'}
                  </span>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLogoutModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={onOpenLogoutModal}
            title="Log Out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
