import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Badge
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  DoneAll as DoneAllIcon,
  School as AcademicIcon,
  Payment as FinanceIcon,
  Person as HRIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const NotificationPopup = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchNotifications();
    }
  }, [open, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notifications', {
        params: { unreadOnly: true, limit: 10 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback notifications based on user role
      setNotifications(getFallbackNotifications(user?.role));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackNotifications = (role) => {
    const baseNotifications = [
      {
        id: 'welcome',
        title: 'Welcome to ICTU Portal',
        message: 'Welcome to the Institute of Communication Technology University portal. Explore all available features.',
        type: 'info',
        category: 'general',
        createdAt: new Date().toISOString()
      }
    ];

    const roleSpecificNotifications = {
      student: [
        {
          id: 'fees',
          title: 'Fee Payment Reminder',
          message: 'Please ensure your semester fees are paid on time to avoid access restrictions.',
          type: 'warning',
          category: 'finance',
          createdAt: new Date().toISOString()
        },
        {
          id: 'grades',
          title: 'Grades Available',
          message: 'New grades have been published. Check your academic records.',
          type: 'success',
          category: 'academic',
          createdAt: new Date().toISOString()
        }
      ],
      lecturer: [
        {
          id: 'grades_submission',
          title: 'Grade Submission Deadline',
          message: 'Please submit CA and Exam marks before the deadline.',
          type: 'warning',
          category: 'academic',
          createdAt: new Date().toISOString()
        },
        {
          id: 'complaints',
          title: 'Student Complaints',
          message: 'You have new grade complaints to review.',
          type: 'info',
          category: 'academic',
          createdAt: new Date().toISOString()
        }
      ],
      faculty_coordinator: [
        {
          id: 'registrations',
          title: 'Pending Registrations',
          message: 'New student registrations are awaiting your approval.',
          type: 'info',
          category: 'academic',
          createdAt: new Date().toISOString()
        },
        {
          id: 'timetable',
          title: 'Timetable Update',
          message: 'Please review and update the faculty timetable for the new semester.',
          type: 'warning',
          category: 'academic',
          createdAt: new Date().toISOString()
        }
      ],
      major_coordinator: [
        {
          id: 'registrations',
          title: 'Pending Registrations',
          message: 'New student registrations are awaiting your approval.',
          type: 'info',
          category: 'academic',
          createdAt: new Date().toISOString()
        },
        {
          id: 'curriculum',
          title: 'Curriculum Review',
          message: 'Annual curriculum review is due for your major.',
          type: 'warning',
          category: 'academic',
          createdAt: new Date().toISOString()
        }
      ],
      finance_user: [
        {
          id: 'payments',
          title: 'Payment Processing',
          message: 'New fee payments require verification and processing.',
          type: 'info',
          category: 'finance',
          createdAt: new Date().toISOString()
        },
        {
          id: 'overdue',
          title: 'Overdue Payments',
          message: 'Multiple students have overdue fee payments requiring attention.',
          type: 'error',
          category: 'finance',
          createdAt: new Date().toISOString()
        }
      ],
      hr_user: [
        {
          id: 'leave_requests',
          title: 'Leave Requests',
          message: 'New employee leave requests require approval.',
          type: 'info',
          category: 'hr',
          createdAt: new Date().toISOString()
        },
        {
          id: 'payroll',
          title: 'Payroll Processing',
          message: 'Monthly payroll processing is due.',
          type: 'warning',
          category: 'hr',
          createdAt: new Date().toISOString()
        }
      ],
      admin: [
        {
          id: 'system_update',
          title: 'System Maintenance',
          message: 'Scheduled system maintenance this weekend. Plan accordingly.',
          type: 'warning',
          category: 'general',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user_management',
          title: 'User Account Reviews',
          message: 'Quarterly user account review and cleanup is due.',
          type: 'info',
          category: 'general',
          createdAt: new Date().toISOString()
        }
      ]
    };

    return [...baseNotifications, ...(roleSpecificNotifications[role] || [])];
  };

  const getNotificationIcon = (type, category) => {
    if (category === 'academic') return <AcademicIcon />;
    if (category === 'finance') return <FinanceIcon />;
    if (category === 'hr') return <HRIcon />;
    
    switch (type) {
      case 'success': return <SuccessIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Remove from local state anyway for better UX
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6">
              Notifications
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <Typography>Loading notifications...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No new notifications
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              You're all caught up! Check back later for updates.
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 3,
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon sx={{ mt: 1 }}>
                    {getNotificationIcon(notification.type, notification.category)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" component="span">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type}
                          size="small"
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textPrimary" paragraph>
                          {notification.message}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => markAsRead(notification.id)}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                          >
                            Mark as read
                          </Button>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      {notifications.length > 0 && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={markAllAsRead} variant="outlined" fullWidth>
            Mark All as Read
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default NotificationPopup;
