import { create } from 'zustand';
import type { Invoice, InvoiceFormData } from '../types';
import api from '../lib/api';

interface InvoiceState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  fetchInvoices: (groupId: string) => Promise<void>;
  createInvoice: (data: InvoiceFormData) => Promise<Invoice>;
  updateInvoice: (id: string, data: Partial<InvoiceFormData>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  markAsPaid: (id: string, paidDate: string) => Promise<Invoice>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  isLoading: false,
  error: null,

  fetchInvoices: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/invoices?groupId=${groupId}`);
      const invoices = response.data?.invoices || response.data || [];
      set({ invoices, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch invoices',
        isLoading: false 
      });
      throw error;
    }
  },

  createInvoice: async (data: InvoiceFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/invoices', data);
      const newInvoice = response.data?.invoice || response.data;
      
      set((state) => ({
        invoices: [newInvoice, ...state.invoices],
        isLoading: false,
      }));
      
      return newInvoice;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create invoice',
        isLoading: false 
      });
      throw error;
    }
  },

  updateInvoice: async (id: string, data: Partial<InvoiceFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/invoices/${id}`, data);
      const updatedInvoice = response.data?.invoice || response.data;
      
      set((state) => ({
        invoices: state.invoices.map(invoice => 
          invoice._id === id ? updatedInvoice : invoice
        ),
        isLoading: false,
      }));
      
      return updatedInvoice;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update invoice',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/invoices/${id}`);
      
      set((state) => ({
        invoices: state.invoices.filter(invoice => invoice._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete invoice',
        isLoading: false 
      });
      throw error;
    }
  },

  markAsPaid: async (id: string, paidDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/invoices/${id}/mark-paid`, { paidDate });
      const updatedInvoice = response.data?.invoice || response.data;
      
      set((state) => ({
        invoices: state.invoices.map(invoice => 
          invoice._id === id ? updatedInvoice : invoice
        ),
        isLoading: false,
      }));
      
      return updatedInvoice;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to mark invoice as paid',
        isLoading: false 
      });
      throw error;
    }
  },
}));
