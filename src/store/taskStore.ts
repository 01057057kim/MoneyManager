import { create } from 'zustand';
import api from '../lib/api';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  group: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  assignee?: {
    _id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category?: string;
  linkedRecords?: {
    transaction?: string;
    recurringTransaction?: string;
    client?: string;
  };
  reminders: Array<{
    date: string;
    sent: boolean;
  }>;
  checklist: Array<{
    _id: string;
    item: string;
    completed: boolean;
    completedAt?: string;
    completedBy?: string;
  }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    content: string;
    createdAt: string;
  }>;
  tags: string[];
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  isOverdue: boolean;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: (groupId?: string, filters?: TaskFilters) => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<boolean>;
  addComment: (taskId: string, content: string) => Promise<boolean>;
  updateChecklistItem: (taskId: string, itemId: string, completed: boolean) => Promise<boolean>;
  
  // Getters
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getOverdueTasks: () => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getTasksByCreator: (creatorId: string) => Task[];
  
  // Clear state
  clearTasks: () => void;
  setError: (error: string | null) => void;
}

interface TaskFilters {
  status?: Task['status'];
  assignee?: string;
  priority?: Task['priority'];
  dueDate?: {
    start?: string;
    end?: string;
  };
}

interface CreateTaskData {
  title: string;
  description?: string;
  group: string;
  assignee?: string;
  dueDate?: string;
  priority?: Task['priority'];
  linkedRecords?: {
    transaction?: string;
    recurringTransaction?: string;
    client?: string;
  };
  tags?: string[];
  checklist?: Array<{
    item: string;
  }>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (groupId, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (groupId) params.append('groupId', groupId);
      if (filters.status) params.append('status', filters.status);
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await api.get(`/tasks?${params.toString()}`);
      set({ tasks: response.data, loading: false });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to fetch tasks',
        loading: false 
      });
    }
  },

  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/tasks', taskData);
      const newTask = response.data;
      
      set(state => ({
        tasks: [newTask, ...state.tasks],
        loading: false
      }));
      
      return newTask;
    } catch (error: any) {
      console.error('Error creating task:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to create task',
        loading: false 
      });
      return null;
    }
  },

  updateTask: async (taskId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      const updatedTask = response.data;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ),
        loading: false
      }));
      
      return updatedTask;
    } catch (error: any) {
      console.error('Error updating task:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to update task',
        loading: false 
      });
      return null;
    }
  },

  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/tasks/${taskId}`);
      
      set(state => ({
        tasks: state.tasks.filter(task => task._id !== taskId),
        loading: false
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to delete task',
        loading: false 
      });
      return false;
    }
  },

  updateTaskStatus: async (taskId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status });
      const updatedTask = response.data;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ),
        loading: false
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error updating task status:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to update task status',
        loading: false 
      });
      return false;
    }
  },

  addComment: async (taskId, content) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { content });
      const updatedTask = response.data;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ),
        loading: false
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to add comment',
        loading: false 
      });
      return false;
    }
  },

  updateChecklistItem: async (taskId, itemId, completed) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/tasks/${taskId}/checklist/${itemId}`, { completed });
      const updatedTask = response.data;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ),
        loading: false
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error updating checklist item:', error);
      set({ 
        error: error.response?.data?.error || 'Failed to update checklist item',
        loading: false 
      });
      return false;
    }
  },

  // Getters
  getTasksByStatus: (status) => {
    return get().tasks.filter(task => task.status === status);
  },

  getTasksByPriority: (priority) => {
    return get().tasks.filter(task => task.priority === priority);
  },

  getOverdueTasks: () => {
    return get().tasks.filter(task => task.isOverdue);
  },

  getTasksByAssignee: (assigneeId) => {
    return get().tasks.filter(task => task.assignee?._id === assigneeId);
  },

  getTasksByCreator: (creatorId) => {
    return get().tasks.filter(task => task.creator._id === creatorId);
  },

  clearTasks: () => {
    set({ tasks: [], loading: false, error: null });
  },

  setError: (error) => {
    set({ error });
  }
}));
