import { create } from 'zustand';
import api from '../lib/api';

export interface Budget {
  _id: string;
  name: string;
  group: {
    _id: string;
    name: string;
  };
  category: string;
  limit: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notifications: {
    enabled: boolean;
    thresholds: Array<{
      percentage: number;
      notified: boolean;
    }>;
  };
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Calculated fields
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
  status?: 'safe' | 'warning' | 'critical' | 'exceeded';
}

export interface BudgetFormData {
  name: string;
  group: string;
  category: string;
  limit: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  notifications?: {
    enabled: boolean;
    thresholds: Array<{
      percentage: number;
      notified: boolean;
    }>;
  };
  tags?: string[];
  notes?: string;
}

export interface BudgetAnalytics {
  budget: Budget;
  analytics: {
    dailySpending: Record<string, number>;
    topSpenders: Array<{
      name: string;
      amount: number;
    }>;
    transactionCount: number;
    averageTransaction: number;
  };
}

interface BudgetStore {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBudgets: (groupId?: string) => Promise<void>;
  fetchBudget: (id: string) => Promise<Budget>;
  fetchBudgetAnalytics: (id: string) => Promise<BudgetAnalytics>;
  createBudget: (data: BudgetFormData) => Promise<Budget>;
  updateBudget: (id: string, data: Partial<BudgetFormData>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  budgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async (groupId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      
      const response = await api.get(`/budgets?${params.toString()}`);
      // Handle new API response format with data property
      const budgets = response.data?.data || response.data || [];
      set({ budgets, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch budgets',
        isLoading: false 
      });
    }
  },

  fetchBudget: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/budgets/${id}`);
      const budget = response.data?.data || response.data;
      
      set(state => ({
        budgets: state.budgets.map(b => b._id === id ? budget : b),
        isLoading: false
      }));
      
      return budget;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch budget',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchBudgetAnalytics: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/budgets/${id}/analytics`);
      set({ isLoading: false });
      return response.data?.data || response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch budget analytics',
        isLoading: false 
      });
      throw error;
    }
  },

  createBudget: async (data: BudgetFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/budgets', data);
      const newBudget = response.data?.data || response.data;
      
      set(state => ({
        budgets: [newBudget, ...state.budgets],
        isLoading: false
      }));
      
      return newBudget;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create budget',
        isLoading: false 
      });
      throw error;
    }
  },

  updateBudget: async (id: string, data: Partial<BudgetFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/budgets/${id}`, data);
      const updatedBudget = response.data?.data || response.data;
      
      set(state => ({
        budgets: state.budgets.map(b => 
          b._id === id ? updatedBudget : b
        ),
        isLoading: false
      }));
      
      return updatedBudget;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update budget',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteBudget: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/budgets/${id}`);
      
      set(state => ({
        budgets: state.budgets.filter(b => b._id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete budget',
        isLoading: false 
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null })
}));
