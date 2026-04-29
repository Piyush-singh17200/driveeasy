import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requiresOTP: boolean; email?: string; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ requiresOTP: boolean; email?: string; message?: string }>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          if (data.requiresOTP) {
            set({ isLoading: false });
            return { requiresOTP: true, email: data.email, developmentOtp: data.developmentOtp };
          }
          const { token, user } = data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${user.name}!`);
          return { requiresOTP: false };
        } catch (error: any) {
          set({ isLoading: false });
          toast.error(error.response?.data?.error || 'Login failed');
          throw error;
        }
      },

      verifyOTP: async (email, otp) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.verifyOTP({ email, otp });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
          toast.success(`Welcome back, ${user.name}!`);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          if (data.requiresOTP) {
            set({ isLoading: false });
            return { requiresOTP: true, email: data.email, developmentOtp: data.developmentOtp };
          }
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { requiresOTP: false };
        } catch (error: any) {
          set({ error: error.response?.data?.error || 'Registration failed', isLoading: false });
          toast.error(error.response?.data?.error || 'Registration failed');
          throw error;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch {}
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      getMe: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await authAPI.getMe();
          set({ user: res.data.user, isAuthenticated: true });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateProfile: async (data) => {
        const res = await authAPI.updateProfile(data);
        set({ user: res.data.user });
        toast.success('Profile updated successfully');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
