import { create } from 'zustand';
import api from '../lib/api';

export interface Category {
  name: string;
  totalSpent: number;
  transactionCount: number;
  lastTransaction: string;
  budget?: {
    limit: number;
    period: string;
    remaining: number;
    percentageUsed: number;
  };
}

export interface CategoryAnalytics {
  category: string;
  period: string;
  analytics: {
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
    dailySpending: Record<string, number>;
    topSpenders: Array<{
      name: string;
      amount: number;
    }>;
    budget?: {
      limit: number;
      period: string;
      remaining: number;
      percentageUsed: number;
      status: 'safe' | 'warning' | 'critical' | 'exceeded';
    };
  };
  transactions: Array<{
    _id: string;
    description: string;
    amount: number;
    date: string;
    payer: {
      name: string;
    };
  }>;
}

export interface CategoryFormData {
  name: string;
  groupId: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: (groupId?: string) => Promise<void>;
  fetchCategoryAnalytics: (name: string, groupId?: string, period?: string) => Promise<CategoryAnalytics>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (oldName: string, newName: string, groupId: string) => Promise<void>;
  deleteCategory: (name: string, groupId: string, newCategory: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (groupId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      
      const response = await api.get(`/categories?${params.toString()}`);
      // Handle new API response format with data property
      const categories = response.data?.data || response.data || [];
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch categories',
        isLoading: false 
      });
    }
  },

  fetchCategoryAnalytics: async (name: string, groupId?: string, period: string = 'monthly') => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      params.append('period', period);
      
      const response = await api.get(`/categories/${encodeURIComponent(name)}/analytics?${params.toString()}`);
      set({ isLoading: false });
      return response.data?.data || response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch category analytics',
        isLoading: false 
      });
      throw error;
    }
  },

  createCategory: async (data: CategoryFormData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/categories', data);
      // Refresh categories after creating a new one
      const params = new URLSearchParams();
      if (data.groupId) params.append('groupId', data.groupId);
      
      const response = await api.get(`/categories?${params.toString()}`);
      const categories = response.data?.data || response.data || [];
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create category',
        isLoading: false 
      });
      throw error;
    }
  },

  updateCategory: async (oldName: string, newName: string, groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/categories/${encodeURIComponent(oldName)}`, {
        newName,
        groupId
      });
      
      // Update local state
      set(state => ({
        categories: state.categories.map(cat => 
          cat.name === oldName ? { ...cat, name: newName } : cat
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update category',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteCategory: async (name: string, groupId: string, newCategory: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/categories/${encodeURIComponent(name)}`, {
        data: { groupId, newCategory }
      });
      
      // Update local state
      set(state => ({
        categories: state.categories.filter(cat => cat.name !== name),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete category',
        isLoading: false 
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null })
}));
