import { create } from 'zustand';
import type { Client, ClientFormData } from '../types';
import api from '../lib/api';

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  fetchClients: (groupId: string) => Promise<void>;
  createClient: (data: ClientFormData) => Promise<Client>;
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/clients?groupId=${groupId}`);
      const clients = response.data?.clients || response.data || [];
      set({ clients, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch clients',
        isLoading: false 
      });
      throw error;
    }
  },

  createClient: async (data: ClientFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/clients', data);
      const newClient = response.data?.client || response.data;
      
      set((state) => ({
        clients: [newClient, ...state.clients],
        isLoading: false,
      }));
      
      return newClient;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create client',
        isLoading: false 
      });
      throw error;
    }
  },

  updateClient: async (id: string, data: Partial<ClientFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/clients/${id}`, data);
      const updatedClient = response.data?.client || response.data;
      
      set((state) => ({
        clients: state.clients.map(client => 
          client._id === id ? updatedClient : client
        ),
        isLoading: false,
      }));
      
      return updatedClient;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update client',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/clients/${id}`);
      
      set((state) => ({
        clients: state.clients.filter(client => client._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete client',
        isLoading: false 
      });
      throw error;
    }
  },
}));
