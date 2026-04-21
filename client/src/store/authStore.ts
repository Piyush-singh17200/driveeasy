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
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
          const res = await authAPI.login({ email, password });
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
          toast.success(`Welcome back, ${user.name}!`);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authAPI.register(data);
          const { token, user } = res.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
          toast.success(`Welcome to DriveEasy, ${user.name}!`);
        } finally {
          set({ isLoading: false });
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
