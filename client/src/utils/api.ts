import axios from 'axios';
import toast from 'react-hot-toast';

import { getFallbackCarsResponse, getFallbackCarById, FALLBACK_CARS } from './fallbackCars';

const defaultBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseUrl,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isCarListing = error.config?.url?.includes('/cars');
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status !== 404 && !isCarListing) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: any) => api.put(`/auth/reset-password/${token}`, data),
};

// ─── Cars API ──────────────────────────────────────────────────────────────────
export const carsAPI = {
  getCars: async (params?: any) => {
    try {
      const res = await api.get('/cars', { params });
      if (res.data?.success && Array.isArray(res.data.cars) && res.data.cars.length > 0) {
        return res;
      }
      return { data: getFallbackCarsResponse(params) };
    } catch {
      return { data: getFallbackCarsResponse(params) };
    }
  },
  getCar: async (id: string) => {
    try {
      const res = await api.get(`/cars/${id}`);
      if (res.data?.success && res.data.car) {
        return res;
      }
      const car = getFallbackCarById(id);
      return { data: { success: true, car } };
    } catch {
      const car = getFallbackCarById(id);
      return { data: { success: true, car } };
    }
  },
  createCar: (data: FormData) => api.post('/cars', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCar: (id: string, data: FormData | any) => api.put(`/cars/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  deleteCar: (id: string) => api.delete(`/cars/${id}`),
  getOwnerCars: async () => {
    try {
      return await api.get('/cars/owner');
    } catch {
      return { data: { success: true, cars: FALLBACK_CARS.slice(0, 4) } };
    }
  },
  checkAvailability: async (params: any) => {
    try {
      return await api.get('/cars/availability', { params });
    } catch {
      return { data: { success: true, available: true } };
    }
  },
};

// ─── Bookings API ──────────────────────────────────────────────────────────────
export const bookingsAPI = {
  createBooking: (data: any) => api.post('/bookings', data),
  getBookings: (params?: any) => api.get('/bookings', { params }),
  getBooking: (id: string) => api.get(`/bookings/${id}`),
  cancelBooking: (id: string, reason?: string) => api.put(`/bookings/${id}/cancel`, { reason }),
  getOwnerBookings: (params?: any) => api.get('/bookings/owner', { params }),
  updateBookingStatus: (id: string, status: string) => api.put(`/bookings/${id}/status`, { status }),
  addReview: (id: string, data: any) => api.post(`/bookings/${id}/review`, data),
  getBookingMessages: (id: string) => api.get(`/bookings/${id}/messages`),
  recordHandover: (id: string, type: 'check-in' | 'check-out', data: any) => api.post(`/bookings/${id}/${type}`, data),
};

// ─── Payments API ──────────────────────────────────────────────────────────────
export const paymentsAPI = {
  createPaymentIntent: (bookingId: string) => api.post('/payments/create-intent', { bookingId }),
  confirmPayment: (data: any) => api.post('/payments/confirm', data),
  confirmUpi: (data: any) => api.post('/payments/confirm-upi', data),
  getHistory: () => api.get('/payments/history'),
};

// ─── Admin API ──────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  getCars: (params?: any) => api.get('/admin/cars', { params }),
  approveCar: (id: string, approved: boolean) => api.put(`/admin/cars/${id}/approve`, { approved }),
  getBookings: (params?: any) => api.get('/admin/bookings', { params }),
  verifyManualPayment: (bookingId: string, approved: boolean, notes?: string) =>
    api.put(`/admin/payments/${bookingId}/verify`, { approved, notes }),
};

// ─── AI API ───────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (data: any) => api.post('/ai/chat', data),
  getRecommendations: (data: any) => api.post('/ai/recommendations', data),
};
