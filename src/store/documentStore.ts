import { create } from 'zustand';
import api from '../lib/api';

export interface Document {
  _id: string;
  name: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  group: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  description?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  uploadedAt: string;
  fileType: string;
  formattedSize: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  totalDownloads: number;
  publicDocuments: number;
}

interface DocumentStore {
  documents: Document[];
  stats: DocumentStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDocuments: (groupId: string) => Promise<void>;
  fetchDocument: (documentId: string) => Promise<Document>;
  uploadDocument: (formData: FormData) => Promise<void>;
  updateDocument: (documentId: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  downloadDocument: (documentId: string) => Promise<void>;
  fetchStats: (groupId: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  stats: null,
  loading: false,
  error: null,

  fetchDocuments: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/documents?groupId=${groupId}`);
      set({ documents: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch documents', loading: false });
    }
  },

  fetchDocument: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch document', loading: false });
      throw err;
    }
  },

  uploadDocument: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        documents: [response.data, ...state.documents],
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to upload document', loading: false });
      throw err;
    }
  },

  updateDocument: async (documentId: string, data: Partial<Document>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/documents/${documentId}`, data);
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc._id === documentId ? { ...doc, ...response.data } : doc
        ),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update document', loading: false });
      throw err;
    }
  },

  deleteDocument: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/documents/${documentId}`);
      set((state) => ({
        documents: state.documents.filter((doc) => doc._id !== documentId),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to delete document', loading: false });
      throw err;
    }
  },

  downloadDocument: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'document';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to download document', loading: false });
      throw err;
    }
  },

  fetchStats: async (groupId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/documents/stats?groupId=${groupId}`);
      set({ stats: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to fetch document stats', loading: false });
    }
  },
}));
