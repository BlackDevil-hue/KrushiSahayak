import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCYYK8P9fwxsEzJvMt3jMw1D36AusjE9lg",
  authDomain: "krishisahayak-e9ebd.firebaseapp.com",
  projectId: "krishisahayak-e9ebd",
  storageBucket: "krishisahayak-e9ebd.firebasestorage.app",
  messagingSenderId: "228574650275",
  appId: "1:228574650275:web:57be050f6e26b43c98c416",
  measurementId: "G-F4TQKLCDCM"
};

// Initialize Firebase app (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

/**
 * Clears existing reCAPTCHA verifier so it can be re-created fresh.
 */
export const clearRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
    window.recaptchaVerifier = null;
  }
};

/**
 * Creates a fresh invisible reCAPTCHA verifier.
 * @param {string} containerId - the DOM element ID for the reCAPTCHA container
 */
const createRecaptchaVerifier = (containerId) => {
  clearRecaptcha();
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      clearRecaptcha();
    },
  });
  return window.recaptchaVerifier;
};

/**
 * Sends a real SMS OTP to the given phone number via Firebase Phone Auth.
 * @param {string} phone - 10-digit Indian phone number (without +91)
 * @param {string} containerId - DOM element ID for invisible reCAPTCHA
 * @returns {Promise<ConfirmationResult>} - use result.confirm(otp) to verify
 */
export const sendFirebaseOtp = async (phone, containerId = 'recaptcha-container') => {
  // Ensure the container element exists in DOM
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('reCAPTCHA container not found in page. Please refresh and try again.');
  }

  // Format to E.164 for India (+91)
  const digits = phone.replace(/\D/g, '');
  const formattedPhone = digits.startsWith('91') && digits.length === 12
    ? `+${digits}`
    : `+91${digits}`;

  const appVerifier = createRecaptchaVerifier(containerId);

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    return confirmationResult;
  } catch (err) {
    // Always clear reCAPTCHA on error so user can retry
    clearRecaptcha();
    throw err;
  }
};

export default app;
