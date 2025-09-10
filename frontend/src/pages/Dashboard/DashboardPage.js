import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  keyframes,
  LinearProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Dashboard as DashboardIcon,
  Grade as GradeIcon,
  ArrowUpward as ArrowUpwardIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  /* Class as ClassIcon */
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FormDialog } from '../../components/Common/DialogComponents';
import { dashboardAPI, notificationsAPI } from '../../services/api';
import logger from '../../utils/logger';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Modern Stats Card Component
const ModernStatsCard = ({ title, value, subtitle, icon, color, trend, trendValue, delay = 0 }) => {
  const theme = useTheme();
  
  const getGradientColor = (color) => {
    switch (color) {
      case 'primary':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'success':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
      case 'info':
        return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      case 'purple':
        return 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <Card
      sx={{
        background: getGradientColor(color),
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        animation: `${fadeInUp} 0.8s ease-out ${delay}s both`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[20],
          '& .icon-wrapper': {
            animation: `${pulse} 1s ease-in-out infinite`
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.1)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        }
      }}
    >
      <CardContent sx={{ p: 3, color: 'white', position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              mb: 0.5,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ 
              opacity: 0.9,
              fontWeight: 500,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              {title}
            </Typography>
          </Box>
          <Box className="icon-wrapper" sx={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 2,
            p: 1.5,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            {icon}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ 
            opacity: 0.8,
            fontWeight: 500
          }}>
            {subtitle}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend === 'up' ? 
                <ArrowUpwardIcon sx={{ fontSize: 16, opacity: 0.8 }} /> :
                <TrendingDownIcon sx={{ fontSize: 16, opacity: 0.8 }} />
              }
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      
      {/* Decorative circles */}
      <Box sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        animation: `${float} 3s ease-in-out infinite`
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -10,
        left: -10,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        animation: `${float} 2s ease-in-out infinite reverse`
      }} />
    </Card>
  );
};

