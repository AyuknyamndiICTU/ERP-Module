import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  CardActions,
  Menu,
  keyframes,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Science as ScienceIcon,
  Business as BusinessIcon,
  Engineering as EngineeringIcon,
  Computer as ComputerIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { academicAPI } from '../../services/api';

// Mock data for fallback when API is unavailable
const mockCourses = [
  {
    id: 1,
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science and programming fundamentals',
    instructorName: 'Dr. John Smith',
    credits: 3,
    department: 'Computer Science',
    semester: 'Fall',
    academicYear: 2024,
    difficulty: 'Undergraduate',
    status: 'active',
    category: 'core',
    maxEnrollment: 50,
    currentEnrollment: 35,
    prerequisites: 'None',
    faculty: 'Faculty of Engineering and Technology',
    schedule: 'MWF 10:00-11:00 AM'
  },
  {
    id: 2,
    courseCode: 'MATH201',
    courseName: 'Advanced Mathematics',
    description: 'Advanced mathematical concepts for engineering students',
    instructorName: 'Prof. Jane Doe',
    credits: 4,
    department: 'Mathematics',
    semester: 'Spring',
    academicYear: 2024,
    difficulty: 'Undergraduate',
    status: 'active',
    category: 'core',
    maxEnrollment: 40,
    currentEnrollment: 28,
    prerequisites: 'MATH101',
    faculty: 'Faculty of Sciences',
    schedule: 'TTH 2:00-3:30 PM'
  },
  {
    id: 3,
    courseCode: 'BA301',
    courseName: 'Principles of Management',
    description: 'Introduction to business management principles and practices',
    instructorName: 'Dr. Sarah Wilson',
    credits: 3,
    department: 'Business Administration',
    semester: 'Fall',
    academicYear: 2024,
    difficulty: 'Undergraduate',
    status: 'active',
    category: 'core',
    maxEnrollment: 45,
    currentEnrollment: 32,
    prerequisites: 'BA101',
    faculty: 'Faculty of Business and Management',
    schedule: 'MWF 1:00-2:00 PM'
  }
];
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

