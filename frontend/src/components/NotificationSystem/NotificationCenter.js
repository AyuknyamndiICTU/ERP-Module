import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Divider,
  Fab
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import { notificationsAPI } from '../../services/api';
import logger from '../../utils/logger';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 0) params.isRead = 'false'; // Unread
      if (activeTab === 1) params.isRead = 'true'; // Read
      if (activeTab === 2) params.category = 'complaint'; // Complaints
      if (activeTab === 3) params.category = 'finance'; // Finance

      logger.debug('Fetching notifications with params:', params);

      const response = await notificationsAPI.getNotifications(params);

      setNotifications(response.data.notifications || []);
      logger.debug('Notifications fetched:', response.data.notifications?.length || 0);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      showSnackbar('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
      logger.debug('Unread count fetched:', response.data.unreadCount || 0);
    } catch (error) {
      logger.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true, popupShown: true }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
      showSnackbar('Notification marked as read', 'success');
      logger.debug('Notification marked as read:', notificationId);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to mark notification as read';
      showSnackbar(errorMessage, 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true, popupShown: true }))
      );

      setUnreadCount(0);
      showSnackbar('All notifications marked as read', 'success');
      logger.debug('All notifications marked as read');
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to mark all notifications as read';
      showSnackbar(errorMessage, 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showSnackbar('Notification deleted', 'success');
      logger.debug('Notification deleted:', notificationId);
    } catch (error) {
      logger.error('Error deleting notification:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete notification';
      showSnackbar(errorMessage, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'complaint':
        return 'warning';
      case 'finance':
        return 'success';
      case 'academic':
        return 'primary';
      case 'deadline':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const tabs = [
    { label: 'Unread', count: unreadCount },
    { label: 'Read' },
    { label: 'Complaints' },
    { label: 'Finance' }
  ];

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
              <NotificationsIcon fontSize="large" color="primary" />
            </Badge>
            <Box>
              <Typography variant="h5">Notifications</Typography>
              <Typography variant="body2" color="text.secondary">
                Stay updated with your latest activities
              </Typography>
            </Box>
          </Box>

          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Box>

        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.label}
              label={
                <Box display="flex" alignItems="center">
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <Chip
                      label={tab.count}
                      size="small"
                      color="error"
                      sx={{ ml: 1, height: 18, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        {loading ? (
          <Box textAlign="center" py={4}>
            <Typography>Loading notifications...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box textAlign="center" py={6}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {activeTab === 0 ? 'No unread notifications' : 'No notifications found'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 ? 'You\'re all caught up!' : 'Check back later for updates'}
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: !notification.isRead ? 'action.hover' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                  onClick={() => setSelectedNotification(notification)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${notification.type}.main` }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" component="span">
                          {notification.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={notification.category}
                            size="small"
                            color={getCategoryColor(notification.category)}
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                  />

                  <Box display="flex" gap={1}>
                    {!notification.isRead && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete notification"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>

                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Notification Detail Dialog */}
      <Dialog
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: `${selectedNotification.type}.main` }}>
                  {getNotificationIcon(selectedNotification.type)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedNotification.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(selectedNotification.createdAt)}
                    {selectedNotification.sender && (
                      <> • From {selectedNotification.sender.firstName} {selectedNotification.sender.lastName}</>
                    )}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedNotification.message}
              </Typography>

              {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Information:
                  </Typography>
                  {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                    <Typography key={key} variant="body2" color="text.secondary">
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                    </Typography>
                  ))}
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              {!selectedNotification.isRead && (
                <Button
                  onClick={() => {
                    markAsRead(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  color="primary"
                >
                  Mark as Read
                </Button>
              )}
              <Button onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for quick access */}
      {unreadCount > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setActiveTab(0)}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActiveIcon />
          </Badge>
        </Fab>
      )}
    </Box>
  );
};

export default NotificationCenter;
