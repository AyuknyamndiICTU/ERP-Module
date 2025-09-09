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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,

  Dashboard,
  School,
  AttachMoney,
  People,
  Logout,
  Settings,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChatButton from '../Chat/ChatButton';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ];

    const roleBasedItems = [];

    // Academic module access - Updated role names to match User model
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || 
        user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator' || user?.role === 'student') {
      roleBasedItems.push(
        { text: 'Courses', icon: <School />, path: '/academic/courses' },
        { text: 'Grades', icon: <School />, path: '/academic/grades' },
        { text: 'Attendance', icon: <School />, path: '/academic/attendance' }
      );
      
      // Only admin, system_admin, lecturers, and coordinators can manage students
      if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || 
          user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') {
        roleBasedItems.push(
          { text: 'Students', icon: <People />, path: '/academic/students' }
        );
      }
    }

    // Finance module access - Updated role names
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'finance_staff' || 
        user?.role === 'marketing_staff' || user?.role === 'student') {
      
      // Admin and finance staff can manage invoices and budgets
      if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'finance_staff') {
        roleBasedItems.push(
          { text: 'Invoices', icon: <AttachMoney />, path: '/finance/invoices' },
          { text: 'Budgets', icon: <AttachMoney />, path: '/finance/budgets' }
        );
      }
      
      // All finance-related roles can view payments
      roleBasedItems.push(
        { text: 'Payments', icon: <AttachMoney />, path: '/finance/payments' }
      );

      // Admin and marketing staff can manage campaigns
      if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'marketing_staff') {
        roleBasedItems.push(
          { text: 'Campaigns', icon: <AttachMoney />, path: '/finance/campaigns' }
        );
      }
    }

    // HR module access - Updated role names
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'hr_staff') {
      roleBasedItems.push(
        { text: 'Employees', icon: <People />, path: '/hr/employees' },
        { text: 'Payroll', icon: <People />, path: '/hr/payroll' },
        { text: 'Assets', icon: <People />, path: '/hr/assets' }
      );
    }

    // Leave access for all employees (everyone except students)
    if (user?.role !== 'student') {
      roleBasedItems.push(
        { text: 'Leave', icon: <People />, path: '/hr/leave' }
      );
    }

    return [...baseItems, ...roleBasedItems];
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          ERP System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${theme.custom?.sidebar?.width || 280}px)` },
          ml: { md: `${theme.custom?.sidebar?.width || 280}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Educational ERP System
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: theme.custom?.sidebar?.width || 280 }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: theme.custom?.sidebar?.width || 280,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: theme.custom?.sidebar?.width || 280,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${theme.custom?.sidebar?.width || 280}px)` },
          mt: `${theme.custom?.header?.height || 64}px`,
        }}
      >
        {children}
      </Box>

      {/* Community Chat Button */}
      <ChatButton />
    </Box>
  );
};

export default Layout;
