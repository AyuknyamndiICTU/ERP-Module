import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  IconButton,
  Paper,
  keyframes,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  AutoGraph as AutoGraphIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard, { GradientCard, StatsCard, FeatureCard } from '../../components/GlassCard';

// Animation keyframes
const countUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const DashboardPage = () => {
  const { user } = useAuth();

  // Mock data for demonstration
  const stats = {
    students: 2847,
    courses: 156,
    revenue: 125000,
    employees: 89,
  };

  const recentActivities = [
    {
      id: 1,
      type: 'enrollment',
      message: 'New student enrolled in Computer Science',
      time: '2 hours ago',
      avatar: 'CS',
      color: '#667eea',
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received from John Doe',
      time: '4 hours ago',
      avatar: 'JD',
      color: '#10b981',
    },
    {
      id: 3,
      type: 'grade',
      message: 'Grades updated for Mathematics 101',
      time: '6 hours ago',
      avatar: 'M1',
      color: '#f59e0b',
    },
    {
      id: 4,
      type: 'event',
      message: 'Faculty meeting scheduled for tomorrow',
      time: '8 hours ago',
      avatar: 'FM',
      color: '#ec4899',
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Faculty Meeting',
      date: 'Today, 2:00 PM',
      type: 'meeting',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Student Registration Deadline',
      date: 'Tomorrow',
      type: 'deadline',
      priority: 'high',
    },
    {
      id: 3,
      title: 'Semester Exam Schedule',
      date: 'Next Week',
      type: 'exam',
      priority: 'medium',
    },
    {
      id: 4,
      title: 'Parent-Teacher Conference',
      date: 'Friday, 10:00 AM',
      type: 'conference',
      priority: 'medium',
    },
  ];

  const ModernStatCard = ({ title, value, icon, gradient, trend, delay = 0 }) => (
    <StatsCard
      icon={icon}
      color="primary"
      sx={{
        background: gradient,
        color: '#ffffff',
        animation: `${countUp} 0.6s ease-out ${delay}s both`,
        '&:hover': {
          animation: `${pulse} 0.3s ease-in-out`,
        },
        '& .MuiTypography-root': {
          color: '#ffffff',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="h3" component="div" fontWeight="800" sx={{ mb: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          {title}
        </Typography>
        {trend && (
          <Chip
            icon={<TrendingUpIcon />}
            label={`+${trend}%`}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 600,
            }}
            size="small"
          />
        )}
      </Box>
    </StatsCard>
  );

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    return `${greeting}, ${user?.firstName || user?.name || 'User'}!`;
  };

  const getRoleBasedStats = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Total Students', value: stats.academic.totalStudents, icon: <School />, color: '#2196f3', subtitle: 'Active enrollments' },
          { title: 'Total Revenue', value: `$${(stats.finance.totalRevenue / 1000000).toFixed(1)}M`, icon: <AttachMoney />, color: '#4caf50', subtitle: 'This academic year' },
          { title: 'Total Employees', value: stats.hr.totalEmployees, icon: <People />, color: '#ff9800', subtitle: 'Active staff' },
          { title: 'Growth Rate', value: `${stats.finance.monthlyGrowth}%`, icon: <TrendingUp />, color: '#9c27b0', subtitle: 'Monthly growth' },
        ];
      case 'academic_staff':
        return [
          { title: 'My Courses', value: 8, icon: <School />, color: '#2196f3', subtitle: 'Active courses' },
          { title: 'Total Students', value: 245, icon: <People />, color: '#4caf50', subtitle: 'Enrolled students' },
          { title: 'Pending Grades', value: 12, icon: <Assignment />, color: '#ff9800', subtitle: 'To be graded' },
          { title: 'Attendance Rate', value: '92%', icon: <Event />, color: '#9c27b0', subtitle: 'Average attendance' },
        ];
      case 'student':
        return [
          { title: 'Enrolled Courses', value: 6, icon: <School />, color: '#2196f3', subtitle: 'Current semester' },
          { title: 'Current GPA', value: '3.7', icon: <TrendingUp />, color: '#4caf50', subtitle: 'Cumulative GPA' },
          { title: 'Attendance', value: '95%', icon: <Event />, color: '#ff9800', subtitle: 'This semester' },
          { title: 'Credits Earned', value: 78, icon: <Assignment />, color: '#9c27b0', subtitle: 'Total credits' },
        ];
      case 'finance_staff':
        return [
          { title: 'Pending Invoices', value: 45, icon: <AttachMoney />, color: '#2196f3', subtitle: 'Awaiting payment' },
          { title: 'Monthly Revenue', value: '$125K', icon: <TrendingUp />, color: '#4caf50', subtitle: 'This month' },
          { title: 'Active Campaigns', value: stats.finance.activeCampaigns, icon: <Event />, color: '#ff9800', subtitle: 'Marketing campaigns' },
          { title: 'Budget Utilization', value: '78%', icon: <Assignment />, color: '#9c27b0', subtitle: 'Current fiscal year' },
        ];
      case 'hr_personnel':
        return [
          { title: 'Total Employees', value: stats.hr.totalEmployees, icon: <People />, color: '#2196f3', subtitle: 'Active staff' },
          { title: 'Leave Requests', value: stats.hr.activeLeaveRequests, icon: <Event />, color: '#4caf50', subtitle: 'Pending approval' },
          { title: 'Performance Reviews', value: stats.hr.pendingReviews, icon: <Assignment />, color: '#ff9800', subtitle: 'Due this month' },
          { title: 'Assets Assigned', value: stats.hr.assetsAssigned, icon: <TrendingUp />, color: '#9c27b0', subtitle: 'Total assets' },
        ];
      default:
        return [];
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          {getWelcomeMessage()}
        </Typography>
        <Typography variant="body1">
          Welcome to the Educational ERP System. Here's your dashboard overview.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={user?.role?.replace('_', ' ').toUpperCase()} 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: 'white',
              fontWeight: 'bold'
            }} 
          />
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {getRoleBasedStats().map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Box>
                {recentActivities.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {activity.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {activity.description}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {user?.role === 'student' && (
                  <>
                    <Chip label="View Grades" clickable color="primary" />
                    <Chip label="Check Attendance" clickable color="secondary" />
                    <Chip label="Pay Fees" clickable color="success" />
                  </>
                )}
                {user?.role === 'academic_staff' && (
                  <>
                    <Chip label="Grade Assignments" clickable color="primary" />
                    <Chip label="Mark Attendance" clickable color="secondary" />
                    <Chip label="Schedule Exam" clickable color="success" />
                  </>
                )}
                {user?.role === 'finance_staff' && (
                  <>
                    <Chip label="Generate Invoice" clickable color="primary" />
                    <Chip label="Process Payment" clickable color="secondary" />
                    <Chip label="View Reports" clickable color="success" />
                  </>
                )}
                {user?.role === 'hr_personnel' && (
                  <>
                    <Chip label="Add Employee" clickable color="primary" />
                    <Chip label="Process Payroll" clickable color="secondary" />
                    <Chip label="Approve Leave" clickable color="success" />
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Chip label="System Settings" clickable color="primary" />
                    <Chip label="User Management" clickable color="secondary" />
                    <Chip label="View Reports" clickable color="success" />
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
