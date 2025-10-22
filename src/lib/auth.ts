import type { User } from '../types';

export const setAuthData = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const { token } = getAuthData();
  return !!token;
};
