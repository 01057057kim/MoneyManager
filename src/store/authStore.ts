import { create } from 'zustand';
import type { User, AuthResponse } from '../types';
import api from '../lib/api';
import { setAuthData, clearAuthData, getAuthData } from '../lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      const { token, user } = response.data;
      setAuthData(token, user);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
      });
      
      const { token, user } = response.data;
      setAuthData(token, user);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    clearAuthData();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const { token, user } = getAuthData();
    if (token && user) {
      set({ user, isAuthenticated: true });
    }
  },
}));
