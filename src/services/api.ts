import axios from 'axios';

// API proxied via Vercel rewrites → /api/* → https://180-93-35-55.sslip.io/api/*
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
    }
    if (!error.response) {
      error.message = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  customerRegister: (data: { name: string; phone: string; password: string }) =>
    api.post('/auth/customer/register', data),
  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const driversAPI = {
  getDrivers: (params?: { region?: string; keyword?: string; from?: string; to?: string }) =>
    api.get('/drivers', { params }),
  searchDrivers: (params: { from?: string; to?: string; q?: string }) =>
    api.get('/drivers/search', { params })
};

export const requestsAPI = {
  createRequest: (data: {
    driverPostId?: number;
    name: string;
    phone: string;
    startPoint: string;
    endPoint: string;
    price: number;
    note?: string;
    region?: string;
  }) => api.post('/requests', data),
  getMyRequests: () => api.get('/requests/my-requests'),
  getLatest: (limit = 6, region?: string, province?: string) =>
    api.get('/requests', { params: { status: 'waiting', limit, ...(region ? { region } : {}), ...(province ? { province } : {}) } }),
  searchByKeyword: (keyword: string, region?: string) =>
    api.get('/requests', { params: { status: 'waiting', limit: 20, keyword, ...(region ? { region } : {}) } })
};

export default api;
