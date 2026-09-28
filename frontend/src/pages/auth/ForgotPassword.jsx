import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/services';
import './Auth.css';

// SVG Icons for clean rendering without external dependencies
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

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Wizard Step: 1 = Email, 2 = Verify Code, 3 = New Password
  const [step, setStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [role, setRole] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Timer (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Refs for 6-digit OTP input boxes
  const otpInputRefs = useRef([]);

  // Mock accounts for 5 roles to assist reviewers/testers
  const mockRoles = [
    { label: 'Admin', email: 'admin@mechmate.lk', role: 'Administrator' },
    { label: 'Vehicle Owner', email: 'owner@mechmate.lk', role: 'Vehicle Owner' },
    { label: 'Shop Owner', email: 'shop@mechmate.lk', role: 'Shop Owner' },
    { label: 'Service Centre', email: 'service@mechmate.lk', role: 'Service Centre Owner' },
    { label: 'Mechanic', email: 'mechanic@mechmate.lk', role: 'Mechanic' },
  ];

  // Expiration countdown
  useEffect(() => {
    let timer;
    if (step >= 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

  // ── Step 1: Submit Email for Reset Code ──────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await authApi.forgotPassword(email);
      const data = response.data;
      setStatus('success');
      setDebugCode(data.debug_code || '');
      setRole(data.role || '');
      setTimeLeft(900); // 15-minute expiry timer

      // Pre-fill OTP if debug code is available for swift testing
      if (data.debug_code && data.debug_code.length === 6) {
        setOtp(data.debug_code.split(''));
      }

      // Transition to Step 2
      setTimeout(() => {
        setStep(2);
        setStatus('idle');
      }, 600);
    } catch (err) {
      setStatus('error');
      if (err.response?.status === 404) {
        setErrorMessage('No MechMate account found with this email address.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to process password reset. Please try again.');
      }
    }
  };

  // ── OTP input change & keyboard navigation ──────────────────────────────
  const handleOtpChange = (index, value) => {
    // Only accept numeric characters
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleanValue.length > 1) {
      // Handle paste of multiple digits
      const pastedDigits = cleanValue.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto-advance focus to next input
    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // ── Step 2: Verify 6-digit Code ─────────────────────────────────────────
  const handleVerifyCodeSubmit = async (e) => {
    e.preventDefault();
    const codeString = otp.join('');
    if (codeString.length !== 6) {
      setStatus('error');
      setErrorMessage('Please enter the complete 6-digit confirmation code.');
      return;
    }

    if (timeLeft <= 0) {
      setStatus('error');
      setErrorMessage('The verification code has expired. Please request a new code.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await authApi.verifyCode({ email, code: codeString });
      setStatus('success');
      setTimeout(() => {
        setStep(3);
        setStatus('idle');
      }, 500);
    } catch (err) {
      setStatus('error');
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Invalid verification code. Please check and try again.');
      }
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const response = await authApi.forgotPassword(email);
      const data = response.data;
      setDebugCode(data.debug_code || '');
      setTimeLeft(900);
      if (data.debug_code && data.debug_code.length === 6) {
        setOtp(data.debug_code.split(''));
      }
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  // ── Step 3: Set New Password ────────────────────────────────────────────
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== passwordConfirmation) {
      setStatus('error');
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const codeString = otp.join('');
      await authApi.resetPassword({
        email,
        code: codeString,
        password,
        password_confirmation: passwordConfirmation,
      });

      setStatus('success');
      setShowSuccessModal(true);
    } catch (err) {
      setStatus('error');
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to reset password. The code may be expired or invalid.');
      }
    }
  };

  const copyDebugCode = () => {
    if (debugCode) {
      navigator.clipboard.writeText(debugCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* MechMate Brand Header */}
        <div className="auth-logo">
          <span className="logo-mech">Mech</span>
          <span className="logo-mate">Mate</span>
        </div>

        <h2 className="auth-title">
          {step === 1 && 'Reset Password'}
          {step === 2 && 'Verify Security Code'}
          {step === 3 && 'Create New Password'}
        </h2>
        <p className="auth-subtitle">
          {step === 1 && 'Enter your MechMate account email to receive a 6-digit confirmation code.'}
          {step === 2 && `Enter the 6-digit code sent to ${email}`}
          {step === 3 && 'Choose a strong, secure password for your account.'}
        </p>

        {/* Stepper Indicator */}
        <div className="auth-stepper">
          <div className="stepper-line">
            <div
              className="stepper-line-progress"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />
          </div>
          <div className={`stepper-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
            <span className="step-label">Email</span>
          </div>
          <div className={`stepper-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
            <span className="step-label">Verify</span>
          </div>
          <div className={`stepper-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Password</span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="auth-error" role="alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Development Debug Code Banner */}
        {debugCode && step >= 1 && (
          <div className="dev-code-banner">
            <div className="dev-code-info">
              <span className="dev-code-label">
                Development OTP {role && `• ${role}`}
              </span>
              <span className="dev-code-val">{debugCode}</span>
            </div>
            <button
              type="button"
              className="dev-code-copy-btn"
              onClick={copyDebugCode}
            >
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        )}

        {/* ── STEP 1: Email Form ── */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form" id="forgot-password-form">
            <div className="form-group">
              <label htmlFor="fp-email">Account Email Address</label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@mechmate.lk"
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
              {status === 'loading' ? (
                <>
                  <div className="spinner" />
                  <span>Sending Code…</span>
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>

            {/* Quick Test Accounts for all 5 roles */}
            <div className="role-pills-section">
              <span className="role-pills-label">Quick-fill test accounts by role:</span>
              <div className="role-pills-grid">
                {mockRoles.map((item) => (
                  <button
                    key={item.email}
                    type="button"
                    className="role-pill-btn"
                    onClick={() => setEmail(item.email)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Link to="/admin/login" className="auth-back-link">
              ← Back to Login
            </Link>
          </form>
        )}

        {/* ── STEP 2: Verify Code Form ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyCodeSubmit} className="auth-form" id="verify-code-form">
            <div className="form-group">
              <label>6-Digit Confirmation Code</label>
              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* Countdown Timer & Resend */}
            <div className="resend-box">
              <span>
                Expires in: <strong style={{ color: timeLeft < 120 ? '#ef4444' : '#1e293b' }}>{formatTime(timeLeft)}</strong>
              </span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={status === 'loading'}
              >
                Resend Code
              </button>
            </div>

            <button
              id="verify-code-btn"
              type="submit"
              className="auth-btn"
              disabled={status === 'loading' || otp.join('').length !== 6}
            >
              {status === 'loading' ? (
                <>
                  <div className="spinner" />
                  <span>Verifying Code…</span>
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <button
              type="button"
              className="auth-back-link"
              onClick={() => {
                setStep(1);
                setErrorMessage('');
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Change Email Address
            </button>
          </form>
        )}

        {/* ── STEP 3: Reset Password Form ── */}
        {step === 3 && (
          <form onSubmit={handleResetPasswordSubmit} className="auth-form" id="reset-password-form">
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="rp-new-password">New Password</label>
              <div className="password-field-wrapper">
                <input
                  id="rp-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoFocus
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

            {/* Confirm New Password */}
            <div className="form-group">
              <label htmlFor="rp-confirm-password">Confirm New Password</label>
              <div className="password-field-wrapper">
                <input
                  id="rp-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Re-enter new password"
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
              id="reset-password-btn"
              type="submit"
              className="auth-btn"
              disabled={status === 'loading' || password.length < 8 || password !== passwordConfirmation}
            >
              {status === 'loading' ? (
                <>
                  <div className="spinner" />
                  <span>Updating Password…</span>
                </>
              ) : (
                'Save New Password'
              )}
            </button>

            <Link to="/admin/login" className="auth-back-link">
              ← Back to Login
            </Link>
          </form>
        )}
      </div>

      {/* ── Success Modal Dialog ── */}
      {showSuccessModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-icon-circle">✓</div>
            <h3 className="modal-title">Password Reset Complete!</h3>
            <p className="modal-body">
              Your password has been successfully updated. You can now log into MechMate with your new credentials.
            </p>
            <button
              type="button"
              className="modal-btn"
              onClick={() => navigate('/admin/login')}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
