import React, { useState } from 'react';
import { Car, Navigation, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function MechanicRequests() {
  const [requests] = useState([
    {
      id: 'req_9921',
      customer: 'David Kim',
      phone: '+1 (555) 349-8812',
      vehicle: '2021 Toyota RAV4 Hybrid',
      issue: 'Battery Jumpstart / Electrical',
      location: 'Interstate 80, Mile Marker 42',
      mechanic: 'Marcus Holloway',
      status: 'in_progress',
      urgency: 'high',
      time: '18 mins ago',
      eta: '12 mins',
    },
    {
      id: 'req_9922',
      customer: 'Sophia Martinez',
      phone: '+1 (555) 776-9021',
      vehicle: '2019 Honda Civic',
      issue: 'Overheating Engine / Coolant Leak',
      location: 'Downtown Main St & 4th Ave',
      mechanic: 'Searching nearest mechanic...',
      status: 'searching_provider',
      urgency: 'critical',
      time: '7 mins ago',
      eta: '--',
    },
    {
      id: 'req_9920',
      customer: 'Robert Green',
      phone: '+1 (555) 431-2290',
      vehicle: '2018 Ford F-150',
      issue: 'Blown Tire on Shoulder',
      location: 'North Expressway Exit 14',
      mechanic: 'Apex Auto Care (Tech: Jack)',
      status: 'completed',
      urgency: 'medium',
      time: '2 hours ago',
      eta: 'Finished',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mechanic Roadside Requests</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time tracking of on-demand emergency assistance calls and dispatch allocations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{req.customer}</h3>
                    <span className="text-xs text-slate-400">({req.phone})</span>
                  </div>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{req.vehicle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    req.urgency === 'critical'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20'
                      : req.urgency === 'high'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {req.urgency} Urgency
                </span>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                    req.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : req.status === 'in_progress'
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse'
                  }`}
                >
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block mb-1">Issue Reported</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{req.issue}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-brand-500" /> GPS Location
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{req.location}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-500" /> Assigned Mechanic / ETA
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {req.mechanic} ({req.eta})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
