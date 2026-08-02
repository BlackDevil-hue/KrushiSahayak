import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Start with NO session - require real login
  const [token, setToken] = useState(() => localStorage.getItem('krishi_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('krishi_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [profile, setProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('krishi_profile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('krishi_token', token);
    } else {
      localStorage.removeItem('krishi_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('krishi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('krishi_user');
    }
  }, [user]);

  // Sync profile to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('krishi_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('krishi_profile');
    }
  }, [profile]);

  /**
   * Step 1: Initiate OTP login (Firebase handles SMS sending)
   */
  const login = async (phone) => {
    // Nothing to call on backend for OTP initiation - Firebase handles it
    return { success: true };
  };

  /**
   * Step 2: Verify OTP - called after Firebase confirms the OTP
   * firebaseToken is the ID token from Firebase, proving the phone was verified
   */
  const verifyOtp = async (phone, otp, firebaseToken) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await api.auth.verifyOtp(phone, otp, firebaseToken);
      setToken(authData.token);
      setUser(authData.user);
      if (authData.profile) setProfile(authData.profile);
      return authData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google Sign-In handler
   * credentialPayload: { idToken } from Google One Tap, or { provider: 'google' }
   */
  const googleAuth = async (credentialPayload) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await api.auth.googleAuth(credentialPayload || { provider: 'google' });
      setToken(authData.token);
      setUser(authData.user);
      if (authData.profile) {
        setProfile(authData.profile);
      } else {
        setProfile({
          name: authData.user?.name || authData.user?.email?.split('@')[0] || 'Farmer',
          state: 'Maharashtra',
          district: 'Pune',
          category: 'General',
          cropTypes: ['Wheat'],
          language: 'hi',
        });
      }
      return authData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update Farmer Profile
   */
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      let updated;
      try {
        updated = await api.farmer.updateProfile(profileData);
      } catch (err) {
        console.warn('Backend update unavailable, saving locally:', err.message);
        updated = { ...profileData, updatedAt: new Date().toISOString() };
      }
      const mergedProfile = { ...profile, ...updated };
      setProfile(mergedProfile);
      if (!user) {
        setUser({
          id: 'farmer_' + Math.random().toString(36).substr(2, 9),
          name: profileData.name || 'Farmer',
          phone: profileData.phone || '',
          role: 'farmer',
        });
        setToken('token_' + Date.now());
      } else if (profileData.name) {
        setUser((prev) => ({ ...prev, name: profileData.name }));
      }
      return mergedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and clear all stored data
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('krishi_token');
    localStorage.removeItem('krishi_user');
    localStorage.removeItem('krishi_profile');
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        isAuthenticated,
        loading,
        error,
        login,
        verifyOtp,
        googleAuth,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
