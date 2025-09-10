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
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  AttachMoney as FinanceIcon,
  Work as HRIcon,
  LibraryBooks as LibraryIcon,
  EventNote as AttendanceIcon,
  Quiz as ExamIcon,
  Home as HostelIcon,
  AccountBalance as AccountIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  MenuBook as CoursesIcon,
  Grade as GradesIcon,
  Campaign as CampaignsIcon,
  Receipt as InvoicesIcon,
  Payment as PaymentsIcon,
  AccountBalanceWallet as BudgetsIcon,
  Group as StudentsIcon,
  PersonAdd as EmployeesIcon,
  MonetizationOn as PayrollIcon,
  BeachAccess as LeaveIcon,
  Inventory as AssetsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ModernSidebar = ({ open, onClose, isMobile }) => {
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

  // Navigation items based on user role
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

    // Academic module access
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || 
        user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator' || user?.role === 'student') {
      
      academicItems.push(
        { text: 'Courses', icon: <CoursesIcon />, path: '/academic/courses', key: 'courses' },
        { text: 'Grades', icon: <GradesIcon />, path: '/academic/grades', key: 'grades' },
        { text: 'Attendance', icon: <AttendanceIcon />, path: '/academic/attendance', key: 'attendance' }
      );
      
      // Only admin, system_admin, lecturers, and coordinators can manage students
      if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || 
          user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') {
        academicItems.push(
          { text: 'Students', icon: <StudentsIcon />, path: '/academic/students', key: 'students' }
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
        { text: 'Employees', icon: <EmployeesIcon />, path: '/hr/employees', key: 'employees' },
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

    // Add additional sections
    menuSections.push(
      {
        title: 'Library',
        icon: <LibraryIcon />,
        path: '/library',
        key: 'library'
      },
      {
        title: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
        key: 'settings'
      }
    );

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
          borderRadius: 3,
          mx: 1.5,
          px: 2,
          py: 1.5,
          minHeight: 48,
          background: isSelected(item.path) 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
            : 'transparent',
          border: isSelected(item.path) 
            ? '1px solid rgba(102, 126, 234, 0.3)'
            : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: isSelected(item.path)
              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
              : 'rgba(102, 126, 234, 0.08)',
            transform: 'translateX(4px)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
            },
          },
          ...(isNested && {
            ml: 2,
            pl: 1,
          }),
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
              borderRadius: 3,
              mx: 1.5,
              px: 2,
              py: 1.5,
              minHeight: 48,
              background: hasSelectedChild || isExpanded
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                : 'transparent',
              border: hasSelectedChild
                ? '1px solid rgba(102, 126, 234, 0.2)'
                : '1px solid transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.08)',
                transform: 'translateX(2px)',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
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
        background: 'linear-gradient(180deg, #2D3748 0%, #1A202C 100%)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mr: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            E
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.1rem',
                lineHeight: 1.2,
              }}
            >
              ERP System
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
              }}
            >
              Educational Platform
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
            <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
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
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                color: 'white',
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
                color: 'rgba(255, 255, 255, 0.7)',
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
          background: 'rgba(102, 126, 234, 0.1)',
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
          background: 'rgba(118, 75, 162, 0.1)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default ModernSidebar;