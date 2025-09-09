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
  const [addCourseDialog, setAddCourseDialog] = useState(false);
  const [restrictionDialog, setRestrictionDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    description: '',
    lecturer: '',
    credits: '',
    semester: '',
    department: '',
    maxStudents: ''
  });

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

  const handleAddCourse = () => {
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') {
      setAddCourseDialog(true);
    } else {
      setRestrictionDialog(true);
    }
  };

  const handleSaveCourse = () => {
    // Validate required fields
    if (!newCourse.code || !newCourse.name || !newCourse.lecturer) {
      alert('Please fill in all required fields');
      return;
    }

    // Add the new course to the list
    const courseToAdd = {
      id: courses.length + 1,
      code: newCourse.code,
      name: newCourse.name,
      description: newCourse.description,
      instructor_name: newCourse.lecturer,
      credits: parseInt(newCourse.credits) || 3,
      semester: newCourse.semester || 'Fall 2024',
      department_name: newCourse.department || 'Computer Science',
      enrolled_students: 0,
      max_students: parseInt(newCourse.maxStudents) || 30,
      status: 'active'
    };

    setCourses([...courses, courseToAdd]);
    setAddCourseDialog(false);
    setNewCourse({
      code: '',
      name: '',
      description: '',
      lecturer: '',
      credits: '',
      semester: '',
      department: '',
      maxStudents: ''
    });
  };

  const handleCourseInputChange = (field, value) => {
    setNewCourse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEnrollmentColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#f59e0b';
    return '#10b981';
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return gradients[index % gradients.length];
  };

  const CourseCard = ({ course, index }) => (
    <Box
      sx={{
        animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
        cursor: 'pointer',
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }
      }}
      onClick={() => handleCourseClick(course)}
    >
      {/* Header with gradient */}
      <Box
        sx={{
          background: getRandomGradient(index),
          p: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" fontWeight="700" sx={{ color: 'white' }}>
              {course.code}
            </Typography>
            <Chip
              label={course.status}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)'
              }}
              size="small"
            />
          </Box>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
            {course.name}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5 }}>
            {course.description?.substring(0, 80)}...
          </Typography>
        </Box>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Instructor */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              background: getRandomGradient(index),
              width: 40,
              height: 40,
              mr: 2,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {course.instructor_name?.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="600" color="text.primary">
              {course.instructor_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Instructor
            </Typography>
          </Box>
        </Box>

        {/* Course Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {course.credits}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Credits
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {course.enrolled_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Students
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Progress and Status */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Enrollment
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {course.enrolled_count || 0}/{course.max_students || course.capacity || 30}
            </Typography>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              background: '#f3f4f6',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${((course.enrolled_count || 0) / (course.max_students || course.capacity || 30)) * 100}%`,
                height: '100%',
                background: getRandomGradient(index),
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {course.semester} • {course.department_name}
          </Typography>
          <Chip
            label="View Details"
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }}
          />
        </Box>
      </Box>
    </Box>
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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCourse}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minWidth: 140,
            }}
          >
            Add Course
          </Button>
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
              {(user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') && (
                <Button variant="contained" startIcon={<EditIcon />}>
                  Edit Course
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog open={addCourseDialog} onClose={() => setAddCourseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="700">
            Add New Course
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Code"
                value={newCourse.code}
                onChange={(e) => handleCourseInputChange('code', e.target.value)}
                required
                placeholder="e.g., CS101"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course Name"
                value={newCourse.name}
                onChange={(e) => handleCourseInputChange('name', e.target.value)}
                required
                placeholder="e.g., Introduction to Computer Science"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newCourse.description}
                onChange={(e) => handleCourseInputChange('description', e.target.value)}
                multiline
                rows={3}
                placeholder="Course description..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lecturer"
                value={newCourse.lecturer}
                onChange={(e) => handleCourseInputChange('lecturer', e.target.value)}
                required
                placeholder="e.g., Dr. John Smith"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credits"
                type="number"
                value={newCourse.credits}
                onChange={(e) => handleCourseInputChange('credits', e.target.value)}
                placeholder="e.g., 3"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Semester"
                value={newCourse.semester}
                onChange={(e) => handleCourseInputChange('semester', e.target.value)}
                placeholder="e.g., Fall 2024"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={newCourse.department}
                onChange={(e) => handleCourseInputChange('department', e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Students"
                type="number"
                value={newCourse.maxStudents}
                onChange={(e) => handleCourseInputChange('maxStudents', e.target.value)}
                placeholder="e.g., 30"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCourseDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveCourse}>
            Add Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restriction Dialog */}
      <Dialog open={restrictionDialog} onClose={() => setRestrictionDialog(false)}>
        <DialogTitle>
          <Typography variant="h6" color="error">
            Access Restricted
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            You do not have permission to add courses. Only administrators and academic staff can add new courses.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestrictionDialog(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursesPage;
