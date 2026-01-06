// src/api/axiosConfig.js
import axios from 'axios';
import { useAuthStore } from '../frontend/src/store/userAuthStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// --- Request Interceptor ---

api.interceptors.request.use(
  (config) => {

    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;