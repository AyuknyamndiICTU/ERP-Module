import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Badge,
  Chip,
  Divider,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  FullscreenExit as FullscreenExitIcon,
  Fullscreen as FullscreenIcon,
  Help as HelpIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WhiteTopbar = ({ onMenuClick, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const mockNotifications = [
    {
      id: 1,
      title: 'New Course Assignment',
      message: 'You have been assigned to Advanced Programming',
      time: '2 minutes ago',
      unread: true,
      type: 'course'
    },
    {
      id: 2,
      title: 'Grade Updated',
      message: 'Your grade for Database Systems has been updated',
      time: '1 hour ago',
      unread: true,
      type: 'grade'
    },
    {
      id: 3,
      title: 'Fee Payment Reminder',
      message: 'Tuition fee payment due in 3 days',
      time: '2 hours ago',
      unread: false,
      type: 'payment'
    },
    {
      id: 4,
      title: 'Library Book Due',
      message: 'Return "Software Engineering" by tomorrow',
      time: '1 day ago',
      unread: false,
      type: 'library'
    },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course': return <SchoolIcon fontSize="small" />;
      case 'grade': return <DashboardIcon fontSize="small" />;
      case 'payment': return <SettingsIcon fontSize="small" />;
      case 'library': return <HelpIcon fontSize="small" />;
      default: return <NotificationsIcon fontSize="small" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'course': return '#1976d2';
      case 'grade': return '#2e7d32';
      case 'payment': return '#ed6c02';
      case 'library': return '#9c27b0';
      default: return '#666';
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
        height: 70,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '70px !important',
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{
                mr: 2,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(25, 118, 210, 0.08)',
                color: theme.palette.primary.main,
                '&:hover': {
                  background: 'rgba(25, 118, 210, 0.12)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: { xs: 'none', sm: 'block' },
                mr: 2,
              }}
            >
              ICT University
            </Typography>
            <Chip
              label="ERP v2.0"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                display: { xs: 'none', md: 'flex' },
              }}
            />
          </Box>

          {/* Search Bar */}
          <Box sx={{ flex: 1, maxWidth: 400, display: { xs: 'none', md: 'block' } }}>
            <TextField
              fullWidth
              placeholder="Search courses, trainees, faculty..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  background: 'rgba(25, 118, 210, 0.04)',
                  border: '1px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(25, 118, 210, 0.06)',
                    border: '1px solid rgba(25, 118, 210, 0.2)',
                  },
                  '&.Mui-focused': {
                    background: 'white',
                    border: '1px solid rgba(25, 118, 210, 0.5)',
                    boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Mobile Search */}
          <IconButton
            sx={{
              display: { xs: 'flex', md: 'none' },
              p: 1.5,
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.08)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <SearchIcon />
          </IconButton>

          {/* Quick Actions */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/academic/courses')}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'rgba(25, 118, 210, 0.3)',
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                background: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            Courses
          </Button>

          {/* Fullscreen Toggle */}
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            <IconButton
              onClick={handleFullscreenToggle}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                p: 1.5,
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(25, 118, 210, 0.08)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotificationMenuOpen}
              sx={{
                p: 1.5,
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(25, 118, 210, 0.08)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight="600" color="text.primary">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ')}
              </Typography>
            </Box>
            
            <Tooltip title="Profile Menu">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  p: 0.5,
                  borderRadius: 2,
                  border: '2px solid transparent',
                  '&:hover': {
                    border: '2px solid rgba(25, 118, 210, 0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            minWidth: 220,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <Typography variant="body2" fontWeight="600">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={() => navigate('/profile')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        
        <MenuItem onClick={() => navigate('/settings')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <MenuItem sx={{ py: 1.5 }}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          Help & Support
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            minWidth: 320,
            maxWidth: 400,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 20,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <Typography variant="h6" fontWeight="600">
            Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You have {unreadCount} unread notifications
          </Typography>
        </Box>
        
        {mockNotifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={handleNotificationMenuClose}
            sx={{
              py: 1.5,
              px: 2,
              borderLeft: notification.unread ? `3px solid ${getNotificationColor(notification.type)}` : '3px solid transparent',
              background: notification.unread ? 'rgba(25, 118, 210, 0.02)' : 'transparent',
              '&:hover': {
                background: notification.unread ? 'rgba(25, 118, 210, 0.04)' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ color: getNotificationColor(notification.type) }}>
              {getNotificationIcon(notification.type)}
            </ListItemIcon>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="600" sx={{ flex: 1 }}>
                  {notification.title}
                </Typography>
                {notification.unread && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getNotificationColor(notification.type),
                      ml: 1,
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        
        <Divider />
        
        <MenuItem sx={{ py: 1.5, justifyContent: 'center' }}>
          <Typography variant="body2" color="primary" fontWeight="600">
            View All Notifications
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default WhiteTopbar;