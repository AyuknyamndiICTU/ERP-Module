import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  School,
  AttachMoney,
  People,
  TrendingUp,
  Assignment,
  Event,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = {
    academic: {
      totalCourses: 45,
      totalStudents: 1250,
      activeEnrollments: 3200,
      averageGPA: 3.2,
    },
    finance: {
      totalRevenue: 2500000,
      pendingPayments: 125000,
      monthlyGrowth: 8.5,
      activeCampaigns: 12,
    },
    hr: {
      totalEmployees: 180,
      activeLeaveRequests: 8,
      pendingReviews: 15,
      assetsAssigned: 340,
    },
  };

  const recentActivities = [
    {
      id: 1,
      type: 'academic',
      title: 'New course enrollment',
      description: 'Computer Science 101 - 25 new students enrolled',
      time: '2 hours ago',
      icon: <School />,
    },
    {
      id: 2,
      type: 'finance',
      title: 'Payment received',
      description: '$15,000 tuition payment processed',
      time: '4 hours ago',
      icon: <AttachMoney />,
    },
    {
      id: 3,
      type: 'hr',
      title: 'Leave request approved',
      description: 'John Doe - Vacation leave approved',
      time: '6 hours ago',
      icon: <People />,
    },
    {
      id: 4,
      type: 'academic',
      title: 'Grade submission',
      description: 'Mathematics 201 - Final grades submitted',
      time: '1 day ago',
      icon: <Assignment />,
    },
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    
    return `${greeting}, ${user?.firstName}!`;
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
