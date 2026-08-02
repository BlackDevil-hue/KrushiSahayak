import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Phone, KeyRound, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { sendFirebaseOtp } from '../services/firebase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '957957375070-9938oi6tvnv6416uukj5o3vt75kn76oj.apps.googleusercontent.com';

export default function LoginPage() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const googleBtnRef = useRef(null);

  const { login, verifyOtp, googleAuth, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect to Dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Priority 1: Initialize Google Identity Services (GSI)
  useEffect(() => {
    let checkGsiInterval = null;
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
          });
        } catch (e) {
          console.warn('GSI Initialization warning:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      checkGsiInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGsi();
          clearInterval(checkGsiInterval);
        }
      }, 500);
    }

    return () => {
      if (checkGsiInterval) clearInterval(checkGsiInterval);
    };
  }, []);

  // Priority 1 Callback: Receives real Google ID token (JWT) from Google GSI
  const handleGoogleCallback = async (response) => {
    if (!response?.credential) {
      toast.error('Failed to obtain Google authentication token. Please try again.');
      return;
    }
    setSubmitting(true);
    try {
      // Send real Google idToken to POST /api/auth/google
      await googleAuth({ idToken: response.credential });
      toast.success('Signed in with Google successfully!', 'Welcome');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google Auth backend verification failed:', err);
      toast.error(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 1: Send Firebase SMS OTP ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPhoneError('');
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendFirebaseOtp(digits, 'recaptcha-container');
      setConfirmationResult(result);
      toast.success(`OTP sent to +91-${digits} via SMS`, 'Check your SMS');
      setStep('otp');
    } catch (fbErr) {
      console.error('Firebase OTP Error:', fbErr);
      let errMsg = fbErr?.message || 'Failed to send OTP. Please check your phone number and internet connection.';
      if (fbErr?.code === 'auth/invalid-phone-number') {
        errMsg = 'Invalid mobile number. Please enter a 10-digit number.';
      } else if (fbErr?.code === 'auth/too-many-requests') {
        errMsg = 'Too many attempts. Please wait a few minutes before retrying.';
      } else if (fbErr?.code === 'auth/captcha-check-failed') {
        errMsg = 'Security check failed. Please refresh the page and try again.';
      }
      setPhoneError(errMsg);
      toast.error(errMsg, 'OTP Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 2: Verify Real Firebase OTP ────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpError('');
    const enteredOtp = otp.trim();
    if (!enteredOtp || enteredOtp.length < 6) {
      setOtpError('Please enter the 6-digit OTP code sent to your phone');
      return;
    }

    if (!confirmationResult) {
      setOtpError('OTP session expired. Please go back and resend OTP.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Confirm OTP with Firebase to get real Firebase idToken
      const firebaseResult = await confirmationResult.confirm(enteredOtp);
      const firebaseToken = await firebaseResult.user.getIdToken();

      // 2. Pass verified firebaseToken to backend to issue session JWT
      await verifyOtp(phone.replace(/\D/g, ''), enteredOtp, firebaseToken);

      toast.success('Login successful! Welcome to KrishiSahayak.', 'Welcome');
      navigate(from, { replace: true });
    } catch (err) {
      console.error('OTP Verification Error:', err);
      let errMsg = err?.message || 'Invalid verification code. Please try again.';
      if (err?.code === 'auth/invalid-verification-code') {
        errMsg = 'Incorrect OTP code. Please check your SMS and try again.';
      } else if (err?.code === 'auth/code-expired') {
        errMsg = 'OTP code expired. Please request a new OTP.';
      }
      setOtpError(errMsg);
      toast.error(errMsg, 'Verification Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Priority 1: Google Login Trigger
  const handleGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Render native Google button if prompt was dismissed/not displayed
            if (googleBtnRef.current) {
              window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'outline',
                size: 'large',
                width: 320,
              });
            }
          }
        });
      } catch (e) {
        toast.error('Google Sign-In is unavailable. Please check your network connection.');
      }
    } else {
      toast.error('Google Sign-In service is loading. Please try again in a moment.');
    }
  };

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 160px)',
          padding: '24px 16px',
        }}
      >
        <Card elevation="shadow-md" padding="lg" style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              {step === 'phone' ? <Phone size={28} /> : <KeyRound size={28} />}
            </div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', margin: 0 }}>
              {step === 'phone' ? 'Farmer Sign In' : 'Enter OTP'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {step === 'phone'
                ? 'Enter your mobile number to receive OTP'
                : `Enter the 6-digit verification code sent to +91 ${phone}`}
            </p>
          </div>

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" />

          {/* Step 1: Phone Form */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp}>
              <Input
                label="Mobile Phone Number"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setPhoneError('');
                }}
                maxLength={10}
                required
                icon={Phone}
                startAdornment={<span style={{ fontWeight: '600', color: 'var(--color-text-muted)' }}>+91</span>}
                error={phoneError}
                helperText="We will send a 6-digit verification code"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={submitting}
                disabled={submitting}
                icon={ArrowRight}
                iconPosition="right"
                style={{ marginTop: '16px' }}
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* Step 2: OTP Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <Input
                label="Verification Code (OTP)"
                type="tel"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                maxLength={6}
                required
                icon={KeyRound}
                error={otpError}
                helperText={`OTP code sent via SMS to +91-${phone}`}
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={submitting}
                disabled={submitting}
                icon={CheckCircle2}
                iconPosition="right"
                style={{ marginTop: '12px' }}
              >
                Verify & Sign In
              </Button>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: 'var(--font-size-sm)' }}>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); setOtpError(''); setSubmitting(false); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                >
                  ← Change Number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={submitting}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={14} /> Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ padding: '0 12px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Google Sign-In */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div ref={googleBtnRef} style={{ marginBottom: '8px' }} />
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-elevated)',
                color: 'var(--color-text-primary)',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--font-size-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Footer Navigation */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            New to KrishiSahayak?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
              Register Farmer Profile
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
