import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to automatically attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mechmate_admin_token') || 'mechmate-admin-dev-token';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified response unwrapping & 401 handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - session may have expired.');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
