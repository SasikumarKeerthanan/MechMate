import React, { useState } from 'react';
import { Star, Flag, EyeOff, CheckCircle } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([
    {
      id: 'rev_501',
      customer: 'Lucas Scott',
      provider: 'Apex Performance Motors',
      service: 'Emergency Brake Bleed & Rotor Replacement',
      rating: 5,
      comment: 'Arrived within 25 minutes on the highway. Exceptional work and fair pricing.',
      status: 'published',
      date: '2 days ago',
    },
    {
      id: 'rev_502',
      customer: 'Natalie Portman',
      provider: 'Citywide Tire Pros',
      service: 'Flat Tire Mobile Repair',
      rating: 2,
      comment: 'Mechanic took twice as long as the ETA in the app without notifying me.',
      status: 'flagged',
      date: '4 days ago',
    },
    {
      id: 'rev_503',
      customer: 'Brian O\'Connor',
      provider: 'Precision Mobile Diagnostics',
      service: 'ECU Remap & OBD Scan',
      rating: 5,
      comment: 'Identified intermittent electrical short in 15 minutes. High skill level!',
      status: 'published',
      date: '6 days ago',
    },
  ]);

  const toggleStatus = (id, newStatus) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Reviews & Moderation</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Moderate feedback, verify service ratings, and protect provider reputations against fraudulent claims.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {rev.customer}
                </span>
                <span className="text-xs text-slate-400">• on {rev.provider}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    rev.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : rev.status === 'flagged'
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {rev.status}
                </span>

                <button
                  type="button"
                  onClick={() => toggleStatus(rev.id, rev.status === 'flagged' ? 'published' : 'flagged')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Flag / Unflag"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 italic">
              "{rev.comment}"
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Service: {rev.service}</span>
              <span>{rev.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
