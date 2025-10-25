import { create } from 'zustand';
import type { Project, ProjectFormData } from '../types';
import api from '../lib/api';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: (groupId: string) => Promise<void>;
  createProject: (data: ProjectFormData) => Promise<Project>;
  updateProject: (id: string, data: Partial<ProjectFormData>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (groupId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects?groupId=${groupId}`);
      const projects = response.data?.projects || response.data || [];
      set({ projects, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch projects',
        isLoading: false 
      });
      throw error;
    }
  },

  createProject: async (data: ProjectFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/projects', data);
      const newProject = response.data?.project || response.data;
      
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));
      
      return newProject;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create project',
        isLoading: false 
      });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<ProjectFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/projects/${id}`, data);
      const updatedProject = response.data?.project || response.data;
      
      set((state) => ({
        projects: state.projects.map(project => 
          project._id === id ? updatedProject : project
        ),
        isLoading: false,
      }));
      
      return updatedProject;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update project',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      
      set((state) => ({
        projects: state.projects.filter(project => project._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete project',
        isLoading: false 
      });
      throw error;
    }
  },
}));
