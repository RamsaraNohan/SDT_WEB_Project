import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.hostname === 'localhost' ? 'http://localhost:5259/api' : 'https://blindmatch-ekf5hng6echxdbar.southeastasia-01.azurewebsites.net/api';
    }
    return 'http://localhost:5259/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { token, refreshToken, setAuth } = useAuthStore.getState();
        
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          token,
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        
        // Update store (user stays the same)
        const user = useAuthStore.getState().user;
        if (user) {
            setAuth(newToken, newRefreshToken, user);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
