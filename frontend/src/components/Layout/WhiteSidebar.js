import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  useTheme,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  AttachMoney as FinanceIcon,
  Work as HRIcon,
  LibraryBooks as LibraryIcon,
  EventNote as AttendanceIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  MenuBook as CoursesIcon,
  Grade as GradesIcon,
  Campaign as CampaignsIcon,
  Receipt as InvoicesIcon,
  Payment as PaymentsIcon,
  AccountBalanceWallet as BudgetsIcon,
  Group as TraineesIcon,
  PersonAdd as EmployeesIcon,
  MonetizationOn as PayrollIcon,
  BeachAccess as LeaveIcon,
  Inventory as AssetsIcon,
  Assignment as AssignmentsIcon,
  Schedule as TimetableIcon,
  Assessment as ExamsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const WhiteSidebar = ({ open, onClose, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleExpandClick = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Navigation items based on user role with ICT University structure
  const getNavigationItems = () => {
    const baseItems = [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/dashboard',
        key: 'dashboard'
      },
    ];

    const academicItems = [];
    const financeItems = [];
    const hrItems = [];
    const administrationItems = [];

    // Academic module access
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || 
        user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator' || user?.role === 'student') {
      
      academicItems.push(
        { text: 'Courses', icon: <CoursesIcon />, path: '/academic/courses', key: 'courses' },
        { text: 'Grades', icon: <GradesIcon />, path: '/academic/grades', key: 'grades' },
        { text: 'Attendance', icon: <AttendanceIcon />, path: '/academic/attendance', key: 'attendance' },
        { text: 'Timetable', icon: <TimetableIcon />, path: '/academic/timetable', key: 'timetable' },
        { text: 'Assignments', icon: <AssignmentsIcon />, path: '/academic/assignments', key: 'assignments' },
        { text: 'Exams', icon: <ExamsIcon />, path: '/academic/exams', key: 'exams' }
      );
      
      // Only admin, system_admin, lecturers, and coordinators can manage trainees
      if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || 
          user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') {
        academicItems.push(
          { text: 'Trainees', icon: <TraineesIcon />, path: '/academic/students', key: 'trainees' }
        );
      }
    }

    // Finance module access
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'finance_staff' || 
        user?.role === 'marketing_staff' || user?.role === 'student') {
      
      // Admin and finance staff can manage invoices and budgets
      if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'finance_staff') {
        financeItems.push(
          { text: 'Invoices', icon: <InvoicesIcon />, path: '/finance/invoices', key: 'invoices' },
          { text: 'Budgets', icon: <BudgetsIcon />, path: '/finance/budgets', key: 'budgets' }
        );
      }
      
      // All finance-related roles can view payments
      financeItems.push(
        { text: 'Payments', icon: <PaymentsIcon />, path: '/finance/payments', key: 'payments' }
      );

      // Admin and marketing staff can manage campaigns
      if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'marketing_staff') {
        financeItems.push(
          { text: 'Campaigns', icon: <CampaignsIcon />, path: '/finance/campaigns', key: 'campaigns' }
        );
      }
    }

    // HR module access
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'hr_staff') {
      hrItems.push(
        { text: 'Faculty', icon: <EmployeesIcon />, path: '/hr/employees', key: 'faculty' },
        { text: 'Payroll', icon: <PayrollIcon />, path: '/hr/payroll', key: 'payroll' },
        { text: 'Assets', icon: <AssetsIcon />, path: '/hr/assets', key: 'assets' }
      );
    }

    // Leave access for all employees (everyone except students)
    if (user?.role !== 'student') {
      hrItems.push(
        { text: 'Leave', icon: <LeaveIcon />, path: '/hr/leave', key: 'leave' }
      );
    }

    // Administration items
    if (user?.role === 'admin' || user?.role === 'system_admin') {
      administrationItems.push(
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications', key: 'notifications' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings', key: 'admin_settings' }
      );
    }

    const menuSections = [];
    
    if (academicItems.length > 0) {
      menuSections.push({
        title: 'Academic',
        icon: <SchoolIcon />,
        key: 'academic',
        items: academicItems
      });
    }

    if (financeItems.length > 0) {
      menuSections.push({
        title: 'Finance',
        icon: <FinanceIcon />,
        key: 'finance',
        items: financeItems
      });
    }

    if (hrItems.length > 0) {
      menuSections.push({
        title: 'Human Resources',
        icon: <HRIcon />,
        key: 'hr',
        items: hrItems
      });
    }

    // Add library and administration sections
    menuSections.push(
      {
        title: 'Library',
        icon: <LibraryIcon />,
        path: '/library',
        key: 'library'
      }
    );

    if (administrationItems.length > 0) {
      menuSections.push({
        title: 'Administration',
        icon: <SettingsIcon />,
        key: 'administration',
        items: administrationItems
      });
    }

    return { baseItems, menuSections };
  };

  const { baseItems, menuSections } = getNavigationItems();

  const isSelected = (path) => location.pathname === path;
  const isParentSelected = (items) => items?.some(item => location.pathname === item.path);

  const SidebarItem = ({ item, isNested = false }) => (
    <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        selected={isSelected(item.path)}
        onClick={() => handleNavigation(item.path)}
        sx={{
          borderRadius: 2,
          mx: isNested ? 2 : 1.5,
          px: 2,
          py: 1.5,
          minHeight: 48,
          background: isSelected(item.path) 
            ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.12) 100%)'
            : 'transparent',
          border: isSelected(item.path) 
            ? '1px solid rgba(25, 118, 210, 0.2)'
            : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: isSelected(item.path)
              ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(25, 118, 210, 0.16) 100%)'
              : 'rgba(25, 118, 210, 0.04)',
            transform: 'translateX(4px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.12) 100%)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(25, 118, 210, 0.16) 100%)',
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: isSelected(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
            transition: 'color 0.3s ease',
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          sx={{
            '& .MuiListItemText-primary': {
              fontSize: '0.875rem',
              fontWeight: isSelected(item.path) ? 600 : 500,
              color: isSelected(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
              transition: 'all 0.3s ease',
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );

  const SidebarSection = ({ section }) => {
    const isExpanded = expandedItems[section.key];
    const hasSelectedChild = isParentSelected(section.items);

    if (section.path) {
      // Simple menu item without children
      return <SidebarItem item={section} />;
    }

    return (
      <Box key={section.key}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleExpandClick(section.key)}
            sx={{
              borderRadius: 2,
              mx: 1.5,
              px: 2,
              py: 1.5,
              minHeight: 48,
              background: hasSelectedChild || isExpanded
                ? 'rgba(25, 118, 210, 0.04)'
                : 'transparent',
              border: hasSelectedChild
                ? '1px solid rgba(25, 118, 210, 0.1)'
                : '1px solid transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.06)',
                transform: 'translateX(2px)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: hasSelectedChild ? theme.palette.primary.main : theme.palette.text.secondary,
                transition: 'color 0.3s ease',
              }}
            >
              {section.icon}
            </ListItemIcon>
            <ListItemText
              primary={section.title}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                  fontWeight: hasSelectedChild ? 600 : 500,
                  color: hasSelectedChild ? theme.palette.primary.main : theme.palette.text.primary,
                  transition: 'all 0.3s ease',
                },
              }}
            />
            <IconButton
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                transition: 'transform 0.3s ease',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <ExpandMore fontSize="small" />
            </IconButton>
          </ListItemButton>
        </ListItem>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {section.items?.map((item) => (
              <SidebarItem key={item.key} item={item} isNested />
            ))}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          background: 'rgba(25, 118, 210, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              mr: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            I
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '1.1rem',
                lineHeight: 1.2,
              }}
            >
              ICT University
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              Management System
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List component="nav" disablePadding>
          {/* Base items */}
          {baseItems.map((item) => (
            <SidebarItem key={item.key} item={item} />
          ))}
          
          {baseItems.length > 0 && menuSections.length > 0 && (
            <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(0, 0, 0, 0.06)' }} />
          )}
          
          {/* Menu sections */}
          {menuSections.map((section) => (
            <SidebarSection key={section.key} section={section} />
          ))}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          background: 'rgba(25, 118, 210, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              mr: 2,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.875rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                textTransform: 'capitalize',
              }}
            >
              {user?.role?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(25, 118, 210, 0.03)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(25, 118, 210, 0.02)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default WhiteSidebar;