import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { isAuthenticated, getTimeUntilExpiry, updateLastActivity } from '../lib/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkAuth, logout } = useAuthStore();

  useEffect(() => {
    // Set up automatic logout timer (don't check auth here, let ProtectedRoute handle it)
    const checkInactivity = () => {
      if (!isAuthenticated()) {
        logout();
        return;
      }

      const timeUntilExpiry = getTimeUntilExpiry();
      if (timeUntilExpiry <= 0) {
        logout();
        return;
      }

      // Set timer for next check (check every hour)
      const nextCheck = Math.min(timeUntilExpiry, 60 * 60 * 1000); // 1 hour max
      setTimeout(checkInactivity, nextCheck);
    };

    // Start the inactivity checker after a delay
    const timer = setTimeout(checkInactivity, 60000); // Check after 1 minute

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [logout]);

  // Track user activity (mouse movement, clicks, keyboard)
  useEffect(() => {
    const handleActivity = () => {
      if (isAuthenticated()) {
        // Update last activity on user interaction
        updateLastActivity();
      }
    };

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Clean up event listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
