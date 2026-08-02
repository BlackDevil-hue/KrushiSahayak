const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Capacitor Android runtime uses capacitor://localhost or file://
  if (typeof window !== 'undefined' && (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:')) {
    return 'http://10.0.2.2:5000/api';
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Centralized Fetch API Wrapper with JWT injection and error handling.
 */
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
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.includes('<head>')) {
        throw new ApiError('Backend server API endpoint not reachable', response.status, null);
      }
      data = { message: text };
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || data?.error || `HTTP error! Status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Network error occurred. Please check your internet connection.',
      0,
      null
    );
  }
}

/* Domain Specific API Endpoints */
export const api = {
  auth: {
    sendOtp: (phone) => fetchAPI('/auth/send-otp', { method: 'POST', body: { phone } }),
    verifyOtp: (phone, otp) => fetchAPI('/auth/verify-otp', { method: 'POST', body: { phone, otp } }),
    googleAuth: (credential) => fetchAPI('/auth/google', { method: 'POST', body: { credential } }),
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
};

export default api;
