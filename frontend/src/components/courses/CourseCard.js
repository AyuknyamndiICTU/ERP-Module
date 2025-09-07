import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Avatar,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person,
  School,
  Schedule,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../common/RoleGuard';

const CourseCard = ({ course, onEdit, onDelete, onView }) => {
  const { user } = useAuth();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCreditColor = (credits) => {
    if (credits >= 4) return '#4caf50';
    if (credits >= 3) return '#ff9800';
    return '#f44336';
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        },
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header with Course Code and Status */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {course.course_code}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {course.semester} • {course.academic_year}
            </Typography>
          </Box>
          <Chip
            label={course.status || 'Active'}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Course Name */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
            color: 'text.primary',
            lineHeight: 1.3
          }}
        >
          {course.course_name}
        </Typography>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5em'
          }}
        >
          {course.description || 'No description available'}
        </Typography>

        {/* Course Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Instructor */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {course.instructor_name || 'TBA'}
            </Typography>
          </Box>

          {/* Credits and Students */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <School sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {course.credits || 3} Credits
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: getCreditColor(course.credits || 3),
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              >
                {course.enrolled_students || 0}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                Students
              </Typography>
            </Box>
          </Box>

          {/* Schedule */}
          {course.schedule && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {course.schedule}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => onView && onView(course)}
          sx={{ textTransform: 'none' }}
        >
          View Details
        </Button>

        <Box>
          <RoleGuard allowedRoles={['admin', 'teacher']}>
            <Tooltip title="Edit Course">
              <IconButton
                size="small"
                onClick={() => onEdit && onEdit(course)}
                sx={{ mr: 1 }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          </RoleGuard>

          <RoleGuard allowedRoles={['admin']}>
            <Tooltip title="Delete Course">
              <IconButton
                size="small"
                onClick={() => onDelete && onDelete(course)}
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </RoleGuard>
        </Box>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
