import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status !== 404) {
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
  getCars: (params?: any) => api.get('/cars', { params }),
  getCar: (id: string) => api.get(`/cars/${id}`),
  createCar: (data: FormData) => api.post('/cars', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCar: (id: string, data: FormData | any) => api.put(`/cars/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),
  deleteCar: (id: string) => api.delete(`/cars/${id}`),
  getOwnerCars: () => api.get('/cars/owner'),
  checkAvailability: (params: any) => api.get('/cars/availability', { params }),
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
};

// ─── AI API ───────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (data: any) => api.post('/ai/chat', data),
  getRecommendations: (data: any) => api.post('/ai/recommendations', data),
};
