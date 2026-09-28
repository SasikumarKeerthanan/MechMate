import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/services';
import './Auth.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [form, setForm] = useState({
    password: '',
    password_confirmation: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const { data } = await authApi.resetPassword({ token, email, ...form });
      setStatus('success');
      setMessage(data.message ?? 'Password reset successfully!');
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message ?? 'Reset failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-mech">Mech</span>
          <span className="logo-mate">Mate</span>
        </div>
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter and confirm your new password below.</p>

        {status === 'success' ? (
          <div className="auth-success-msg">
            <span className="success-icon">✅</span>
            <p>{message}</p>
            <p className="auth-subtitle">Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" id="reset-password-form">
            {status === 'error' && (
              <div className="auth-error">{message}</div>
            )}

            <div className="form-group">
              <label htmlFor="rp-email">Email Address</label>
              <input
                id="rp-email"
                type="email"
                value={email}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="rp-password">New Password</label>
              <input
                id="rp-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="rp-confirm">Confirm New Password</label>
              <input
                id="rp-confirm"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Re-enter password"
                minLength={8}
                required
              />
            </div>

            <button
              id="rp-submit-btn"
              type="submit"
              className="auth-btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Resetting…' : 'Reset Password'}
            </button>

            <Link to="/admin/login" className="auth-back-link">
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
