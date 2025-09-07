import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Assignment,
  School,
  People,
  Assessment,
  Schedule,
  Payment,
  Work,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RoleGuard from '../common/RoleGuard';

const QuickActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const quickActions = [
    {
      title: 'Add Course',
      description: 'Create new course',
      icon: <School />,
      color: '#4caf50',
      roles: ['admin', 'teacher'],
      action: () => navigate('/courses/new')
    },
    {
      title: 'Add Student',
      description: 'Register new student',
      icon: <People />,
      color: '#2196f3',
      roles: ['admin'],
      action: () => navigate('/students/new')
    },
    {
      title: 'Create Assignment',
      description: 'New assignment',
      icon: <Assignment />,
      color: '#ff9800',
      roles: ['admin', 'teacher'],
      action: () => navigate('/assignments/new')
    },
    {
      title: 'Grade Students',
      description: 'Enter grades',
      icon: <Assessment />,
      color: '#9c27b0',
      roles: ['admin', 'teacher'],
      action: () => navigate('/grades')
    },
    {
      title: 'Take Attendance',
      description: 'Mark attendance',
      icon: <Schedule />,
      color: '#f44336',
      roles: ['admin', 'teacher'],
      action: () => navigate('/attendance')
    },
    {
      title: 'Process Payment',
      description: 'Handle payments',
      icon: <Payment />,
      color: '#00bcd4',
      roles: ['admin', 'finance_staff'],
      action: () => navigate('/finance/payments')
    },
    {
      title: 'HR Management',
      description: 'Manage employees',
      icon: <Work />,
      color: '#795548',
      roles: ['admin', 'hr_staff'],
      action: () => navigate('/hr/employees')
    },
    {
      title: 'System Settings',
      description: 'Configure system',
      icon: <Settings />,
      color: '#607d8b',
      roles: ['admin'],
      action: () => navigate('/settings')
    }
  ];

  const getVisibleActions = () => {
    return quickActions.filter(action => 
      action.roles.includes(user?.role)
    );
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          fontWeight: 'bold',
          color: 'text.primary'
        }}
      >
        Quick Actions
      </Typography>
      
      <Grid container spacing={2}>
        {getVisibleActions().map((action, index) => (
          <Grid 
            item 
            xs={6} 
            sm={4} 
            md={3} 
            lg={2} 
            key={index}
          >
            <RoleGuard allowedRoles={action.roles}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  minHeight: isMobile ? 120 : 140,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    '& .action-icon': {
                      transform: 'scale(1.1)',
                    }
                  },
                  background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}25 100%)`,
                  border: `1px solid ${action.color}30`
                }}
                onClick={action.action}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%',
                    p: isMobile ? 1.5 : 2,
                    '&:last-child': { pb: isMobile ? 1.5 : 2 }
                  }}
                >
                  <Box
                    className="action-icon"
                    sx={{
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      borderRadius: '50%',
                      bgcolor: action.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      transition: 'transform 0.3s ease',
                      '& svg': {
                        color: 'white',
                        fontSize: isMobile ? 20 : 24
                      }
                    }}
                  >
                    {action.icon}
                  </Box>
                  
                  <Typography
                    variant={isMobile ? "body2" : "subtitle2"}
                    sx={{
                      fontWeight: 'bold',
                      color: 'text.primary',
                      mb: 0.5,
                      lineHeight: 1.2
                    }}
                  >
                    {action.title}
                  </Typography>
                  
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      lineHeight: 1.2
                    }}
                  >
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </RoleGuard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions;
