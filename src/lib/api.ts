import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
           // We need a separate instance to avoid infinite loop if refresh fails 
           // but normally we can just call axios directly or use a different instance
           // Here we manually fetch to avoid interceptors
           const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`, {
             refresh: refreshToken
           });
           
           if (response.data.access) {
             localStorage.setItem('access_token', response.data.access);
             // Retry original request with new token
             originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
             return api(originalRequest);
           }
        } catch (refreshError) {
          // Verify if it's really a refresh token validity issue
          console.error("Token refresh failed", refreshError);
          // Optional: clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
