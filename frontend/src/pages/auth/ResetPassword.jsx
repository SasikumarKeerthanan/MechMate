import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/services';
import './Auth.css';

// SVG Icons for password visibility toggle
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query parameter extraction
  const initialEmail = searchParams.get('email') || '';
  const initialCode = searchParams.get('code') || searchParams.get('token') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    document.title = 'MechMate | Reset Password';
  }, []);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    if (initialCode) setCode(initialCode);
  }, [initialEmail, initialCode]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      casing: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    };
    const passedCount = Object.values(checks).filter(Boolean).length;
    let label = 'Weak';
    let levelClass = 'weak';

    if (passedCount === 4) {
      label = 'Strong';
      levelClass = 'strong';
    } else if (passedCount === 3) {
      label = 'Good';
      levelClass = 'good';
    } else if (passedCount === 2) {
      label = 'Fair';
      levelClass = 'fair';
    }

    return { checks, passedCount, label, levelClass };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsTokenExpired(false);

    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your account email.');
      return;
    }

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setStatus('error');
      setErrorMessage('Please provide a valid 6-digit confirmation code.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== passwordConfirmation) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      await authApi.resetPassword({
        email,
        code: cleanCode,
        password,
        password_confirmation: passwordConfirmation,
      });

      setStatus('success');
      setShowSuccessModal(true);
    } catch (err) {
      setStatus('error');
      const msg = err.response?.data?.message || '';
      if (
        msg.toLowerCase().includes('expired') ||
        msg.toLowerCase().includes('not exist') ||
        err.response?.status === 422
      ) {
        setIsTokenExpired(true);
        setErrorMessage(msg || 'Your verification code is invalid or has expired.');
      } else if (err.response?.status === 404) {
        setErrorMessage('No user account found with this email.');
      } else {
        setErrorMessage(msg || 'Failed to reset password. Please check your details and try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-logo">
          <span className="logo-mech">Mech</span>
          <span className="logo-mate">Mate</span>
        </div>

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          Enter your 6-digit verification code and your new password.
        </p>

        {/* Error Banner with Expired Token Handling */}
        {errorMessage && (
          <div className="auth-error" role="alert">
            <span>⚠️</span>
            <div style={{ flex: 1 }}>
              <div>{errorMessage}</div>
              {isTokenExpired && (
                <div style={{ marginTop: '6px' }}>
                  <Link
                    to="/forgot-password"
                    style={{ color: '#b91c1c', fontWeight: '700', textDecoration: 'underline', fontSize: '0.8rem' }}
                  >
                    Request a new 6-digit code →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="reset-password-form">
          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="rp-email">Account Email</label>
            <input
              id="rp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@mechmate.lk"
              required
            />
          </div>

          {/* 6-Digit Code / Token */}
          <div className="form-group">
            <label htmlFor="rp-code">6-Digit Confirmation Code</label>
            <input
              id="rp-code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 123456"
              style={{ letterSpacing: '3px', fontWeight: '700' }}
              required
            />
          </div>

          {/* New Password with Show/Hide */}
          <div className="form-group">
            <label htmlFor="rp-password">New Password</label>
            <div className="password-field-wrapper">
              <input
                id="rp-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Live Password Strength Meter */}
          {password && (
            <div className="strength-meter">
              <div className="strength-info">
                <span style={{ color: '#64748b' }}>Strength:</span>
                <span className={`strength-text ${strength.levelClass}`}>
                  {strength.label}
                </span>
              </div>
              <div className="strength-bar-track">
                <div className={`strength-bar-seg ${strength.passedCount >= 1 ? strength.levelClass : ''}`} />
                <div className={`strength-bar-seg ${strength.passedCount >= 2 ? strength.levelClass : ''}`} />
                <div className={`strength-bar-seg ${strength.passedCount >= 3 ? strength.levelClass : ''}`} />
                <div className={`strength-bar-seg ${strength.passedCount >= 4 ? strength.levelClass : ''}`} />
              </div>
              <div className="strength-criteria">
                <div className={`crit-item ${strength.checks.length ? 'met' : ''}`}>
                  <span className="crit-icon">{strength.checks.length ? '✓' : '•'}</span>
                  <span>8+ characters</span>
                </div>
                <div className={`crit-item ${strength.checks.number ? 'met' : ''}`}>
                  <span className="crit-icon">{strength.checks.number ? '✓' : '•'}</span>
                  <span>At least 1 number</span>
                </div>
                <div className={`crit-item ${strength.checks.casing ? 'met' : ''}`}>
                  <span className="crit-icon">{strength.checks.casing ? '✓' : '•'}</span>
                  <span>Upper & lower case</span>
                </div>
                <div className={`crit-item ${strength.checks.special ? 'met' : ''}`}>
                  <span className="crit-icon">{strength.checks.special ? '✓' : '•'}</span>
                  <span>Special character</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm New Password with Show/Hide */}
          <div className="form-group">
            <label htmlFor="rp-confirm">Confirm New Password</label>
            <div className="password-field-wrapper">
              <input
                id="rp-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Re-enter new password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordConfirmation && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: password === passwordConfirmation ? '#10b981' : '#ef4444',
                  marginTop: '2px',
                }}
              >
                {password === passwordConfirmation ? '✓ Passwords match' : '✕ Passwords do not match'}
              </span>
            )}
          </div>

          <button
            id="rp-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={status === 'loading' || password.length < 8 || password !== passwordConfirmation}
          >
            {status === 'loading' ? (
              <>
                <div className="spinner" />
                <span>Resetting Password…</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <Link to="/forgot-password" className="auth-back-link">
              ← Request New Code
            </Link>
            <Link to="/admin/login" className="auth-back-link">
              Back to Login
            </Link>
          </div>
        </form>
      </div>

      {/* ── Success Modal Dialog ── */}
      {showSuccessModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-icon-circle">✓</div>
            <h3 className="modal-title">Password Reset Successful!</h3>
            <p className="modal-body">
              Your password has been securely updated. You can now access your MechMate account with your new credentials.
            </p>
            <button
              type="button"
              className="modal-btn"
              onClick={() => navigate('/admin/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
