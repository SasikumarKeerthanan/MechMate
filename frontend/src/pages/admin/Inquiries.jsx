import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([
    {
      id: 'inq_301',
      ticket: 'MM-INQ-1049',
      sender: 'Michael Chen (Vehicle Owner)',
      email: 'mchen@example.com',
      subject: 'Dispute regarding roadside labor charge',
      priority: 'high',
      status: 'open',
      time: '5 hours ago',
      messages: 3,
    },
    {
      id: 'inq_302',
      ticket: 'MM-INQ-1048',
      sender: 'Speedy Garage Admin (Provider)',
      email: 'payouts@speedygarage.com',
      subject: 'Weekly payout reconciliation query',
      priority: 'medium',
      status: 'in_progress',
      time: 'Yesterday',
      messages: 5,
    },
    {
      id: 'inq_303',
      ticket: 'MM-INQ-1045',
      sender: 'Jessica Taylor (Corporate Fleet)',
      email: 'jtaylor@mail.com',
      subject: 'How to register a fleet of company vehicles',
      priority: 'low',
      status: 'resolved',
      time: '3 days ago',
      messages: 2,
    },
  ]);

  const resolveInquiry = (id) => {
    setInquiries(inquiries.map(i => i.id === id ? { ...i, status: 'resolved' } : i));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Helpdesk Inquiries</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Respond to support tickets, billing inquiries, and dispute escalations.
        </p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {inq.ticket}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {inq.subject}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    inq.priority === 'high'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      : inq.priority === 'medium'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  }`}
                >
                  {inq.priority} Priority
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    inq.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}
                >
                  {inq.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>From: <strong className="text-slate-700 dark:text-slate-200">{inq.sender}</strong> ({inq.email})</span>
              <span>Logged: {inq.time} • {inq.messages} messages</span>
            </div>

            {inq.status !== 'resolved' && (
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => resolveInquiry(inq.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