const CoursesPage = () => {
  const { user } = useAuth();

  // Development logging helper
  const devLog = (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  };
  
  // State management
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state for adding/editing courses
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    instructor: '',
    credits: '',
    department: '',
    semester: '',
    schedule: '',
    category: 'core',
    difficulty: 'Undergraduate',
    academicYear: new Date().getFullYear().toString(),
    maxEnrollment: '50',
    prerequisites: '',
    status: 'active',
    faculty: ''
  });

  // Permission check
  const canManageCourses = user?.role === 'admin' || user?.role === 'system_admin' || 
                          user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || 
                          user?.role === 'major_coordinator';

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Programming': return <CodeIcon fontSize="small" />;
      case 'Business': return <BusinessIcon fontSize="small" />;
      case 'Engineering': return <EngineeringIcon fontSize="small" />;
      case 'Web Development': return <ComputerIcon fontSize="small" />;
      case 'Networking': return <SchoolIcon fontSize="small" />;
      case 'Database': return <SchoolIcon fontSize="small" />;
      case 'Artificial Intelligence': return <TrendingUpIcon fontSize="small" />;
      default: return <SchoolIcon fontSize="small" />;
    }
  };

  // Helper function to get course color based on difficulty
  const getCourseColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'undergraduate':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'master':
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'phd':
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  // Transform course data to match ICTUCoursesPage format
  const transformCourseData = (course) => {
    return {
      id: course.id,
      code: course.courseCode || course.code,
      name: course.courseName || course.name,
      description: course.description || 'No description available',
      credits: course.credits || 3,
      semester: course.semester || 'Fall',
      year: course.academicYear || new Date().getFullYear(),
      instructor_name: course.instructorName || 'To Be Assigned',
      instructor_avatar: course.instructorName ? course.instructorName.split(' ').map(n => n[0]).join('').toUpperCase() : 'TBA',
      department_name: course.department || 'General',
      faculty: course.faculty || 'Faculty of Engineering and Technology',
      enrolled_count: course.currentEnrollment || 0,
      capacity: course.maxEnrollment || 50,
      progress: Math.floor(Math.random() * 100), // Mock progress for now
      difficulty: course.difficulty || 'Undergraduate',
      rating: 4.5 + Math.random() * 0.5, // Mock rating
      color: getCourseColor(course.difficulty),
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '10:00 AM - 11:00 AM',
        room: 'Room TBA'
      },
      status: course.status || 'active',
      category: course.category || 'General',
      prerequisites: course.prerequisites || 'None',
      objectives: [
        'Master fundamental concepts',
        'Apply practical skills',
        'Develop problem-solving abilities'
      ]
    };
  };

  // Fetch courses from API with rate limiting handling
  const fetchCourses = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      devLog('Fetching courses...');
      
      // Add a small delay to prevent rate limiting
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
      
      const response = await academicAPI.getCourses();
      devLog('Courses response:', response);
      
      // Handle different response structures
      const success = response?.data?.success || response?.success || (response?.status >= 200 && response?.status < 300);
      const coursesData = response?.data?.data || response?.data?.courses || response?.data || [];
      
      if (success && Array.isArray(coursesData)) {
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        devLog('Courses loaded successfully:', coursesData.length, 'courses');
      } else {
        // Fallback to mock data if API fails
        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
      }
    } catch (error) {
      devLog('Error fetching courses:', error);
      
      // Handle rate limiting specifically
      if (error?.response?.status === 429 && retryCount < 2) {
        devLog(`Rate limited, retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => fetchCourses(retryCount + 1), (retryCount + 1) * 2000);
        return;
      }
      
      // For other errors or max retries reached, use fallback data
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'API error';
      
      // Only show warning for non-rate-limit errors or after max retries
      if (error?.response?.status !== 429 || retryCount >= 2) {
        showSnackbar(`Using sample data - ${errorMessage}`, 'warning');
      }
    } finally {
      setLoading(false);
    }
  }, [devLog]);

  useEffect(() => {
    // Only fetch courses once when component mounts
    const timeoutId = setTimeout(() => {
      fetchCourses();
    }, 100); // Small delay to prevent rapid API calls

    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array to run only once

  // Filter courses
  useEffect(() => {
    let filtered = courses.filter(course => {
      const matchesSearch =
        course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSemester = !selectedSemester || course.semester === selectedSemester;
      const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;

      return matchesSearch && matchesSemester && matchesDepartment;
    });
    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedSemester, selectedDepartment]);

  // Utility functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const handleCourseClick = (course) => {
    setSelectedCourse(transformCourseData(course));
    setCourseDialogOpen(true);
  };

  const handleAddCourse = () => {
    setAddCourseDialogOpen(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.courseName || course.name || '',
      code: course.courseCode || course.code || '',
      description: course.description || '',
      instructor: course.instructorName || course.instructor || '',
      credits: course.credits?.toString() || '',
      department: course.department || '',
      semester: course.semester || '',
      schedule: course.schedule || '',
      category: course.category || 'core',
      difficulty: course.difficulty || 'Undergraduate',
      academicYear: course.academicYear?.toString() || new Date().getFullYear().toString(),
      maxEnrollment: course.maxEnrollment?.toString() || '50',
      prerequisites: course.prerequisites || '',
      status: course.status || 'active',
      faculty: course.faculty || ''
    });
    setAddCourseDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        devLog('Deleting course with ID:', courseId);
        const response = await academicAPI.deleteCourse(courseId);
        devLog('Delete response:', response);
        
        // Handle different response structures
        const success = response?.data?.success || response?.success || (response?.status >= 200 && response?.status < 300);
        
        if (success) {
          showSnackbar('Course deleted successfully', 'success');
          fetchCourses();
        } else {
          const errorMessage = response?.data?.error || response?.data?.message || response?.message || 'Failed to delete course';
          showSnackbar(errorMessage, 'error');
        }
      } catch (error) {
        devLog('Error deleting course:', error);
        const errorMessage = error?.response?.data?.error || 
                            error?.response?.data?.message || 
                            error?.message || 
                            'Error deleting course';
        showSnackbar(errorMessage, 'error');
      }
    }
  };

  const handleSaveCourse = async () => {
    try {
      // Validate required fields
      if (!courseForm.name || !courseForm.code || !courseForm.instructor || !courseForm.credits) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      // Prepare course data with proper field mapping
      const courseData = {
        courseName: courseForm.name.trim(),
        courseCode: courseForm.code.trim().toUpperCase(),
        description: courseForm.description.trim(),
        instructorName: courseForm.instructor.trim(),
        credits: parseInt(courseForm.credits) || 3,
        department: courseForm.department,
        semester: courseForm.semester,
        schedule: courseForm.schedule.trim(),
        category: courseForm.category,
        difficulty: courseForm.difficulty,
        academicYear: parseInt(courseForm.academicYear) || new Date().getFullYear(),
        maxEnrollment: parseInt(courseForm.maxEnrollment) || 50,
        prerequisites: courseForm.prerequisites?.trim() || '',
        status: courseForm.status || 'active',
        faculty: courseForm.faculty?.trim() || ''
      };

      devLog('Saving course data:', courseData);

      let response;
      try {
        if (editingCourse) {
          devLog('Updating course with ID:', editingCourse.id);
          // Try different API endpoint patterns
          response = await academicAPI.updateCourse(editingCourse.id, courseData);
        } else {
          devLog('Creating new course');
          response = await academicAPI.createCourse(courseData);
        }
      } catch (apiError) {
        devLog('API call failed:', apiError);
        
        // If API fails, show a more specific error message
        if (apiError.response) {
          // Server responded with error status
          const status = apiError.response.status;
          const errorData = apiError.response.data;
          
          if (status === 429) {
            showSnackbar('Too many requests. Please wait a moment and try again.', 'warning');
          } else if (status === 404) {
            showSnackbar('API endpoint not found. Please check if the backend server is running.', 'error');
          } else if (status === 401) {
            showSnackbar('Authentication required. Please log in again.', 'error');
          } else if (status === 403) {
            showSnackbar('You do not have permission to perform this action.', 'error');
          } else if (status === 500) {
            showSnackbar(`Server error: ${errorData?.error || errorData?.message || 'Internal server error'}`, 'error');
          } else {
            showSnackbar(`Error ${status}: ${errorData?.error || errorData?.message || 'Unknown error'}`, 'error');
          }
        } else if (apiError.request) {
          // Network error
          showSnackbar('Network error. Please check your connection and ensure the backend server is running.', 'error');
        } else {
          // Other error
          showSnackbar(`Request error: ${apiError.message}`, 'error');
        }
        return;
      }

      devLog('API Response:', response);

      // Handle different response structures
      const success = response?.data?.success !== false && (response?.status >= 200 && response?.status < 300);
      
      if (success) {
        showSnackbar(
          editingCourse ? 'Course updated successfully' : 'Course created successfully',
          'success'
        );
        setAddCourseDialogOpen(false);
        setEditingCourse(null);
        setCourseForm({
          name: '',
          code: '',
          description: '',
          instructor: '',
          credits: '',
          department: '',
          semester: '',
          schedule: '',
          category: 'core',
          difficulty: 'Undergraduate',
          academicYear: new Date().getFullYear().toString(),
          maxEnrollment: '50',
          prerequisites: '',
          status: 'active',
          faculty: ''
        });
        fetchCourses();
      } else {
        const errorMessage = response?.data?.error || response?.data?.message || response?.message || 'Failed to save course';
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      devLog('Unexpected error saving course:', error);
      showSnackbar('An unexpected error occurred while saving the course', 'error');
    }
  };

  // ICTUCoursesPage-style CourseCard component
  const CourseCard = ({ course, index }) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeInUp} 0.6s ease-out ${index * 0.08}s both`,
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          transform: 'translateY(-10px) scale(1.01)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid rgba(25, 118, 210, 0.2)',
        }
      }}
      onClick={() => handleCourseClick(course)}
    >
      {/* Header with gradient */}
      <Box
        sx={{
          background: course.color,
          p: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" fontWeight="700" sx={{ color: 'white' }}>
                {course.code}
              </Typography>
              {getCategoryIcon(course.category)}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={course.difficulty}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              />
              {canManageCourses && (
                <Tooltip title="Edit Course">
                  <IconButton 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
            {course.name}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5, mb: 2 }}>
            {course.description?.substring(0, 100)}...
          </Typography>

          {/* Progress bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                Course Progress
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                {course.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={course.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </Box>

        {/* Decorative bubble */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            zIndex: 1
          }}
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Instructor */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              background: course.color,
              width: 40,
              height: 40,
              mr: 2,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {course.instructor_avatar}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="600" color="text.primary">
              {course.instructor_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {course.department_name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ color: '#fbbf24', fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="caption" fontWeight="600">
              {course.rating?.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        {/* Course Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {course.credits}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Credits
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {course.enrolled_count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Students
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {Math.max(1, Math.floor(course.progress / 10))}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Modules
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Enrollment Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Enrollment
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {course.enrolled_count}/{course.capacity}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(course.enrolled_count / course.capacity) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#f3f4f6',
              '& .MuiLinearProgress-bar': {
                background: course.color,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Faculty and Prerequisites */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Faculty: {course.faculty}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Prerequisites: {course.prerequisites}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {course.semester} {course.year} • {course.category}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canManageCourses && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCourse(course.id);
              }}
              color="error"
              sx={{ textTransform: 'none' }}
            >
              Delete
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayIcon />}
            sx={{
              background: course.color,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: course.color,
                opacity: 0.9,
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, animation: `${slideInLeft} 0.8s ease-out` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '2rem', sm: '3rem' },
              }}
            >
              Course Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Explore our comprehensive course catalog and manage academic programs
            </Typography>
          </Box>
          
          {canManageCourses && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCourse}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                borderRadius: 3,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(25, 118, 210, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Add Course
            </Button>
          )}
        </Box>
      </Box>

      {/* Search and Filter Bar */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search courses, instructors, departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flexGrow: 1, 
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
              sx={{ 
                minWidth: 120,
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Featured Courses Section */}
          {filteredCourses.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: 'text.primary' }}>
                Featured Courses
              </Typography>
              
              <Grid container spacing={3}>
                {filteredCourses.slice(0, 2).map((course, index) => (
                  <Grid item xs={12} md={6} key={course.id}>
                    <CourseCard course={transformCourseData(course)} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* All Courses Section */}
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: 'text.primary' }}>
              All Courses ({filteredCourses.length})
            </Typography>
            
            {filteredCourses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No courses found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {searchTerm || selectedSemester || selectedDepartment 
                    ? 'Try adjusting your search filters'
                    : 'Start by adding your first course'
                  }
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredCourses.map((course, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={course.id}>
                    <CourseCard course={transformCourseData(course)} index={index + 2} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 200,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Semester</InputLabel>
            <Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              label="Semester"
            >
              <MenuItem value="">All Semesters</MenuItem>
              <MenuItem value="Fall">Fall</MenuItem>
              <MenuItem value="Spring">Spring</MenuItem>
              <MenuItem value="Summer">Summer</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              label="Department"
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="Computer Science">Computer Science</MenuItem>
              <MenuItem value="Software Engineering">Software Engineering</MenuItem>
              <MenuItem value="Business Administration">Business Administration</MenuItem>
              <MenuItem value="Network Engineering">Network Engineering</MenuItem>
              <MenuItem value="Information Systems">Information Systems</MenuItem>
              <MenuItem value="Web Technologies">Web Technologies</MenuItem>
              <MenuItem value="Artificial Intelligence">Artificial Intelligence</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      {/* Course Details Dialog */}
      <Dialog
        open={courseDialogOpen}
        onClose={() => setCourseDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    background: selectedCourse.color,
                    width: 50,
                    height: 50,
                  }}
                >
                  {selectedCourse.instructor_avatar}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="700">
                    {selectedCourse.code} - {selectedCourse.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Instructor: {selectedCourse.instructor_name} • {selectedCourse.department_name}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Course Information
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Description:</strong> {selectedCourse.description}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Credits:</strong> {selectedCourse.credits}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Faculty:</strong> {selectedCourse.faculty}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Difficulty:</strong> {selectedCourse.difficulty}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Rating:</strong> {selectedCourse.rating?.toFixed(1)}/5.0
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Schedule & Enrollment
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Semester:</strong> {selectedCourse.semester} {selectedCourse.year}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Schedule:</strong> {selectedCourse.schedule?.days?.join(', ')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Time:</strong> {selectedCourse.schedule?.time}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Room:</strong> {selectedCourse.schedule?.room}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Enrollment:</strong> {selectedCourse.enrolled_count}/{selectedCourse.capacity}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Progress:</strong> {selectedCourse.progress}%
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Prerequisites:</strong> {selectedCourse.prerequisites}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Learning Objectives
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                    {selectedCourse.objectives?.map((objective, idx) => (
                      <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                        {objective}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setCourseDialogOpen(false)}>
                Close
              </Button>
              {canManageCourses && (
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setCourseDialogOpen(false);
                    handleEditCourse(selectedCourse);
                  }}
                  sx={{
                    background: selectedCourse.color,
                    '&:hover': {
                      background: selectedCourse.color,
                      opacity: 0.9,
                    },
                  }}
                >
                  Edit Course
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Course Dialog */}
      <Dialog
        open={addCourseDialogOpen}
        onClose={() => {
          setAddCourseDialogOpen(false);
          setEditingCourse(null);
          setCourseForm({
            name: '',
            code: '',
            description: '',
            instructor: '',
            credits: '',
            department: '',
            semester: '',
            schedule: '',
            category: 'core',
            difficulty: 'Undergraduate',
            academicYear: new Date().getFullYear().toString(),
            maxEnrollment: '50',
            prerequisites: '',
            status: 'active',
            faculty: ''
          });
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="700">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Name"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course Code"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  multiline
                  rows={3}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instructor Name"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Credits"
                  type="number"
                  value={courseForm.credits}
                  onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                  required
                  inputProps={{ min: 1, max: 6 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={courseForm.department}
                    onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                    label="Department"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Software Engineering">Software Engineering</MenuItem>
                    <MenuItem value="Business Administration">Business Administration</MenuItem>
                    <MenuItem value="Network Engineering">Network Engineering</MenuItem>
                    <MenuItem value="Information Systems">Information Systems</MenuItem>
                    <MenuItem value="Web Technologies">Web Technologies</MenuItem>
                    <MenuItem value="Artificial Intelligence">Artificial Intelligence</MenuItem>
                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                    <MenuItem value="Physics">Physics</MenuItem>
                    <MenuItem value="Chemistry">Chemistry</MenuItem>
                    <MenuItem value="Biology">Biology</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                    label="Semester"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Fall">Fall</MenuItem>
                    <MenuItem value="Spring">Spring</MenuItem>
                    <MenuItem value="Summer">Summer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Schedule"
                  value={courseForm.schedule}
                  onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })}
                  placeholder="e.g., MWF 10:00-11:00 AM"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    label="Category"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="core">Core</MenuItem>
                    <MenuItem value="elective">Elective</MenuItem>
                    <MenuItem value="lab">Lab</MenuItem>
                    <MenuItem value="seminar">Seminar</MenuItem>
                    <MenuItem value="project">Project</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                    label="Difficulty Level"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                    <MenuItem value="Master">Master</MenuItem>
                    <MenuItem value="PhD">PhD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  type="number"
                  value={courseForm.academicYear}
                  onChange={(e) => setCourseForm({ ...courseForm, academicYear: e.target.value })}
                  placeholder="e.g., 2024"
                  inputProps={{ min: 2020, max: 2030 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Enrollment"
                  type="number"
                  value={courseForm.maxEnrollment}
                  onChange={(e) => setCourseForm({ ...courseForm, maxEnrollment: e.target.value })}
                  placeholder="e.g., 50"
                  inputProps={{ min: 1, max: 200 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prerequisites"
                  value={courseForm.prerequisites}
                  onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })}
                  placeholder="e.g., CSC101, MATH201"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    label="Status"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Faculty"
                  value={courseForm.faculty}
                  onChange={(e) => setCourseForm({ ...courseForm, faculty: e.target.value })}
                  placeholder="e.g., Faculty of Engineering and Technology"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => {
              setAddCourseDialogOpen(false);
              setEditingCourse(null);
              setCourseForm({
                name: '',
                code: '',
                description: '',
                instructor: '',
                credits: '',
                department: '',
                semester: '',
                schedule: '',
                category: 'core',
                difficulty: 'Undergraduate',
                academicYear: new Date().getFullYear().toString(),
                maxEnrollment: '50',
                prerequisites: '',
                status: 'active',
                faculty: ''
              });
            }}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCourse}
            variant="contained"
            disabled={!courseForm.name || !courseForm.code || !courseForm.instructor || !courseForm.credits || !courseForm.department || !courseForm.semester}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              },
            }}
          >
            {editingCourse ? 'Update Course' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoursesPage;
