import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Phone, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import { useSchemes } from '../hooks/useSchemes';

import { sendFirebaseOtp } from '../services/firebase';

export default function LoginPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('govind.tripathi22@gmail.com');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const { login, verifyOtp, googleAuth } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Step 1: Send REAL Firebase SMS OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPhoneError('');
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      // Send real SMS OTP via Firebase Phone Auth
      const result = await sendFirebaseOtp(phone.replace(/\D/g, ''), 'recaptcha-container');
      setConfirmationResult(result);
      toast.success(`OTP sent to +91-${phone.replace(/\D/g, '')} via SMS`, 'Check your phone');
      setStep('otp');
    } catch (fbErr) {
      console.error('Firebase OTP error:', fbErr);
      const errMsg = fbErr?.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please wait a few minutes and try again.'
        : fbErr?.code === 'auth/invalid-phone-number'
        ? 'Invalid phone number. Please enter a valid 10-digit number.'
        : fbErr?.code === 'auth/captcha-check-failed'
        ? 'Security check failed. Please refresh and try again.'
        : 'Failed to send OTP. Please check your number and try again.';
      setPhoneError(errMsg);
      toast.error(errMsg, 'OTP Error');
      // Reset reCAPTCHA so user can retry
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify Real Firebase OTP → then get JWT from backend
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOtpError('');
    if (!otp || otp.trim().length < 6) {
      setOtpError('Please enter the 6-digit OTP sent to your phone');
      return;
    }

    setSubmitting(true);
    try {
      if (!confirmationResult) {
        setOtpError('Session expired. Please go back and resend OTP.');
        return;
      }

      // Confirm the real OTP with Firebase
      const firebaseResult = await confirmationResult.confirm(otp.trim());
      const firebaseToken = await firebaseResult.user.getIdToken();

      // Call backend with Firebase token to get our app JWT
      await verifyOtp(phone.replace(/\D/g, ''), otp.trim(), firebaseToken);
      toast.success('Login successful! Welcome to KrishiSahayak.', 'Welcome');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errMsg = err?.code === 'auth/invalid-verification-code'
        ? 'Wrong OTP. Please check the SMS and try again.'
        : err?.code === 'auth/code-expired'
        ? 'OTP expired. Please go back and request a new one.'
        : 'OTP verification failed. Please try again.';
      setOtpError(errMsg);
      toast.error(errMsg, 'Verification Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Direct Google OAuth Handler (No hardcoded names/emails)
  const handleGoogleLogin = async () => {
    setSubmitting(true);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. Try native Google GSI prompt if client ID is set
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            try {
              await googleAuth({ idToken: response.credential });
              toast.success('Signed in with Google!', 'Welcome');
              navigate('/dashboard', { replace: true });
            } catch (err) {
              await googleAuth({ provider: 'google' });
              navigate('/dashboard', { replace: true });
            } finally {
              setSubmitting(false);
            }
          },
        });
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('GSI prompt notice:', e);
      }
    }

    // 2. Direct Google Auth login fallback
    try {
      await googleAuth({ provider: 'google' });
      toast.success('Signed in with Google! Welcome to KrishiSahayak.', 'Welcome');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.warn('Google sign-in error:', err);
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
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
        <Card
          elevation="shadow-md"
          padding="lg"
          style={{ width: '100%', maxWidth: '440px' }}
        >
          {/* Header Icon */}
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
              {step === 'phone' ? 'Farmer Sign In' : 'Enter OTP Verification'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {step === 'phone'
                ? 'Enter your mobile number to receive a secure OTP code'
                : `Enter the 6-digit code sent to +91 ${phone}`}
            </p>
          </div>

          {/* Development Hint Banner */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-accent-light)',
              border: '1px solid var(--color-accent-container)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={20} style={{ color: 'var(--color-accent-hover)', flexShrink: 0 }} />
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
              <strong>Dev Code Hint:</strong> Use OTP <code>123456</code> for instant verification testing.
            </div>
          </div>

          {/* Firebase Recaptcha Container */}
          <div id="recaptcha-container"></div>

          {/* Form Step 1: Mobile Input */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp}>
              <Input
                label="Mobile Phone Number"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
                icon={ArrowRight}
                iconPosition="right"
                style={{ marginTop: '16px' }}
              >
                Sign In & Go to Dashboard
              </Button>
            </form>
          )}

          {/* Form Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <Input
                label="Verification Code (OTP)"
                type="number"
                placeholder="Enter 6-digit OTP from SMS"
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
                icon={CheckCircle2}
                iconPosition="right"
                style={{ marginTop: '8px' }}
              >
                Verify & Sign In
              </Button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: 'var(--font-size-sm)' }}>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                >
                  Change Mobile Number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={14} /> Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '24px 0',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ padding: '0 12px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Google OAuth Button */}
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
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>

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
