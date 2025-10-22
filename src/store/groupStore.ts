import { create } from 'zustand';
import type { Group, GroupsResponse, CreateGroupData, JoinGroupData } from '../types';
import api from '../lib/api';

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  isLoading: boolean;
  fetchGroups: () => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<Group>;
  joinGroup: (data: JoinGroupData) => Promise<Group>;
  setActiveGroup: (groupId: string) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  isLoading: false,

  fetchGroups: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<GroupsResponse>('/groups/my-groups');
      const groups = response.data.groups;
      set({ 
        groups,
        activeGroup: groups.length > 0 ? groups[0] : null,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createGroup: async (data: CreateGroupData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/groups/create', data);
      const newGroup = response.data.group;
      
      set((state) => ({
        groups: [newGroup, ...state.groups],
        activeGroup: newGroup,
        isLoading: false,
      }));
      
      return newGroup;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  joinGroup: async (data: JoinGroupData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/groups/join', data);
      const joinedGroup = response.data.group;
      
      set((state) => ({
        groups: [joinedGroup, ...state.groups],
        activeGroup: joinedGroup,
        isLoading: false,
      }));
      
      return joinedGroup;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setActiveGroup: (groupId: string) => {
    const group = get().groups.find(g => g.id === groupId);
    if (group) {
      set({ activeGroup: group });
    }
  },
}));
