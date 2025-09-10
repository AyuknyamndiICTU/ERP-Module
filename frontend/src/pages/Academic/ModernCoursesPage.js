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
  Card,
  CardContent,
  CardActions,
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
  IconButton,
  LinearProgress,
  Tooltip,
  Fab,
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
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

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

const ModernCoursesPage = () => {
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

  // Enhanced mock data with more details
  const mockCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'JavaScript Essentials',
      description: 'In this course, you will learn web front-end development through the development of projects that use web as a single page.',
      credits: 3,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'David Wallace',
      instructor_avatar: 'DW',
      department_name: 'Computer Science',
      enrolled_count: 45,
      capacity: 50,
      progress: 75,
      difficulty: 'Beginner',
      rating: 4.8,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '10:00 AM - 11:00 AM',
        room: 'CS-101'
      },
      status: 'active',
      category: 'Programming'
    },
    {
      id: 2,
      code: 'LANG201',
      name: '自動アンロックしない',
      description: 'このコースでは、Webシステムと統合されたプログラミング手法について学びます。',
      credits: 4,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'John Doe',
      instructor_avatar: 'JD',
      department_name: 'Languages',
      enrolled_count: 38,
      capacity: 40,
      progress: 60,
      difficulty: 'Intermediate',
      rating: 4.6,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '2:00 PM - 3:30 PM',
        room: 'LANG-205'
      },
      status: 'active',
      category: 'Language'
    },
    {
      id: 3,
      code: 'MATH301',
      name: 'Problem Solving',
      description: 'Advanced problem-solving techniques and mathematical modeling for real-world applications.',
      credits: 3,
      semester: 'Spring',
      year: 2024,
      instructor_name: 'Sarah Johnson',
      instructor_avatar: 'SJ',
      department_name: 'Mathematics',
      enrolled_count: 28,
      capacity: 30,
      progress: 85,
      difficulty: 'Advanced',
      rating: 4.9,
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: '1:00 PM - 2:30 PM',
        room: 'MATH-110'
      },
      status: 'active',
      category: 'Mathematics'
    },
    {
      id: 4,
      code: 'WEB401',
      name: 'Front End Fundamentals',
      description: 'Master the fundamentals of front-end web development with modern frameworks and tools.',
      credits: 4,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Emily Davis',
      instructor_avatar: 'ED',
      department_name: 'Web Development',
      enrolled_count: 42,
      capacity: 45,
      progress: 40,
      difficulty: 'Intermediate',
      rating: 4.7,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      schedule: {
        days: ['Tuesday', 'Thursday', 'Friday'],
        time: '11:00 AM - 12:30 PM',
        room: 'WEB-201'
      },
      status: 'active',
      category: 'Web Development'
    },
    {
      id: 5,
      code: 'JS501',
      name: 'JavaScript',
      description: 'Deep dive into JavaScript programming, ES6+ features, and modern development practices.',
      credits: 3,
      semester: 'Spring',
      year: 2024,
      instructor_name: 'Michael Chen',
      instructor_avatar: 'MC',
      department_name: 'Programming',
      enrolled_count: 35,
      capacity: 40,
      progress: 90,
      difficulty: 'Advanced',
      rating: 4.8,
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '3:00 PM - 4:00 PM',
        room: 'PROG-301'
      },
      status: 'active',
      category: 'Programming'
    },
    {
      id: 6,
      code: 'SQL601',
      name: 'SQL Essentials',
      description: 'Learn database management and SQL queries for data manipulation and analysis.',
      credits: 3,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Lisa Wang',
      instructor_avatar: 'LW',
      department_name: 'Database',
      enrolled_count: 30,
      capacity: 35,
      progress: 55,
      difficulty: 'Beginner',
      rating: 4.5,
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '9:00 AM - 10:30 AM',
        room: 'DB-101'
      },
      status: 'active',
      category: 'Database'
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const CourseCard = ({ course, index }) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
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
            <Typography variant="h5" fontWeight="700" sx={{ color: 'white' }}>
              {course.code}
            </Typography>
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
              <IconButton size="small" sx={{ color: 'white' }}>
                <BookmarkIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'white' }}>
            {course.name}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5, mb: 2 }}>
            {course.description?.substring(0, 80)}...
          </Typography>

          {/* Progress bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
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
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
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
              Instructor
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ color: '#fbbf24', fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="caption" fontWeight="600">
              {course.rating}
            </Typography>
          </Box>
        </Box>

        {/* Course Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {course.credits}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Credits
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {course.enrolled_count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Trainees
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="700" color="primary.main">
                {Math.floor(course.progress / 10)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lessons
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
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {course.semester} • {course.category}
          </Typography>
        </Box>
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
          Continue
        </Button>
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '2rem', sm: '3rem' },
              }}
            >
              Courses
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Explore and manage your learning journey
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            CREATE COURSE
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Bar */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search courses, instructors..."
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

      {/* Featured Courses Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: 'text.primary' }}>
          Featured Courses
        </Typography>
        
        <Grid container spacing={3}>
          {filteredCourses.slice(0, 2).map((course, index) => (
            <Grid item xs={12} md={6} key={course.id}>
              <CourseCard course={course} index={index} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* All Classes Section */}
      <Box>
        <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: 'text.primary' }}>
          All Courses
        </Typography>
        
        <Grid container spacing={3}>
          {filteredCourses.map((course, index) => (
            <Grid item xs={12} sm={6} lg={4} key={course.id}>
              <CourseCard course={course} index={index + 2} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 200,
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
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Programming">Programming</MenuItem>
              <MenuItem value="Web Development">Web Development</MenuItem>
              <MenuItem value="Mathematics">Mathematics</MenuItem>
              <MenuItem value="Database">Database</MenuItem>
              <MenuItem value="Languages">Languages</MenuItem>
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
            background: 'rgba(255, 255, 255, 0.95)',
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
                    Instructor: {selectedCourse.instructor_name}
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
                    <strong>Department:</strong> {selectedCourse.department_name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Difficulty:</strong> {selectedCourse.difficulty}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Rating:</strong> {selectedCourse.rating}/5.0
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
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setCourseDialogOpen(false)}>
                Close
              </Button>
              <Button 
                variant="contained" 
                startIcon={<PlayIcon />}
                sx={{
                  background: selectedCourse.color,
                  '&:hover': {
                    background: selectedCourse.color,
                    opacity: 0.9,
                  },
                }}
              >
                Continue Learning
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ModernCoursesPage;