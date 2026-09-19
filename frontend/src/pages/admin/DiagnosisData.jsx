import React, { useState } from 'react';
import { Cpu, Search, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function DiagnosisData() {
  const [codes, setCodes] = useState([
    {
      code: 'P0300',
      system: 'Ignition / Fuel',
      description: 'Random or Multiple Cylinder Misfire Detected',
      severity: 'critical',
      causes: ['Faulty spark plugs or coils', 'Clogged fuel injector', 'Low fuel pressure', 'Vacuum leak'],
      actions: 'Inspect spark plugs, test fuel rail pressure, smoke test intake manifold.',
    },
    {
      code: 'P0420',
      system: 'Emissions / Exhaust',
      description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      severity: 'moderate',
      causes: ['Degraded catalytic converter', 'Oxygen sensor failure', 'Exhaust leak before catalyst'],
      actions: 'Monitor upstream vs downstream O2 sensor waveforms, inspect exhaust joints.',
    },
    {
      code: 'P0171',
      system: 'Air / Fuel Metering',
      description: 'System Too Lean (Bank 1)',
      severity: 'moderate',
      causes: ['Dirty Mass Air Flow (MAF) sensor', 'Intake boot crack', 'Weak fuel pump'],
      actions: 'Clean MAF sensor with approved spray, inspect intake vacuum lines.',
    },
    {
      code: 'C0035',
      system: 'Brakes / Chassis',
      description: 'Left Front Wheel Speed Sensor Supply Circuit / Performance',
      severity: 'high',
      causes: ['Damaged sensor wire harness', 'Defective tone ring', 'Failed ABS wheel sensor'],
      actions: 'Measure resistance across sensor terminals, check reluctor ring for missing teeth.',
    },
  ]);

  const [search, setSearch] = useState('');

  const filtered = codes.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Diagnosis Data Knowledge Base</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            OBD-II Diagnostic Trouble Codes (DTC), fault telemetry rules, and AI guidance recommendations.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trouble codes (e.g. P0300, Misfire, O2 Sensor)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.code}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold font-mono text-brand-600 dark:text-brand-400">
                  {item.code}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {item.system}
                </span>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                  item.severity === 'critical'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20'
                    : item.severity === 'high'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20'
                }`}
              >
                {item.severity}
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                {item.description}
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Common Causes:</span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                  {item.causes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Recommended Action:</span>
                <p className="text-slate-600 dark:text-slate-300 italic">{item.actions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
