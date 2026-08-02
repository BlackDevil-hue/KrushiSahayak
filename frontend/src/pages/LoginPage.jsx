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

export default function LoginPage() {
  const { schemes: SCHEMES_DATA, loading: schemesLoading } = useSchemes();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
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

  // Step 1: Send OTP / Instant Demo Login
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPhoneError('');
    if (!phone || phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      await login(phone);
      // Auto-verify with 123456 for instant seamless demo login
      await verifyOtp(phone, '123456');
      toast.success('Login Successful! Welcome to KrishiSahayak.', 'Welcome');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to login', 'Authentication Error');
      setPhoneError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp || otp.length < 4) {
      setOtpError('Please enter the verification code');
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifyOtp(phone, otp);
      toast.success('Successfully logged in!', 'Welcome Back');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setOtpError(err.message || 'Invalid verification code');
      toast.error(err.message || 'Verification failed', 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleLogin = () => {
    // If Google Identity Services SDK is present & client ID is set, attempt Google GSI popup
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            setSubmitting(true);
            try {
              await googleAuth({ idToken: response.credential });
              toast.success('Signed in with Google!', 'Welcome');
              navigate('/dashboard', { replace: true });
            } catch (err) {
              toast.error('Google sign in failed');
            } finally {
              setSubmitting(false);
            }
          },
        });
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('GSI prompt error, opening account chooser modal:', e);
      }
    }

    // Open Google Account Chooser modal
    setGoogleModalOpen(true);
  };

  const handleConfirmGoogleAccount = async () => {
    setSubmitting(true);
    setGoogleModalOpen(false);
    try {
      const email = selectedAccount === 'custom' ? customEmail || 'farmer@gmail.com' : selectedAccount;
      const name = selectedAccount === 'custom' 
        ? customName || 'Google Farmer' 
        : (selectedAccount.startsWith('govind') ? 'Govind Tripathi' : 'Krishi Farmer');

      await googleAuth({ email, name, provider: 'google' });
      toast.success(`Signed in as ${email}!`, 'Google Sign-In Success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
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
                type="text"
                placeholder="Enter 6-digit OTP (123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                icon={KeyRound}
                error={otpError}
                helperText="Tip: Enter 123456"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={submitting}
                icon={CheckCircle2}
                iconPosition="right"
                style={{ marginTop: '16px' }}
              >
                Verify & Continue
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

      {/* Google Account Selector Modal */}
      <Modal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        title="Choose a Google Account"
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setGoogleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              icon={UserCheck}
              onClick={handleConfirmGoogleAccount}
            >
              Continue with Google Account
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Select an account to continue to <strong>KrishiSahayak Smart Agriculture Portal</strong>:
          </p>

          {/* Account Option 1 */}
          <div
            onClick={() => setSelectedAccount('govind.tripathi22@gmail.com')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: selectedAccount === 'govind.tripathi22@gmail.com' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedAccount === 'govind.tripathi22@gmail.com' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#4285F4',
                color: '#FFF',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              G
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>Govind Tripathi</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>govind.tripathi22@gmail.com</div>
            </div>
            {selectedAccount === 'govind.tripathi22@gmail.com' && <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />}
          </div>

          {/* Account Option 2 */}
          <div
            onClick={() => setSelectedAccount('farmer.krishi@gmail.com')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: selectedAccount === 'farmer.krishi@gmail.com' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedAccount === 'farmer.krishi@gmail.com' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#34A853',
                color: '#FFF',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              K
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>KrishiSahayak Farmer</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>farmer.krishi@gmail.com</div>
            </div>
            {selectedAccount === 'farmer.krishi@gmail.com' && <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />}
          </div>

          {/* Custom Account Option */}
          <div
            onClick={() => setSelectedAccount('custom')}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: selectedAccount === 'custom' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedAccount === 'custom' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Use Another Google Email
            </div>
            {selectedAccount === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <Input
                  label="Google Account Email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                />
                <Input
                  label="Your Name"
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
