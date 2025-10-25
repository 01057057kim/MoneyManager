import { create } from 'zustand';
import api from '../lib/api';

export interface FinancialGoal {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  group: string;
  createdBy: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

interface FinancialGoalStore {
  goals: FinancialGoal[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchGoals: (groupId: string) => Promise<void>;
  createGoal: (goal: Omit<FinancialGoal, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateProgress: (goalId: string, amount: number) => Promise<void>;
}

export const useFinancialGoalStore = create<FinancialGoalStore>((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/financial-goals?groupId=${groupId}`);
      set({ goals: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch goals', loading: false });
    }
  },

  createGoal: async (goal) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/financial-goals', goal);
      set(state => ({ 
        goals: [...state.goals, response.data], 
        loading: false 
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to create goal', loading: false });
      throw err;
    }
  },

  updateGoal: async (goalId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/financial-goals/${goalId}`, updates);
      set(state => ({
        goals: state.goals.map(goal => 
          goal._id === goalId ? { ...goal, ...response.data } : goal
        ),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update goal', loading: false });
      throw err;
    }
  },

  deleteGoal: async (goalId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/financial-goals/${goalId}`);
      set(state => ({
        goals: state.goals.filter(goal => goal._id !== goalId),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to delete goal', loading: false });
      throw err;
    }
  },

  updateProgress: async (goalId, amount) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/financial-goals/${goalId}/progress`, { amount });
      set(state => ({
        goals: state.goals.map(goal => 
          goal._id === goalId ? { ...goal, currentAmount: amount } : goal
        ),
        loading: false
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update progress', loading: false });
      throw err;
    }
  }
}));
