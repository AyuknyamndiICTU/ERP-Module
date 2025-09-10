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
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkIcon,
  Star as StarIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  Computer as ComputerIcon,
  Engineering as EngineeringIcon,
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

const ICTUCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // ICT University authentic-like course data (curated to match backend structure)
  const ictUniversityCourses = [
    {
      id: 1,
      code: 'CSC101',
      name: 'Introduction to Computer Science',
      description: 'Fundamental concepts of computer science, programming logic, and problem-solving techniques using modern programming languages.',
      credits: 3,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Dr. Emmanuel Tanyi',
      instructor_avatar: 'ET',
      department_name: 'Computer Science',
      faculty: 'Faculty of Engineering and Technology',
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
      category: 'Programming',
      prerequisites: 'None',
      objectives: [
        'Understand basic programming concepts',
        'Develop problem-solving skills',
        'Learn algorithm design principles'
      ]
    },
    {
      id: 2,
      code: 'CSC201',
      name: 'Data Structures and Algorithms',
      description: 'Study of data structures, algorithm analysis, and implementation of efficient solutions for complex problems.',
      credits: 4,
      semester: 'Spring',
      year: 2024,
      instructor_name: 'Prof. Marie Nguefack',
      instructor_avatar: 'MN',
      department_name: 'Computer Science',
      faculty: 'Faculty of Engineering and Technology',
      enrolled_count: 38,
      capacity: 40,
      progress: 60,
      difficulty: 'Intermediate',
      rating: 4.6,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '2:00 PM - 3:30 PM',
        room: 'CS-205'
      },
      status: 'active',
      category: 'Programming',
      prerequisites: 'CSC101',
      objectives: [
        'Master fundamental data structures',
        'Analyze algorithm complexity',
        'Implement efficient algorithms'
      ]
    },
    {
      id: 3,
      code: 'BUS301',
      name: 'Digital Marketing Strategies',
      description: 'Comprehensive study of digital marketing techniques, social media strategies, and online business development.',
      credits: 3,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Dr. Paul Nkwenti',
      instructor_avatar: 'PN',
      department_name: 'Business Administration',
      faculty: 'Faculty of Management Sciences',
      enrolled_count: 28,
      capacity: 30,
      progress: 85,
      difficulty: 'Intermediate',
      rating: 4.9,
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: '1:00 PM - 2:30 PM',
        room: 'BUS-110'
      },
      status: 'active',
      category: 'Business',
      prerequisites: 'BUS101',
      objectives: [
        'Develop digital marketing skills',
        'Understand social media analytics',
        'Create effective marketing campaigns'
      ]
    },
    {
      id: 4,
      code: 'ENG401',
      name: 'Software Engineering Principles',
      description: 'Software development methodologies, project management, and quality assurance in software engineering.',
      credits: 4,
      semester: 'Spring',
      year: 2024,
      instructor_name: 'Dr. Alain Tiedeu',
      instructor_avatar: 'AT',
      department_name: 'Software Engineering',
      faculty: 'Faculty of Engineering and Technology',
      enrolled_count: 42,
      capacity: 45,
      progress: 40,
      difficulty: 'Advanced',
      rating: 4.7,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      schedule: {
        days: ['Tuesday', 'Thursday', 'Friday'],
        time: '11:00 AM - 12:30 PM',
        room: 'ENG-201'
      },
      status: 'active',
      category: 'Engineering',
      prerequisites: 'CSC201, ENG301',
      objectives: [
        'Master software development lifecycle',
        'Apply project management principles',
        'Implement quality assurance practices'
      ]
    },
    {
      id: 5,
      code: 'NET501',
      name: 'Network Security and Cryptography',
      description: 'Network security protocols, cryptographic algorithms, and cybersecurity best practices.',
      credits: 3,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Dr. Fabrice Mourembou',
      instructor_avatar: 'FM',
      department_name: 'Network Engineering',
      faculty: 'Faculty of Engineering and Technology',
      enrolled_count: 35,
      capacity: 40,
      progress: 90,
      difficulty: 'Advanced',
      rating: 4.8,
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '3:00 PM - 4:00 PM',
        room: 'NET-301'
      },
      status: 'active',
      category: 'Networking',
      prerequisites: 'NET301, CSC301',
      objectives: [
        'Understand network security principles',
        'Implement cryptographic solutions',
        'Design secure network architectures'
      ]
    },
    {
      id: 6,
      code: 'DBA601',
      name: 'Advanced Database Systems',
      description: 'Enterprise database management, data warehousing, big data analytics, and database optimization techniques.',
      credits: 3,
      semester: 'Spring',
      year: 2024,
      instructor_name: 'Prof. Carine Tientcheu',
      instructor_avatar: 'CT',
      department_name: 'Information Systems',
      faculty: 'Faculty of Engineering and Technology',
      enrolled_count: 30,
      capacity: 35,
      progress: 55,
      difficulty: 'Advanced',
      rating: 4.5,
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '9:00 AM - 10:30 AM',
        room: 'DB-101'
      },
      status: 'active',
      category: 'Database',
      prerequisites: 'DBA301, CSC201',
      objectives: [
        'Master advanced database concepts',
        'Implement data warehousing solutions',
        'Optimize database performance'
      ]
    },
    {
      id: 7,
      code: 'WEB301',
      name: 'Full-Stack Web Development',
      description: 'Modern web development using React, Node.js, and cloud technologies for building scalable web applications.',
      credits: 4,
      semester: 'Fall',
      year: 2024,
      instructor_name: 'Dr. Serge Stinckwich',
      instructor_avatar: 'SS',
      department_name: 'Web Technologies',
      faculty: 'Faculty of Engineering and Technology',
      enrolled_count: 48,
      capacity: 50,
      progress: 65,
      difficulty: 'Intermediate',
      rating: 4.9,
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '2:00 PM - 3:30 PM',
        room: 'WEB-201'
      },
      status: 'active',
      category: 'Web Development',
      prerequisites: 'CSC101, WEB201',
      objectives: [
        'Build full-stack web applications',
        'Master modern web frameworks',
        'Deploy applications to cloud platforms'
      ]
    },
    {
      id: 8,
      code: 'AI501',
      name: 'Artificial Intelligence and Machine Learning',
      description: 'Introduction to AI concepts, machine learning algorithms, neural networks, and practical AI applications.',
      credits: 4,
      semester: 'Spring',
      year: 2024,
      instructor_name: 'Dr. Blaise Omer Yenke',
      instructor_avatar: 'BY',
      department_name: 'Artificial Intelligence',
      faculty: 'Faculty of Engineering and Technology',
      enrolled_count: 25,
      capacity: 30,
      progress: 30,
      difficulty: 'Advanced',
      rating: 4.8,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '10:00 AM - 12:00 PM',
        room: 'AI-301'
      },
      status: 'active',
      category: 'Artificial Intelligence',
      prerequisites: 'CSC201, MATH301',
      objectives: [
        'Understand AI fundamentals',
        'Implement machine learning models',
        'Develop intelligent applications'
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(ictUniversityCourses);
      setLoading(false);
    }, 700);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = !selectedSemester || course.semester === selectedSemester;
    const matchesDepartment = !selectedDepartment || course.department_name === selectedDepartment;

    return matchesSearch && matchesSemester && matchesDepartment;
  });

  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCourseDialogOpen(true);
  };

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
              <Tooltip title="Add to Favorites">
                <IconButton size="small" sx={{ color: 'white' }}>
                  <BookmarkIcon />
                </IconButton>
              </Tooltip>
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
              {course.rating}
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
                Trainees
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
          Enroll
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
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '2rem', sm: '3rem' },
              }}
            >
              ICT University Courses
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Explore our comprehensive course catalog and advance your career
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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

      {/* All Courses Section */}
      <Box>
        <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: 'text.primary' }}>
          All Courses ({filteredCourses.length})
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
                Enroll Now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ICTUCoursesPage;