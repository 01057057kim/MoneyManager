import { create } from 'zustand';
import api from '../lib/api';

export interface RecurringTransaction {
  _id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  group: {
    _id: string;
    name: string;
  };
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  payer: {
    _id: string;
    name: string;
    email: string;
  };
  participants: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    share: number;
  }>;
  notes?: string;
  isActive: boolean;
  client?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  nextOccurrence?: string;
}

export interface RecurringTransactionFormData {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  group: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  payer?: string;
  participants?: Array<{
    user: string;
    share: number;
  }>;
  notes?: string;
  client?: string;
}

interface RecurringStore {
  recurringTransactions: RecurringTransaction[];
  dueTransactions: RecurringTransaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRecurringTransactions: (groupId?: string) => Promise<void>;
  fetchDueTransactions: (groupId?: string) => Promise<void>;
  createRecurringTransaction: (data: RecurringTransactionFormData) => Promise<RecurringTransaction>;
  updateRecurringTransaction: (id: string, data: Partial<RecurringTransactionFormData>) => Promise<RecurringTransaction>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  executeRecurringTransaction: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useRecurringStore = create<RecurringStore>((set, get) => ({
  recurringTransactions: [],
  dueTransactions: [],
  isLoading: false,
  error: null,

  fetchRecurringTransactions: async (groupId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      
      const response = await api.get(`/recurring?${params.toString()}`);
      set({ recurringTransactions: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch recurring transactions',
        isLoading: false 
      });
    }
  },

  fetchDueTransactions: async (groupId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      
      const response = await api.get(`/recurring/due?${params.toString()}`);
      set({ dueTransactions: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch due transactions',
        isLoading: false 
      });
    }
  },

  createRecurringTransaction: async (data: RecurringTransactionFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/recurring', data);
      const newTransaction = response.data;
      
      set(state => ({
        recurringTransactions: [newTransaction, ...state.recurringTransactions],
        isLoading: false
      }));
      
      return newTransaction;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create recurring transaction',
        isLoading: false 
      });
      throw error;
    }
  },

  updateRecurringTransaction: async (id: string, data: Partial<RecurringTransactionFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/recurring/${id}`, data);
      const updatedTransaction = response.data;
      
      set(state => ({
        recurringTransactions: state.recurringTransactions.map(rt => 
          rt._id === id ? updatedTransaction : rt
        ),
        isLoading: false
      }));
      
      return updatedTransaction;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update recurring transaction',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteRecurringTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/recurring/${id}`);
      
      set(state => ({
        recurringTransactions: state.recurringTransactions.filter(rt => rt._id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete recurring transaction',
        isLoading: false 
      });
      throw error;
    }
  },

  executeRecurringTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/recurring/${id}/execute`);
      
      // Refresh the recurring transactions to update lastProcessed
      const { fetchRecurringTransactions } = get();
      await fetchRecurringTransactions();
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to execute recurring transaction',
        isLoading: false 
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null })
}));
