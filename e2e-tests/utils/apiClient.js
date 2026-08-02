/**
 * Opaque-Box HTTP / API Client for KrishiSahayak E2E Testing
 *
 * Supports live HTTP requests against running Express backend
 * or fallback in-memory MockServer dispatch.
 */

const mockServer = require('./mockServer');

class ApiClient {
  constructor() {
    this.baseUrl = process.env.BASE_URL || null;
    this.token = null;
  }

  setBaseUrl(url) {
    this.baseUrl = url;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request(method, path, options = {}) {
    const { body, query, headers = {}, token } = options;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const activeToken = token !== undefined ? token : this.token;
    if (activeToken) {
      reqHeaders['Authorization'] = `Bearer ${activeToken}`;
    }

    // Build URL query string if provided
    let queryString = '';
    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) {
          params.append(k, String(v));
        }
      }
      queryString = '?' + params.toString();
    }

    const fullPath = path + queryString;

    // Live HTTP execution if BASE_URL is set
    if (this.baseUrl) {
      try {
        const url = `${this.baseUrl.replace(/\/$/, '')}${fullPath}`;
        const fetchOptions = {
          method,
          headers: reqHeaders
        };
        if (body && method !== 'GET' && method !== 'HEAD') {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        let resBody = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          resBody = await response.json();
        } else {
          resBody = await response.text();
        }

        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: resBody
        };
      } catch (err) {
        // Fall back or throw if explicit live mode
        if (process.env.STRICT_LIVE_HTTP === 'true') {
          throw new Error(`Live HTTP request to ${this.baseUrl} failed: ${err.message}`);
        }
      }
    }

    // In-memory Mock Dispatch Execution
    return await mockServer.handleRequest(method, path, body || {}, reqHeaders, query || {});
  }

  // Helper methods
  async get(path, options = {}) {
    return this.request('GET', path, options);
  }

  async post(path, body, options = {}) {
    return this.request('POST', path, { ...options, body });
  }

  async put(path, body, options = {}) {
    return this.request('PUT', path, { ...options, body });
  }

  async delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }
}

module.exports = ApiClient;
