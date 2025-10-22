export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  taxRate: number;
  inviteKey: string;
  owner: User;
  members: GroupMember[];
  userRole: 'Owner' | 'Editor' | 'Viewer';
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  user: User;
  role: 'Owner' | 'Editor' | 'Viewer';
  joinedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface GroupsResponse {
  groups: Group[];
}

export interface CreateGroupData {
  name: string;
  currency: string;
  taxRate: number;
}

export interface JoinGroupData {
  inviteKey: string;
}
