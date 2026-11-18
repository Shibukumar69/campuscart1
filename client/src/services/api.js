import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuscart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config?._retry) {
      // If 401 on an authenticated route other than login, handle logout
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        // Clear local storage if token expired
        localStorage.removeItem('campuscart_token');
        localStorage.removeItem('campuscart_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
