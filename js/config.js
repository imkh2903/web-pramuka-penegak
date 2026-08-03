/**
 * API Configuration
 * Mengatur base URL untuk backend tergantung environment (local vs production)
 * 
 * Gunakan di semua file yang melakukan fetch ke backend:
 * fetch(API_BASE_URL + '/api/members')
 */

// Deteksi environment dari hostname
const hostname = window.location.hostname;
const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';

// Set API_BASE_URL
const API_BASE_URL = isProduction
  ? 'https://gudep-penegak-backend.onrender.com'  // UPDATE INI dengan URL backend production Anda
  : 'http://localhost:3000';

console.log('🔧 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('🌐 API Base URL:', API_BASE_URL);

/**
 * Helper untuk fetch dengan error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = API_BASE_URL + endpoint;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

/**
 * Helper untuk login
 */
async function apiLogin(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

/**
 * Helper untuk fetch dengan JWT token
 */
async function apiFetchWithAuth(endpoint, token, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
}

/**
 * Storage untuk JWT token (localStorage)
 */
const TokenStorage = {
  set(token) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_timestamp', new Date().toISOString());
  },
  
  get() {
    return localStorage.getItem('auth_token');
  },
  
  clear() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_timestamp');
  },
  
  isValid() {
    return !!this.get();
  }
};

// Export untuk digunakan di file lain
window.API_BASE_URL = API_BASE_URL;
window.apiFetch = apiFetch;
window.apiFetchWithAuth = apiFetchWithAuth;
window.apiLogin = apiLogin;
window.TokenStorage = TokenStorage;
