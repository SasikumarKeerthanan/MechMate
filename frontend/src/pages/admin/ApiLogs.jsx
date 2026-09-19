import React, { useState } from 'react';
import { Terminal, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function ApiLogs() {
  const [logs] = useState([
    { id: 'log_88201', method: 'POST', endpoint: '/api/v1/auth/forgot-password', status: 200, ip: '192.168.1.45', duration: '48ms', time: '2 mins ago' },
    { id: 'log_88202', method: 'GET', endpoint: '/api/v1/admin/overview', status: 200, ip: '127.0.0.1', duration: '19ms', time: '5 mins ago' },
    { id: 'log_88203', method: 'POST', endpoint: '/api/v1/mechanic/dispatch-accept', status: 409, ip: '172.56.21.90', duration: '85ms', time: '12 mins ago', error: 'Lock contention: provider already assigned.' },
    { id: 'log_88204', method: 'GET', endpoint: '/api/v1/parts/search?query=brake+rotors', status: 200, ip: '64.233.160.1', duration: '34ms', time: '18 mins ago' },
    { id: 'log_88205', method: 'POST', endpoint: '/api/v1/admin/users/usr_004/status', status: 403, ip: '198.51.100.22', duration: '12ms', time: '25 mins ago', error: 'AUTH_FORBIDDEN: Insufficient administrator permissions.' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">API Traffic & Telemetry Logs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time HTTP request trace, latency benchmarks, and API security auditing.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Method & Path</th>
                <th className="px-6 py-4 font-semibold">Status Code</th>
                <th className="px-6 py-4 font-semibold">Latency</th>
                <th className="px-6 py-4 font-semibold">Client IP</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          log.method === 'GET'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : log.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-slate-900 dark:text-white font-sans text-xs">{log.endpoint}</span>
                    </div>
                    {log.error && (
                      <span className="text-[11px] text-rose-500 block mt-1 font-sans">
                        {log.error}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        log.status === 200
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : log.status === 403
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {log.duration}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-sans">
                    {log.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
