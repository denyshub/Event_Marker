import axios from 'axios';
import { API_IP } from './API_IP';
const getTokens = () => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken')
});

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(`http://${API_IP}/api/token/refresh/`, {
      refresh: refreshToken
    });
    return { access: response.data.access };
  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    return null;
  }
};

const axiosInstance = axios.create({
  baseURL: `http://${API_IP}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error.config, error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed error information
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
      url: error.config?.url
    });

    const originalRequest = error.config;
    const { refreshToken } = getTokens();

    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = await refreshAccessToken(refreshToken);
        if (tokens?.access) {
          localStorage.setItem('accessToken', tokens.access);
          originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        console.error('Token refresh failed:', err.response?.data || err.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // For 400 errors, include response data in error
    if (error.response?.status === 400) {
      const enhancedError = new Error('Bad Request');
      enhancedError.response = error.response;
      enhancedError.data = error.response.data;
      return Promise.reject(enhancedError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;