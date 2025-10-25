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

// Planning Section Types
export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  clientId: string;
  client?: Client;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget?: number;
  hourlyRate?: number;
  totalHours?: number;
  progress: number; // 0-100
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  projectId?: string;
  project?: Project;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  clientId: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget?: number;
  hourlyRate?: number;
  totalHours?: number;
  progress: number;
  notes?: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
}
