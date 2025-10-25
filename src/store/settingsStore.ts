import { create } from 'zustand';
import api from '../lib/api';

export interface UserSettings {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  notificationSettings: {
    emailNotifications: boolean;
    budgetAlerts: boolean;
    taskReminders: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  appearanceSettings: {
    theme: 'dark' | 'light' | 'auto';
    language: 'en' | 'es' | 'fr' | 'de';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timezone: string;
  };
}

export interface GroupSettings {
  _id: string;
  name: string;
  currency: string;
  taxRate: number;
  description?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  members: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: 'Owner' | 'Editor' | 'Viewer';
    joinedAt: string;
  }>;
}

interface SettingsStore {
  userSettings: UserSettings | null;
  groupSettings: GroupSettings | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUserSettings: () => Promise<void>;
  updateUserProfile: (data: Partial<UserSettings>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
  send2FAVerification: () => Promise<void>;
  verify2FACode: (code: string) => Promise<void>;
  disable2FA: (password: string) => Promise<void>;
  updateNotificationSettings: (settings: Partial<UserSettings['notificationSettings']>) => Promise<void>;
  updateAppearanceSettings: (settings: Partial<UserSettings['appearanceSettings']>) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  fetchGroupSettings: (groupId: string) => Promise<void>;
  updateGroupSettings: (groupId: string, data: Partial<GroupSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  userSettings: null,
  groupSettings: null,
  loading: false,
  error: null,

  fetchUserSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/settings/profile');
      set({ userSettings: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch user settings', loading: false });
    }
  },

  updateUserProfile: async (data: Partial<UserSettings>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/settings/profile', data);
      set({ userSettings: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update profile', loading: false });
      throw err;
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      await api.put('/settings/password', { currentPassword, newPassword });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update password', loading: false });
      throw err;
    }
  },

  sendEmailVerification: async () => {
    set({ loading: true, error: null });
    try {
      await api.post('/settings/email/send-verification');
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to send email verification', loading: false });
      throw err;
    }
  },

  verifyEmailCode: async (code: string) => {
    set({ loading: true, error: null });
    try {
      await api.post('/settings/email/verify', { code });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to verify email code', loading: false });
      throw err;
    }
  },

  send2FAVerification: async () => {
    set({ loading: true, error: null });
    try {
      await api.post('/settings/2fa/send-verification');
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to send verification code', loading: false });
      throw err;
    }
  },

  verify2FACode: async (code: string) => {
    set({ loading: true, error: null });
    try {
      await api.post('/settings/2fa/verify', { code });
      // Refresh user settings to get updated 2FA status
      await get().fetchUserSettings();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to verify code', loading: false });
      throw err;
    }
  },

  disable2FA: async (password: string) => {
    set({ loading: true, error: null });
    try {
      await api.post('/settings/2fa/disable', { password });
      // Refresh user settings to get updated 2FA status
      await get().fetchUserSettings();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to disable 2FA', loading: false });
      throw err;
    }
  },

  updateNotificationSettings: async (settings: Partial<UserSettings['notificationSettings']>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/settings/notifications', settings);
      set((state) => ({
        userSettings: state.userSettings ? {
          ...state.userSettings,
          notificationSettings: response.data
        } : null,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update notification settings', loading: false });
      throw err;
    }
  },

  updateAppearanceSettings: async (settings: Partial<UserSettings['appearanceSettings']>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/settings/appearance', settings);
      set((state) => ({
        userSettings: state.userSettings ? {
          ...state.userSettings,
          appearanceSettings: response.data
        } : null,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update appearance settings', loading: false });
      throw err;
    }
  },

  deleteAccount: async (password: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete('/settings/account', { data: { password } });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to delete account', loading: false });
      throw err;
    }
  },

  fetchGroupSettings: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/settings/group/${groupId}`);
      set({ groupSettings: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch group settings', loading: false });
    }
  },

  updateGroupSettings: async (groupId: string, data: Partial<GroupSettings>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/settings/group/${groupId}`, data);
      set({ groupSettings: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update group settings', loading: false });
      throw err;
    }
  },
}));
