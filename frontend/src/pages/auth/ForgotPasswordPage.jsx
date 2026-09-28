import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/services';
import './Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const { data } = await authApi.forgotPassword(email);
      setStatus('success');
      setMessage(data.message ?? 'Password reset link sent! Please check your email.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-mech">Mech</span>
          <span className="logo-mate">Mate</span>
        </div>
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your account email and we'll send you a reset link.
        </p>

        {status === 'success' ? (
          <div className="auth-success-msg">
            <span className="success-icon">✉️</span>
            <p>{message}</p>
            <Link to="/admin/login" className="auth-back-link">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" id="forgot-password-form">
            {status === 'error' && (
              <div className="auth-error">{message}</div>
            )}

            <div className="form-group">
              <label htmlFor="fp-email">Email Address</label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mechmate.lk"
                required
                autoFocus
              />
            </div>

            <button
              id="fp-submit-btn"
              type="submit"
              className="auth-btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
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
