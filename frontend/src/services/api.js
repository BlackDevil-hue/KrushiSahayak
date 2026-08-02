// ─── Base URL Resolution ──────────────────────────────────────────────────────
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Capacitor / Android WebView → 10.0.2.2 routes to PC localhost in emulator
  if (
    typeof window !== 'undefined' &&
    (window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:')
  ) {
    return 'http://10.0.2.2:5000/api';
  }
  // Browser dev server
  return '/api';
};

const BASE_URL = getBaseUrl();

// ─── Error Class ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
export async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('krishi_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    mode: 'cors',
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.includes('<html')) {
        throw new ApiError('Backend server not reachable', response.status, null);
      }
      data = { message: text };
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || data?.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'Network error. Please check your internet connection.',
      0,
      null
    );
  }
}

// ─── Domain API Endpoints ─────────────────────────────────────────────────────
export const api = {
  auth: {
    sendOtp: (phone) => fetchAPI('/auth/send-otp', { method: 'POST', body: { phone } }),
    verifyOtp: (phone, code, firebaseToken) =>
      fetchAPI('/auth/verify-otp', { method: 'POST', body: { phone, code, firebaseToken } }),
    googleAuth: (payload) =>
      fetchAPI('/auth/google', { method: 'POST', body: payload }),
    getProfile: () => fetchAPI('/auth/me'),
    updateProfile: (profileData) => fetchAPI('/auth/profile', { method: 'PUT', body: profileData }),
  },
  farmer: {
    getProfile: () => fetchAPI('/farmer/profile'),
    updateProfile: (data) => fetchAPI('/farmer/profile', { method: 'POST', body: data }),
  },
  schemes: {
    getAll: (params) => {
      const query = new URLSearchParams(params || {}).toString();
      return fetchAPI(`/schemes${query ? `?${query}` : ''}`);
    },
    getById: (id) => fetchAPI(`/schemes/${id}`),
  },
  chat: {
    send: (message, language) =>
      fetchAPI('/chat', { method: 'POST', body: { message, language } }),
  },
};

export default api;
