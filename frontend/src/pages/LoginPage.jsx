import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Phone, KeyRound, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { sendFirebaseOtp, clearRecaptcha } from '../services/firebase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '957957375070-9938oi6tvnv6416uukj5o3vt75kn76oj.apps.googleusercontent.com';

export default function LoginPage() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const googleButtonRef = useRef(null);

  const { verifyOtp, googleAuth, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to Dashboard when logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Render Google Identity Services (GSI) Native Button
  useEffect(() => {
    let interval = null;
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGsiResponse,
            auto_select: false,
          });

          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            });
          }
        } catch (e) {
          console.warn('GSI Render warning:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGsi();
          clearInterval(interval);
        }
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Handle Google GSI Token Response (Real Google Account Selection)
  const handleGsiResponse = async (response) => {
    if (!response?.credential) {
      toast.error('Google Sign-In was not completed.');
      return;
    }
    setSubmitting(true);
    try {
      await googleAuth({ idToken: response.credential });
      toast.success('Signed in with Google successfully!', 'Welcome');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Google Auth error:', err);
      toast.error(err.message || 'Google authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Firebase Redirect Result
  useEffect(() => {
    const handleRedirect = async () => {
      const auth = getAuth();
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setSubmitting(true);
          const firebaseToken = await result.user.getIdToken();
          await googleAuth({
            idToken: firebaseToken,
            email: result.user.email,
            name: result.user.displayName,
          });
          toast.success(`Welcome, ${result.user.displayName || 'Farmer'}!`, 'Google Sign-In');
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        if (err.code !== 'auth/no-auth-event') {
          console.warn('Google Redirect Result Error:', err);
        }
      } finally {
        setSubmitting(false);
      }
    };
    handleRedirect();
  }, []);

  // Cleanup reCAPTCHA widget
  useEffect(() => {
    clearRecaptcha('recaptcha-container');
  }, [step]);

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
      clearRecaptcha('recaptcha-container');
      const result = await sendFirebaseOtp(digits, 'recaptcha-container');
      setConfirmationResult(result);
      toast.success(`OTP sent to +91-${digits} via SMS`, 'Check your phone');
      setStep('otp');
    } catch (fbErr) {
      console.error('Firebase Phone Auth Error:', fbErr);
      clearRecaptcha('recaptcha-container');
      
      let errMsg = fbErr?.message || 'Failed to send OTP via Firebase.';
      if (fbErr?.code === 'auth/invalid-phone-number') {
        errMsg = 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.';
      } else if (fbErr?.code === 'auth/too-many-requests') {
        errMsg = 'Quota/Rate limit exceeded. Please wait a few minutes before retrying.';
      } else if (fbErr?.code === 'auth/captcha-check-failed') {
        errMsg = 'Security reCAPTCHA failed. Please try again.';
      } else if (fbErr?.code === 'auth/unauthorized-domain') {
        errMsg = 'Domain not authorized in Firebase Console (add capacitor://localhost & onrender.com).';
      }
      setPhoneError(errMsg);
      toast.error(errMsg, 'Firebase OTP Error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 2: Verify Real Firebase SMS OTP ────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpError('');
    const enteredOtp = otp.trim();
    if (!enteredOtp || enteredOtp.length < 6) {
      setOtpError('Please enter the 6-digit OTP code received via SMS');
      return;
    }

    if (!confirmationResult) {
      setOtpError('OTP session expired. Please go back and resend OTP.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Confirm OTP with Firebase to obtain verified ID token
      const firebaseResult = await confirmationResult.confirm(enteredOtp);
      const firebaseToken = await firebaseResult.user.getIdToken();

      // 2. Verify with backend to issue JWT session
      await verifyOtp(phone.replace(/\D/g, ''), enteredOtp, firebaseToken);

      toast.success('Login successful! Welcome to KrishiSahayak.', 'Welcome');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('OTP Verification Error:', err);
      let errMsg = err?.message || 'Invalid verification code. Please check your SMS.';
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

  // ── Popup Google Sign-In with Account Selection Prompt ────────────────────
  const handlePopupGoogleLogin = async () => {
    setSubmitting(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseToken = await result.user.getIdToken();

      await googleAuth({
        idToken: firebaseToken,
        email: result.user.email,
        name: result.user.displayName,
      });

      toast.success(`Welcome, ${result.user.displayName || 'Farmer'}!`, 'Google Sign-In');
      navigate('/dashboard', { replace: true });
    } catch (popupErr) {
      console.warn('Google Popup error:', popupErr);
      if (
        popupErr?.code === 'auth/popup-blocked' ||
        popupErr?.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          toast.error('Google Sign-In redirect failed. Please try again.');
          setSubmitting(false);
        }
      } else if (popupErr?.code === 'auth/popup-closed-by-user') {
        toast.info('Google Sign-In cancelled by user.');
        setSubmitting(false);
      } else if (popupErr?.code === 'auth/unauthorized-domain') {
        toast.error('Please add your domain to Firebase Console -> Authentication -> Authorized Domains.');
        setSubmitting(false);
      } else {
        // Direct backend Google auth fallback if popup is closed or blocked
        try {
          await googleAuth({ provider: 'google' });
          toast.success('Signed in with Google!', 'Welcome');
          navigate('/dashboard', { replace: true });
        } catch (fbErr) {
          toast.error(popupErr?.message || 'Google Sign-In failed.');
        } finally {
          setSubmitting(false);
        }
      }
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
                ? 'Enter your mobile number to receive OTP via SMS'
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
                helperText="We will send a 6-digit verification code via SMS"
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
                helperText={`OTP sent to +91-${phone}`}
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
                  onClick={() => {
                    clearRecaptcha('recaptcha-container');
                    setStep('phone');
                    setOtp('');
                    setOtpError('');
                    setSubmitting(false);
                  }}
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '10px' }}>
            {/* Google Identity Services (GSI) Button Container */}
            <div ref={googleButtonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />

            {/* Custom Google Button Fallback */}
            <button
              type="button"
              onClick={handlePopupGoogleLogin}
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
              Sign in with Google Account
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
