import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import GlassCard, { GradientCard, StatsCard, FeatureCard } from '../../components/GlassCard';
import { FormDialog, ConfirmDialog } from '../../components/Common/DialogComponents';
import logger from '../../utils/logger';

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
  const navigate = useNavigate();

  // Dialog states
  const [quickActionDialog, setQuickActionDialog] = useState({
    open: false,
    type: '',
    title: '',
    fields: [],
  });

  // Mock data for demonstration
  const stats = {
    academic: {
      totalStudents: 2847,
      totalCourses: 156,
      activeEnrollments: 3245,
      averageGrade: 85.4
    },
    finance: {
      totalRevenue: 1250000,
      monthlyGrowth: 12.5,
      pendingInvoices: 45,
      activeCampaigns: 8
    },
    hr: {
      totalEmployees: 89,
      activeLeaveRequests: 12,
      pendingReviews: 23,
      assetsAssigned: 156
    }
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
        setQuickActionDialog({
          open: true,
          type: 'scheduleExam',
          title: 'Schedule Exam',
          fields: [
            { name: 'course', label: 'Course', type: 'select', required: true, options: [
              { value: 'CS101', label: 'Computer Science 101' },
              { value: 'MATH201', label: 'Mathematics 201' }
            ]},
            { name: 'examType', label: 'Exam Type', type: 'select', required: true, options: [
              { value: 'midterm', label: 'Midterm' },
              { value: 'final', label: 'Final' },
              { value: 'quiz', label: 'Quiz' }
            ]},
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'time', label: 'Time', type: 'time', required: true },
            { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true },
            { name: 'location', label: 'Location', type: 'text', required: true }
          ]
        });
        break;
      case 'generateInvoice':
        setQuickActionDialog({
          open: true,
          type: 'generateInvoice',
          title: 'Generate Invoice',
          fields: [
            { name: 'student', label: 'Student', type: 'select', required: true, options: [
              { value: 'student1', label: 'Alice Johnson' },
              { value: 'student2', label: 'Bob Smith' }
            ]},
            { name: 'feeType', label: 'Fee Type', type: 'select', required: true, options: [
              { value: 'tuition', label: 'Tuition Fee' },
              { value: 'library', label: 'Library Fee' },
              { value: 'lab', label: 'Lab Fee' }
            ]},
            { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0 },
            { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
            { name: 'description', label: 'Description', type: 'textarea', rows: 3 }
          ]
        });
        break;
      case 'processPayment':
        navigate('/finance/payments');
        break;
      case 'viewReports':
        navigate('/finance/reports');
        break;
      case 'addEmployee':
        setQuickActionDialog({
          open: true,
          type: 'addEmployee',
          title: 'Add New Employee',
          fields: [
            { name: 'firstName', label: 'First Name', type: 'text', required: true, width: 6 },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true, width: 6 },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Phone', type: 'text', required: true },
            { name: 'position', label: 'Position', type: 'select', required: true, options: [
              { value: 'teacher', label: 'Teacher' },
              { value: 'admin', label: 'Administrator' },
              { value: 'support', label: 'Support Staff' }
            ]},
            { name: 'department', label: 'Department', type: 'select', required: true, options: [
              { value: 'academic', label: 'Academic' },
              { value: 'hr', label: 'Human Resources' },
              { value: 'finance', label: 'Finance' }
            ]},
            { name: 'salary', label: 'Salary', type: 'number', required: true, min: 0 },
            { name: 'startDate', label: 'Start Date', type: 'date', required: true }
          ]
        });
        break;
      case 'processPayroll':
        navigate('/hr/payroll');
        break;
      case 'approveLeave':
        navigate('/hr/leave');
        break;
      case 'systemSettings':
        navigate('/settings');
        break;
      case 'userManagement':
        navigate('/admin/users');
        break;
      default:
        logger.debug('Action not implemented:', actionType);
    }
  };

  const handleQuickActionSave = (data) => {
    logger.debug('Saving quick action data:', quickActionDialog.type, data);
    // Here you would typically make an API call
    setQuickActionDialog({ open: false, type: '', title: '', fields: [] });
  };

  const getRoleBasedStats = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Total Students', value: stats.academic.totalStudents, icon: <SchoolIcon />, color: 'primary', subtitle: 'Active enrollments' },
          { title: 'Total Revenue', value: `$${(stats.finance.totalRevenue / 1000000).toFixed(1)}M`, icon: <MoneyIcon />, color: 'success', subtitle: 'This academic year' },
          { title: 'Total Employees', value: stats.hr.totalEmployees, icon: <PeopleIcon />, color: 'warning', subtitle: 'Active staff' },
          { title: 'Growth Rate', value: `${stats.finance.monthlyGrowth}%`, icon: <TrendingUpIcon />, color: 'secondary', subtitle: 'Monthly growth' },
        ];
      case 'academic_staff':
        return [
          { title: 'My Courses', value: 8, icon: <SchoolIcon />, color: 'primary', subtitle: 'Active courses' },
          { title: 'Total Students', value: 245, icon: <PeopleIcon />, color: 'success', subtitle: 'Enrolled students' },
          { title: 'Pending Grades', value: 12, icon: <AssignmentIcon />, color: 'warning', subtitle: 'To be graded' },
          { title: 'Attendance Rate', value: '92%', icon: <EventIcon />, color: 'secondary', subtitle: 'Average attendance' },
        ];
      case 'student':
        return [
          { title: 'Enrolled Courses', value: 6, icon: <SchoolIcon />, color: 'primary', subtitle: 'Current semester' },
          { title: 'Current GPA', value: '3.7', icon: <TrendingUpIcon />, color: 'success', subtitle: 'Cumulative GPA' },
          { title: 'Attendance', value: '95%', icon: <EventIcon />, color: 'warning', subtitle: 'This semester' },
          { title: 'Credits Earned', value: 78, icon: <AssignmentIcon />, color: 'secondary', subtitle: 'Total credits' },
        ];
      case 'finance_staff':
        return [
          { title: 'Pending Invoices', value: 45, icon: <MoneyIcon />, color: 'primary', subtitle: 'Awaiting payment' },
          { title: 'Monthly Revenue', value: '$125K', icon: <TrendingUpIcon />, color: 'success', subtitle: 'This month' },
          { title: 'Active Campaigns', value: stats.finance.activeCampaigns, icon: <EventIcon />, color: 'warning', subtitle: 'Marketing campaigns' },
          { title: 'Budget Utilization', value: '78%', icon: <AssignmentIcon />, color: 'secondary', subtitle: 'Current fiscal year' },
        ];
      case 'hr_personnel':
        return [
          { title: 'Total Employees', value: stats.hr.totalEmployees, icon: <PeopleIcon />, color: 'primary', subtitle: 'Active staff' },
          { title: 'Leave Requests', value: stats.hr.activeLeaveRequests, icon: <EventIcon />, color: 'success', subtitle: 'Pending approval' },
          { title: 'Performance Reviews', value: stats.hr.pendingReviews, icon: <AssignmentIcon />, color: 'warning', subtitle: 'Due this month' },
          { title: 'Assets Assigned', value: stats.hr.assetsAssigned, icon: <TrendingUpIcon />, color: 'secondary', subtitle: 'Total assets' },
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
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <GlassCard>
            <Box sx={{ p: 2 }}>
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
            </Box>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <GlassCard>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {user?.role === 'student' && (
                  <>
                    <Chip label="View Grades" clickable color="primary" onClick={() => handleQuickAction('viewGrades')} />
                    <Chip label="Check Attendance" clickable color="secondary" onClick={() => handleQuickAction('checkAttendance')} />
                    <Chip label="Pay Fees" clickable color="success" onClick={() => handleQuickAction('payFees')} />
                  </>
                )}
                {user?.role === 'academic_staff' && (
                  <>
                    <Chip label="Grade Assignments" clickable color="primary" onClick={() => handleQuickAction('gradeAssignments')} />
                    <Chip label="Mark Attendance" clickable color="secondary" onClick={() => handleQuickAction('markAttendance')} />
                    <Chip label="Schedule Exam" clickable color="success" onClick={() => handleQuickAction('scheduleExam')} />
                  </>
                )}
                {user?.role === 'finance_staff' && (
                  <>
                    <Chip label="Generate Invoice" clickable color="primary" onClick={() => handleQuickAction('generateInvoice')} />
                    <Chip label="Process Payment" clickable color="secondary" onClick={() => handleQuickAction('processPayment')} />
                    <Chip label="View Reports" clickable color="success" onClick={() => handleQuickAction('viewReports')} />
                  </>
                )}
                {user?.role === 'hr_personnel' && (
                  <>
                    <Chip label="Add Employee" clickable color="primary" onClick={() => handleQuickAction('addEmployee')} />
                    <Chip label="Process Payroll" clickable color="secondary" onClick={() => handleQuickAction('processPayroll')} />
                    <Chip label="Approve Leave" clickable color="success" onClick={() => handleQuickAction('approveLeave')} />
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Chip label="System Settings" clickable color="primary" onClick={() => handleQuickAction('systemSettings')} />
                    <Chip label="User Management" clickable color="secondary" onClick={() => handleQuickAction('userManagement')} />
                    <Chip label="View Reports" clickable color="success" onClick={() => handleQuickAction('viewReports')} />
                  </>
                )}
              </Box>
            </Box>
          </GlassCard>
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
    </Box>
  );
};

export default DashboardPage;
