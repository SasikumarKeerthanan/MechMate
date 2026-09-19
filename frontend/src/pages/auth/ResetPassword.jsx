import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, Wrench } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';
import api from '../../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('email')) setEmail(searchParams.get('email'));
    if (searchParams.get('token')) setToken(searchParams.get('token'));
  }, [searchParams]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Failed to reset password. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative transition-colors duration-200">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-glow mb-4">
            <Wrench className="w-7 h-7 -rotate-45" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Set New Password
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Create a secure password for your MechMate account.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redirecting you to the Administrator Dashboard in a moment...
              </p>
              <Link
                to="/admin/dashboard"
                className="inline-block mt-3 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold"
              >
                Go Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from email"
                  className="w-full px-3.5 py-2 rounded-xl text-sm font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:shadow-glow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Request Link
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
