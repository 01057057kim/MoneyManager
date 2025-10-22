import { create } from 'zustand';
import api from '../lib/api';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
  groupId: string;
}

interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  type?: 'income' | 'expense';
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: 'completed' | 'pending';
}

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filter: TransactionFilter;
  sortField: keyof Transaction;
  sortDirection: 'asc' | 'desc';
  
  // Actions
  fetchTransactions: (groupId: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilter: (filter: TransactionFilter) => void;
  setSorting: (field: keyof Transaction, direction: 'asc' | 'desc') => void;
  getFilteredTransactions: () => Transaction[];
  getStats: () => { totalIncome: number; totalExpenses: number; netAmount: number };
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  filter: {},
  sortField: 'date',
  sortDirection: 'desc',

  fetchTransactions: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/transactions/${groupId}`);
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      set({ 
        transactions: response.data.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })),
        isLoading: false 
      });
    } catch (error) {
      console.error('Fetch transactions error:', error);
      set({ error: 'Failed to fetch transactions', isLoading: false });
      throw error; // Re-throw to let components handle it
    }
  },

  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/transactions', transaction);
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response format from server');
      }
      set(state => ({
        transactions: [...state.transactions, {
          ...response.data,
          date: new Date(response.data.date)
        }],
        isLoading: false
      }));
      return response.data; // Return for success handling
    } catch (error) {
      console.error('Add transaction error:', error);
      set({ error: 'Failed to add transaction', isLoading: false });
      throw error; // Re-throw to let components handle it
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/transactions/${id}`, transaction);
      set(state => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { 
            ...t, 
            ...response.data,
            id: response.data._id, // Map MongoDB _id to id
            date: new Date(response.data.date) 
          } : t
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Update transaction error:', error);
      set({ error: 'Failed to update transaction', isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/transactions/${id}`);
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Delete transaction error:', error);
      set({ error: 'Failed to delete transaction', isLoading: false });
    }
  },

  setFilter: (filter) => {
    set({ filter });
  },

  setSorting: (field, direction) => {
    set({ sortField: field, sortDirection: direction });
  },

  getFilteredTransactions: () => {
    const { transactions, filter, sortField, sortDirection } = get();
    
    let filtered = [...transactions];

    // Apply filters
    if (filter.startDate) {
      filtered = filtered.filter(t => t.date >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(t => t.date <= filter.endDate!);
    }
    if (filter.type) {
      filtered = filtered.filter(t => t.type === filter.type);
    }
    if (filter.category) {
      filtered = filtered.filter(t => t.category === filter.category);
    }
    if (filter.minAmount) {
      filtered = filtered.filter(t => t.amount >= filter.minAmount!);
    }
    if (filter.maxAmount) {
      filtered = filtered.filter(t => t.amount <= filter.maxAmount!);
    }
    if (filter.status) {
      filtered = filtered.filter(t => t.status === filter.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  },

  getStats: () => {
    const transactions = get().getFilteredTransactions();
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netAmount: income - expenses
    };
  }
}));