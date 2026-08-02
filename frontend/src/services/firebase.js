import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCYYK8P9fwxsEzJvMt3jMw1D36AusjE9lg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "krishisahayak-e9ebd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "krishisahayak-e9ebd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "krishisahayak-e9ebd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "228574650275",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:228574650275:web:57be050f6e26b43c98c416",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-F4TQKLCDCM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Setup Recaptcha Verifier for Phone Auth
 * @param {string} containerId Element ID (e.g., 'recaptcha-container')
 */
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // Reset reCAPTCHA
        window.recaptchaVerifier?.clear();
        window.recaptchaVerifier = null;
      }
    });
  }
  return window.recaptchaVerifier;
};

/**
 * Send Phone OTP via Firebase
 * @param {string} phoneNumber E.164 formatted phone (e.g., +919876543210)
 * @param {string} containerId Element ID for reCAPTCHA
 */
export const sendFirebaseOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
  const appVerifier = setupRecaptcha(containerId);
  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
};

export default app;
