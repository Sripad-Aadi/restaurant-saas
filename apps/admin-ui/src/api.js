import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

let token = localStorage.getItem('rs_token');

export const setAccessToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('rs_token', newToken);
  } else {
    localStorage.removeItem('rs_token');
  }
};

export const getAccessToken = () => token;

// Add token to requests automatically
api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const savedUser = JSON.parse(localStorage.getItem('rs_user') || '{}');
        if (!savedUser.id) throw new Error('No user ID for refresh');

        // Try to refresh
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { userId: savedUser.id },
          { withCredentials: true }
        );

        if (res.data.success) {
          const newToken = res.data.accessToken;
          setAccessToken(newToken);
          
          // Update header and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('rs_token');
        localStorage.removeItem('rs_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
