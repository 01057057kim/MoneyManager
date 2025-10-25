import type { User } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const LOGIN_TIME_KEY = 'loginTime';
const LAST_ACTIVITY_KEY = 'lastActivity';

// 3 days in milliseconds
const INACTIVITY_TIMEOUT = 3 * 24 * 60 * 60 * 1000;

export const setAuthData = (token: string, user: User) => {
  const now = Date.now();
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(LOGIN_TIME_KEY, now.toString());
  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
};

export const getAuthData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGIN_TIME_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

export const isAuthenticated = (): boolean => {
  const { token } = getAuthData();
  console.log('Auth check - token exists:', !!token);
  
  if (!token) {
    console.log('Auth check - no token found');
    return false;
  }
  
  // Check if token has expired due to inactivity
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  console.log('Auth check - last activity:', lastActivity);
  
  if (!lastActivity) {
    console.log('Auth check - no last activity found');
    return false;
  }
  
  const lastActivityTime = parseInt(lastActivity);
  const now = Date.now();
  const timeSinceActivity = now - lastActivityTime;
  
  console.log('Auth check - time since activity:', timeSinceActivity, 'ms');
  console.log('Auth check - inactivity timeout:', INACTIVITY_TIMEOUT, 'ms');
  
  if (timeSinceActivity > INACTIVITY_TIMEOUT) {
    console.log('Auth check - session expired due to inactivity');
    clearAuthData();
    return false;
  }
  
  console.log('Auth check - user is authenticated');
  return true;
};

export const updateLastActivity = () => {
  const now = Date.now();
  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
};

export const getTimeUntilExpiry = (): number => {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return 0;
  
  const lastActivityTime = parseInt(lastActivity);
  const now = Date.now();
  const timeUntilExpiry = INACTIVITY_TIMEOUT - (now - lastActivityTime);
  
  return Math.max(0, timeUntilExpiry);
};
