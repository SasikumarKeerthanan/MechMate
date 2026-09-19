import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessData(res.data || { email });
    } catch (err) {
      setError(err?.message || 'Failed to dispatch password recovery link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative transition-colors duration-200">
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-glow mb-4">
            <Wrench className="w-7 h-7 -rotate-45" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enter the email address associated with your MechMate account to receive a secure recovery link.
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successData ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Check Your Email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We have dispatched password recovery instructions to{' '}
                <strong className="text-slate-800 dark:text-slate-200">{email}</strong>. The link remains valid for 30 minutes.
              </p>

              {successData.reset_token && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Development Reset Token:
                  </span>
                  <code className="text-xs font-mono text-brand-600 dark:text-brand-400 break-all select-all">
                    {successData.reset_token}
                  </code>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-right">
                    <Link
                      to={`/reset-password?email=${encodeURIComponent(email)}&token=${successData.reset_token}`}
                      className="text-xs font-bold text-brand-600 hover:text-brand-500 inline-flex items-center gap-1"
                    >
                      Proceed to Reset Form <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Request Another Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:shadow-glow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending Instructions...' : 'Send Recovery Link'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Admin Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
