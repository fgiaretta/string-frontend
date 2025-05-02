import axios from 'axios';
import authService from './authService';

// Get API URL from localStorage or use the default from environment variables
const getApiUrl = (): string => {
  const storedEnv = localStorage.getItem('apiEnvironment');
  if (storedEnv === 'production') {
    return 'https://api.string.tec.br';
  } else if (storedEnv === 'development') {
    return 'https://api-dev.string.tec.br';
  }
  // Default to environment variable if no stored preference
  return import.meta.env.VITE_API_URL;
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // If we're not on the login page, log the user out
      if (window.location.pathname !== '/login') {
        authService.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