// Modern Quick Action Button
const QuickActionButton = ({ icon, title, onClick, gradient, delay = 0 }) => (
  <Button
    onClick={onClick}
    sx={{
      background: gradient,
      borderRadius: 3,
      p: 2,
      minHeight: 80,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      color: 'white',
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9rem',
      animation: `${slideInLeft} 0.6s ease-out ${delay}s both`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
        background: gradient,
      },
      '&:active': {
        transform: 'translateY(-2px) scale(1.01)',
      }
    }}
  >
    <Box sx={{ fontSize: 28 }}>{icon}</Box>
    <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
      {title}
    </Typography>
  </Button>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Dialog states
  const [quickActionDialog, setQuickActionDialog] = useState({
    open: false,
    type: '',
    title: '',
    fields: []
  });

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard statistics
        const statsResponse = await dashboardAPI.getDashboardStats();
        const stats = statsResponse.data.data;

        // Fetch recent notifications
        const notificationsResponse = await notificationsAPI.getNotifications({ limit: 8 });
        const notifications = notificationsResponse.data.notifications || [];

        setDashboardData(stats);

        // Transform notifications to activities format
        const activities = notifications.map(notification => ({
          id: notification.id,
          type: notification.category,
          message: notification.message,
          time: new Date(notification.createdAt).toLocaleString(),
          avatar: notification.title.split(' ').map(word => word[0]).join('').slice(0, 2),
          color: getCategoryColor(notification.category),
          icon: getCategoryIcon(notification.category),
          title: notification.title
        }));

        setRecentActivities(activities);
        setError(null);
      } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.error || 'Failed to load dashboard data');
        
        // Set fallback data for demo
        setDashboardData({
          academic: { totalStudents: 1247 },
          finance: { totalRevenue: 2450000, monthlyGrowth: 12.5, pendingInvoices: 23, activeCampaigns: 3 },
          hr: { totalEmployees: 85, activeLeaveRequests: 7, pendingReviews: 12, assetsAssigned: 145 }
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Helper function to get category color
  const getCategoryColor = (category) => {
    const colors = {
      academic: '#667eea',
      finance: '#10b981',
      system: '#f59e0b',
      complaint: '#ec4899',
      default: '#6b7280'
    };
    return colors[category] || colors.default;
  };

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    const iconsMap = {
      academic: <SchoolIcon />,
      finance: <MoneyIcon />,
      system: <SettingsIcon />,
      complaint: <NotificationsIcon />,
      default: <NotificationsIcon />
    };
    return iconsMap[category] || iconsMap.default;
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    return `${greeting}, ${user?.firstName || user?.name || 'User'}!`;
  };

  // Quick action handlers
  const handleQuickAction = (actionType) => {
    switch (actionType) {
      case 'viewGrades':
        navigate('/academic/grades');
        break;
      case 'checkAttendance':
        navigate('/academic/attendance');
        break;
      case 'payFees':
        navigate('/finance/payments');
        break;
      case 'gradeAssignments':
        setQuickActionDialog({
          open: true,
          type: 'gradeAssignments',
          title: 'Grade Assignment',
          fields: [
            { name: 'course', label: 'Course', type: 'select', required: true, options: [
              { value: 'CS101', label: 'Computer Science 101' },
              { value: 'MATH201', label: 'Mathematics 201' },
              { value: 'ENG101', label: 'English 101' }
            ]},
            { name: 'assignment', label: 'Assignment', type: 'text', required: true },
            { name: 'student', label: 'Student', type: 'select', required: true, options: [
              { value: 'student1', label: 'Alice Johnson' },
              { value: 'student2', label: 'Bob Smith' },
              { value: 'student3', label: 'Carol Davis' }
            ]},
            { name: 'grade', label: 'Grade', type: 'number', required: true, min: 0, max: 100 },
            { name: 'comments', label: 'Comments', type: 'textarea', rows: 3 }
          ]
        });
        break;
      case 'markAttendance':
        navigate('/academic/attendance');
        break;
      case 'scheduleExam':
        navigate('/academic/courses');
        break;
      case 'generateInvoice':
        navigate('/finance/invoices');
        break;
      case 'processPayment':
        navigate('/finance/payments');
        break;
      case 'addEmployee':
        navigate('/hr/employees');
        break;
      case 'processPayroll':
        navigate('/hr/payroll');
        break;
      case 'systemSettings':
        navigate('/settings');
        break;
      default:
        logger.debug('Action not implemented:', actionType);
    }
  };

  const handleQuickActionSave = (data) => {
    logger.debug('Saving quick action data:', quickActionDialog.type, data);
    setQuickActionDialog({ open: false, type: '', title: '', fields: [] });
  };

  const getRoleBasedStats = () => {
    if (!dashboardData) {
      return [];
    }

    const { academic, finance, hr } = dashboardData;

    switch (user?.role) {
      case 'admin':
      case 'system_admin':
        return [
          { title: 'Total Trainees', value: academic?.totalStudents || '1,247', icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: 'primary', subtitle: 'Active enrollments', trend: 'up', trendValue: '+8.2%' },
          { title: 'Revenue', value: '2.4M FCFA', icon: <MoneyIcon sx={{ fontSize: 32 }} />, color: 'success', subtitle: 'This academic year', trend: 'up', trendValue: '+12.5%' },
          { title: 'Staff Members', value: hr?.totalEmployees || '85', icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: 'warning', subtitle: 'Active employees', trend: 'up', trendValue: '+3.1%' },
          { title: 'Growth Rate', value: '12.5%', icon: <TrendingUpIcon sx={{ fontSize: 32 }} />, color: 'error', subtitle: 'Monthly growth', trend: 'up', trendValue: '+2.3%' },
        ];
      case 'lecturer':
      case 'faculty_coordinator':
      case 'major_coordinator':
        return [
          { title: 'My Trainees', value: '156', icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: 'primary', subtitle: 'Active trainees', trend: 'up', trendValue: '+5.2%' },
          { title: 'My Courses', value: '8', icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: 'success', subtitle: 'This semester', trend: 'up', trendValue: '+2' },
          { title: 'Pending Grades', value: '23', icon: <AssignmentIcon sx={{ fontSize: 32 }} />, color: 'warning', subtitle: 'To be graded', trend: 'down', trendValue: '-12' },
          { title: 'Attendance', value: '94%', icon: <EventIcon sx={{ fontSize: 32 }} />, color: 'purple', subtitle: 'Course average', trend: 'up', trendValue: '+2.1%' },
        ];
      case 'student':
        return [
          { title: 'My Courses', value: '6', icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: 'primary', subtitle: 'Current semester', trend: 'up', trendValue: '+1' },
          { title: 'Current GPA', value: '3.7', icon: <GradeIcon sx={{ fontSize: 32 }} />, color: 'success', subtitle: 'Cumulative GPA', trend: 'up', trendValue: '+0.2' },
          { title: 'Attendance', value: '95%', icon: <EventIcon sx={{ fontSize: 32 }} />, color: 'warning', subtitle: 'This semester', trend: 'up', trendValue: '+3%' },
          { title: 'Credits', value: '78', icon: <AssignmentIcon sx={{ fontSize: 32 }} />, color: 'info', subtitle: 'Total earned', trend: 'up', trendValue: '+6' },
        ];
      case 'finance_staff':
        return [
          { title: 'Pending Invoices', value: finance?.pendingInvoices || '23', icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />, color: 'primary', subtitle: 'Awaiting payment' },
          { title: 'Monthly Revenue', value: '245K FCFA', icon: <TrendingUpIcon sx={{ fontSize: 32 }} />, color: 'success', subtitle: 'This month' },
          { title: 'Campaigns', value: finance?.activeCampaigns || '3', icon: <EventIcon sx={{ fontSize: 32 }} />, color: 'warning', subtitle: 'Active campaigns' },
          { title: 'Budget Usage', value: '78%', icon: <AssignmentIcon sx={{ fontSize: 32 }} />, color: 'error', subtitle: 'Current fiscal year' },
        ];
      case 'hr_personnel':
        return [
          { title: 'Employees', value: hr?.totalEmployees || '85', icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: 'primary', subtitle: 'Active staff' },
          { title: 'Leave Requests', value: hr?.activeLeaveRequests || '7', icon: <EventIcon sx={{ fontSize: 32 }} />, color: 'success', subtitle: 'Pending approval' },
          { title: 'Reviews Due', value: hr?.pendingReviews || '12', icon: <AssignmentIcon sx={{ fontSize: 32 }} />, color: 'warning', subtitle: 'This month' },
          { title: 'Assets', value: hr?.assetsAssigned || '145', icon: <TrendingUpIcon sx={{ fontSize: 32 }} />, color: 'info', subtitle: 'Total assigned' },
        ];
      default:
        return [
          { title: 'Trainees', value: '1,247', icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: 'primary', subtitle: 'Active enrollments' },
          { title: 'Revenue', value: '2.4M', icon: <MoneyIcon sx={{ fontSize: 32 }} />, color: 'success', subtitle: 'This year' },
          { title: 'Staff', value: '85', icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: 'warning', subtitle: 'Employees' },
          { title: 'Growth', value: '12.5%', icon: <TrendingUpIcon sx={{ fontSize: 32 }} />, color: 'error', subtitle: 'Monthly' },
        ];
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: <GradeIcon />, title: 'View Grades', onClick: () => handleQuickAction('viewGrades'), gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', delay: 0.1 },
          { icon: <CalendarIcon />, title: 'Check Attendance', onClick: () => handleQuickAction('checkAttendance'), gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', delay: 0.2 },
          { icon: <PaymentIcon />, title: 'Pay Fees', onClick: () => handleQuickAction('payFees'), gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', delay: 0.3 },
          { icon: <ScheduleIcon />, title: 'View Schedule', onClick: () => navigate('/academic/courses'), gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', delay: 0.4 },
        ];
      case 'lecturer':
      case 'faculty_coordinator':
      case 'major_coordinator':
        return [
          { icon: <AssessmentIcon />, title: 'Grade Assignment', onClick: () => handleQuickAction('gradeAssignments'), gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', delay: 0.1 },
          { icon: <CalendarIcon />, title: 'Mark Attendance', onClick: () => handleQuickAction('markAttendance'), gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', delay: 0.2 },
          { icon: <StarIcon />, title: 'Schedule Exam', onClick: () => handleQuickAction('scheduleExam'), gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', delay: 0.3 },
          { icon: <SchoolIcon />, title: 'Manage Courses', onClick: () => navigate('/academic/courses'), gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', delay: 0.4 },
        ];
      case 'finance_staff':
        return [
          { icon: <PaymentIcon />, title: 'Generate Invoice', onClick: () => handleQuickAction('generateInvoice'), gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', delay: 0.1 },
          { icon: <MoneyIcon />, title: 'Process Payment', onClick: () => handleQuickAction('processPayment'), gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', delay: 0.2 },
          { icon: <TrendingUpIcon />, title: 'View Reports', onClick: () => navigate('/finance/budgets'), gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', delay: 0.3 },
          { icon: <EventIcon />, title: 'Manage Campaigns', onClick: () => navigate('/finance/campaigns'), gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', delay: 0.4 },
        ];
      case 'hr_personnel':
        return [
          { icon: <PersonIcon />, title: 'Add Employee', onClick: () => handleQuickAction('addEmployee'), gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', delay: 0.1 },
          { icon: <PaymentIcon />, title: 'Process Payroll', onClick: () => handleQuickAction('processPayroll'), gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', delay: 0.2 },
          { icon: <EventIcon />, title: 'Manage Leave', onClick: () => navigate('/hr/leave'), gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', delay: 0.3 },
          { icon: <AssignmentIcon />, title: 'Performance Review', onClick: () => navigate('/hr/employees'), gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', delay: 0.4 },
        ];
      default:
        return [
          { icon: <DashboardIcon />, title: 'System Overview', onClick: () => {}, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', delay: 0.1 },
          { icon: <SettingsIcon />, title: 'Settings', onClick: () => handleQuickAction('systemSettings'), gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', delay: 0.2 },
          { icon: <PeopleIcon />, title: 'User Management', onClick: () => navigate('/admin/users'), gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', delay: 0.3 },
          { icon: <AssessmentIcon />, title: 'Analytics', onClick: () => navigate('/analytics'), gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', delay: 0.4 },
        ];
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress sx={{ width: 200, mb: 2 }} />
            <Typography>Loading dashboard...</Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            animation: `${fadeInUp} 0.8s ease-out`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: `${float} 4s ease-in-out infinite`,
            }
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                mb: 1,
                fontSize: { xs: '1.75rem', md: '3rem' }
              }}>
                {getWelcomeMessage()}
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.9, 
                fontSize: { xs: '0.9rem', md: '1rem' },
                mb: 2
              }}>
                Welcome to the Educational ERP System. Here's your personalized dashboard overview.
              </Typography>
              <Chip 
                label={user?.role?.replace('_', ' ').toUpperCase()} 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  px: 1
                }} 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'center', md: 'flex-end' },
                mt: { xs: 2, md: 0 }
              }}>
                <Avatar
                  sx={{
                    width: { xs: 80, md: 120 },
                    height: { xs: 80, md: 120 },
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    fontSize: { xs: '2rem', md: '3rem' },
                    fontWeight: 700
                  }}
                >
                  {(user?.firstName?.[0] || user?.name?.[0] || 'U').toUpperCase()}
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getRoleBasedStats().map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <ModernStatsCard {...stat} delay={index * 0.1} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              animation: `${fadeInUp} 0.8s ease-out 0.4s both`
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Recent Activities
              </Typography>
              <Box>
                {recentActivities.length > 0 ? (
                  <Stack spacing={2}>
                    {recentActivities.slice(0, 6).map((activity, index) => (
                      <Box
                        key={activity.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          background: 'rgba(102, 126, 234, 0.05)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          transition: 'all 0.3s ease',
                          animation: `${slideInLeft} 0.6s ease-out ${index * 0.1}s both`,
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)',
                            transform: 'translateX(8px)',
                            borderColor: 'rgba(102, 126, 234, 0.3)'
                          }
                        }}
                      >
                        <Avatar sx={{
                          mr: 2,
                          bgcolor: activity.color,
                          width: 48,
                          height: 48,
                          fontSize: 20
                        }}>
                          {activity.icon}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            {activity.message}
                          </Typography>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: 3,
                    border: '2px dashed rgba(102, 126, 234, 0.2)'
                  }}>
                    <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No recent activities
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Your recent activities will appear here
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              animation: `${fadeInUp} 0.8s ease-out 0.5s both`
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {getQuickActions().map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <QuickActionButton {...action} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Action Dialog */}
      <FormDialog
        open={quickActionDialog.open}
        onClose={() => setQuickActionDialog({ open: false, type: '', title: '', fields: [] })}
        title={quickActionDialog.title}
        fields={quickActionDialog.fields}
        onSave={handleQuickActionSave}
      />
    </Container>
  );
};

export default DashboardPage;
