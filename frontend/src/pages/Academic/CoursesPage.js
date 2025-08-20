import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,

  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  keyframes,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard, { FeatureCard } from '../../components/GlassCard';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Mock data for demonstration
  const mockCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science and programming',
      credits: 3,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Dr. John Smith',
      department_name: 'Computer Science',
      enrolled_count: 45,
      capacity: 50,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '10:00 AM - 11:00 AM',
        room: 'CS-101'
      },
      status: 'active'
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus II',
      description: 'Advanced calculus including integration techniques and series',
      credits: 4,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Dr. Sarah Johnson',
      department_name: 'Mathematics',
      enrolled_count: 38,
      capacity: 40,
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '2:00 PM - 3:30 PM',
        room: 'MATH-205'
      },
      status: 'active'
    },
    {
      id: 3,
      code: 'ENG102',
      name: 'English Composition',
      description: 'Advanced writing and composition skills',
      credits: 3,
      semester: 'Spring',
      year: 2024,
      instructor_name: 'Prof. Emily Davis',
      department_name: 'English',
      enrolled_count: 28,
      capacity: 30,
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: '1:00 PM - 2:30 PM',
        room: 'ENG-110'
      },
      status: 'active'
    },
    {
      id: 4,
      code: 'PHYS301',
      name: 'Quantum Physics',
      description: 'Introduction to quantum mechanics and modern physics',
      credits: 4,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Dr. Michael Chen',
      department_name: 'Physics',
      enrolled_count: 22,
      capacity: 25,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '11:00 AM - 12:00 PM',
        room: 'PHYS-201'
      },
      status: 'active'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = !selectedSemester || course.semester === selectedSemester;
    const matchesDepartment = !selectedDepartment || course.department_name === selectedDepartment;

    return matchesSearch && matchesSemester && matchesDepartment;
  });

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCourseDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getEnrollmentColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#f59e0b';
    return '#10b981';
  };

  const CourseCard = ({ course, index }) => (
    <FeatureCard
      sx={{
        animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
        cursor: 'pointer',
        height: '100%',
      }}
      onClick={() => handleCourseClick(course)}
    >
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
              {course.code}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {course.department_name}
            </Typography>
          </Box>
          <Chip
            label={course.status}
            color={getStatusColor(course.status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {course.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 32,
              height: 32,
              mr: 1,
            }}
          >
            <PersonIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography variant="body2" fontWeight="600">
            {course.instructor_name}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {course.credits} Credits
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {course.semester} {course.year}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {course.enrolled_count}/{course.capacity}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 6,
              borderRadius: 3,
              background: '#f3f4f6',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${(course.enrolled_count / course.capacity) * 100}%`,
                height: '100%',
                background: getEnrollmentColor(course.enrolled_count, course.capacity),
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      </Box>
    </FeatureCard>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, animation: `${slideIn} 0.8s ease-out` }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 800,
            mb: 1,
          }}
        >
          Course Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage courses, schedules, and enrollments
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <GlassCard sx={{ mb: 4, animation: `${fadeInUp} 0.8s ease-out 0.2s both` }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{ minWidth: 120 }}
          >
            Filters
          </Button>

          {(user?.role === 'admin' || user?.role === 'academic_staff') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minWidth: 140,
              }}
            >
              Add Course
            </Button>
          )}
        </Box>
      </GlassCard>

      {/* Courses Grid */}
      <Grid container spacing={3}>
        {filteredCourses.map((course, index) => (
          <Grid item xs={12} sm={6} lg={4} key={course.id}>
            <CourseCard course={course} index={index} />
          </Grid>
        ))}
      </Grid>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
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
              <MenuItem value="Mathematics">Mathematics</MenuItem>
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Physics">Physics</MenuItem>
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
      >
        {selectedCourse && (
          <>
            <DialogTitle>
              <Typography variant="h5" fontWeight="700">
                {selectedCourse.code} - {selectedCourse.name}
              </Typography>
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
                    <strong>Department:</strong> {selectedCourse.department_name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Instructor:</strong> {selectedCourse.instructor_name}
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
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCourseDialogOpen(false)}>
                Close
              </Button>
              {(user?.role === 'admin' || user?.role === 'academic_staff') && (
                <Button variant="contained" startIcon={<EditIcon />}>
                  Edit Course
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CoursesPage;
