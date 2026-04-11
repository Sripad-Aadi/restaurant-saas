import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

let token = null;

export const setAccessToken = (newToken) => {
  token = newToken;
};

// Add token to requests automatically
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// We can add response interceptors to automatically refresh token based on 401s if a refresh flow is implemented

export default api;
