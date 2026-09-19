import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 id="modal-headline" className="text-lg font-bold text-slate-900 dark:text-white">
              Confirm Administrator Logout
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to end your current administrative session? You will need to authenticate again to access the MechMate Admin portal.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
