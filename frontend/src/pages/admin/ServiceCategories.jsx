import React, { useState } from 'react';
import { Wrench, Plus, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ServiceCategories() {
  const [services, setServices] = useState([
    { id: 'srv_1', name: 'Emergency Roadside Assistance', rate: 45.0, isEmergency: true, mechanics: 312, status: 'active' },
    { id: 'srv_2', name: 'Periodic Maintenance & Oil Service', rate: 60.0, isEmergency: false, mechanics: 540, status: 'active' },
    { id: 'srv_3', name: 'OBD-II & Computerized Diagnostics', rate: 50.0, isEmergency: false, mechanics: 280, status: 'active' },
    { id: 'srv_4', name: 'Tire Replacement & Wheel Alignment', rate: 35.0, isEmergency: true, mechanics: 190, status: 'active' },
    { id: 'srv_5', name: 'Air Conditioning & Climate Service', rate: 75.0, isEmergency: false, mechanics: 165, status: 'active' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Service Categories</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure vehicle repair offerings, roadside emergency flags, and base labor tariff baselines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{srv.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">Base Dispatch Rate</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">${srv.rate.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">Active Coverage</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{srv.mechanics} Mechanics</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              {srv.isEmergency ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Emergency Dispatch Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  Scheduled Service
                </span>
              )}

              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
