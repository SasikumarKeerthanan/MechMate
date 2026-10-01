import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/admin/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'MechMate | Admin Login';
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message ?? 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-mech">Mech</span>
          <span className="logo-mate">Mate</span>
        </div>
        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-subtitle">Sign in to the MechMate administration panel.</p>

        <form onSubmit={handleSubmit} className="auth-form" id="admin-login-form">
          {status === 'error' && (
            <div className="auth-error">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@mechmate.lk"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="auth-form-footer">
            <Link to="/forgot-password" className="auth-forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
