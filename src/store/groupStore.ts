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
  deleteGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  updateMemberRole: (groupId: string, memberId: string, data: { role: string }) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
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
      const groups = response.data?.groups || response.data || [];
      
      // Preserve current active group if it still exists in the new groups list
      const currentActiveGroup = get().activeGroup;
      let newActiveGroup = null;
      
      if (currentActiveGroup) {
        // Check if current active group still exists in the fetched groups
        const stillExists = groups.find(g => g.id === currentActiveGroup.id);
        if (stillExists) {
          newActiveGroup = stillExists; // Keep the current active group
          console.log('GroupStore - Preserving active group:', currentActiveGroup.name);
        } else {
          // If current active group no longer exists, set to first group
          newActiveGroup = groups.length > 0 ? groups[0] : null;
          console.log('GroupStore - Active group no longer exists, setting to first group');
        }
      } else {
        // No current active group, set to first group
        newActiveGroup = groups.length > 0 ? groups[0] : null;
        console.log('GroupStore - No current active group, setting to first group');
      }
      
      set({ 
        groups,
        activeGroup: newActiveGroup,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
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

  deleteGroup: async (groupId: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/groups/${groupId}`);
      
      set((state) => {
        const updatedGroups = state.groups.filter(g => g.id !== groupId);
        const newActiveGroup = state.activeGroup?.id === groupId 
          ? (updatedGroups.length > 0 ? updatedGroups[0] : null)
          : state.activeGroup;
        
        return {
          groups: updatedGroups,
          activeGroup: newActiveGroup,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  leaveGroup: async (groupId: string) => {
    set({ isLoading: true });
    try {
      await api.post(`/groups/${groupId}/leave`);
      
      set((state) => {
        const updatedGroups = state.groups.filter(g => g.id !== groupId);
        const newActiveGroup = state.activeGroup?.id === groupId 
          ? (updatedGroups.length > 0 ? updatedGroups[0] : null)
          : state.activeGroup;
        
        return {
          groups: updatedGroups,
          activeGroup: newActiveGroup,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateMemberRole: async (groupId: string, memberId: string, data: { role: string }) => {
    set({ isLoading: true });
    try {
      await api.put(`/groups/${groupId}/members/${memberId}/role`, data);
      
      set((state) => ({
        groups: state.groups.map(group => 
          group.id === groupId 
            ? {
                ...group,
                members: group.members.map(member =>
                  member.user._id === memberId
                    ? { ...member, role: data.role }
                    : member
                )
              }
            : group
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeMember: async (groupId: string, memberId: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      
      set((state) => ({
        groups: state.groups.map(group => 
          group.id === groupId 
            ? {
                ...group,
                members: group.members.filter(member => member.user._id !== memberId),
                memberCount: group.memberCount - 1
              }
            : group
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setActiveGroup: (groupId: string) => {
    console.log('GroupStore - Setting active group to:', groupId);
    const group = get().groups.find(g => g.id === groupId);
    if (group) {
      console.log('GroupStore - Found group:', group.name);
      set({ activeGroup: group });
    } else {
      console.log('GroupStore - Group not found:', groupId);
    }
  },
}));
