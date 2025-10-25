import { create } from 'zustand';
import type { User, AuthResponse } from '../types';
import api from '../lib/api';
import { setAuthData, clearAuthData, getAuthData, isAuthenticated, updateLastActivity } from '../lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
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

  checkAuth: async () => {
    console.log('AuthStore - checkAuth called');
    set({ isLoading: true });
    try {
      const authResult = isAuthenticated();
      console.log('AuthStore - isAuthenticated result:', authResult);
      
      if (authResult) {
        const { user } = getAuthData();
        console.log('AuthStore - user data:', user);
        if (user) {
          set({ user, isAuthenticated: true, isLoading: false });
          console.log('AuthStore - user authenticated successfully');
          // Update last activity when checking auth
          updateLastActivity();
        } else {
          console.log('AuthStore - no user data found');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        console.log('AuthStore - not authenticated');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('AuthStore - auth check error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
