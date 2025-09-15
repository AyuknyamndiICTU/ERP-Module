import React, { createContext, useContext, useState, useEffect } from 'react';
import NotificationPopup from '../components/common/NotificationPopup';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Show notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Delay to allow dashboard to load first
      const timer = setTimeout(() => {
        setShowNotificationPopup(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const showNotifications = () => {
    setShowNotificationPopup(true);
  };

  const hideNotifications = () => {
    setShowNotificationPopup(false);
  };

  const value = {
    showNotifications,
    hideNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {isAuthenticated && (
        <NotificationPopup 
          open={showNotificationPopup} 
          onClose={hideNotifications} 
        />
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
