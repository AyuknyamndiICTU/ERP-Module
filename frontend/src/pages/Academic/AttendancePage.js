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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
  keyframes,
  IconButton,
} from '@mui/material';
import {

  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  EventBusy as ExcusedIcon,
  Person as PersonIcon,

  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,

  Save as SaveIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';
import { academicAPI } from '../../services/api';

// Enhanced Animation keyframes
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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
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


const AttendancePage = () => {
  const { user } = useAuth();

  // All hooks must be called before any conditional returns
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Mock data and useEffect must be before conditional return
  const mockCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      instructor_name: 'Dr. Sarah Johnson',
      semester: 'Fall 2024',
      enrolled_count: 45,
      schedule: 'Mon, Wed, Fri 10:00 AM'
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus II',
      instructor_name: 'Prof. Michael Chen',
      semester: 'Fall 2024',
      enrolled_count: 38,
      schedule: 'Tue, Thu 2:00 PM'
    }
  ];

  const mockStudents = [
    {
      enrollment_id: 1,
      student_number: 'STU2024001',
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice.johnson@university.edu',
      attendance_percentage: 95.5,
      total_sessions: 22,
      attended_sessions: 21
    },
    {
      enrollment_id: 2,
      student_number: 'STU2024002',
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob.smith@university.edu',
      attendance_percentage: 88.2,
      total_sessions: 22,
      attended_sessions: 19
    }
  ];

  const mockSessions = [
    {
      id: 1,
      date: '2024-10-15',
      topic: 'Introduction to Programming',
      attendance_count: 42,
      total_students: 45
    },
    {
      id: 2,
      date: '2024-10-17',
      topic: 'Variables and Data Types',
      attendance_count: 44,
      total_students: 45
    }
  ];

  const mockSummary = {
    total_sessions: 22,
    total_students: 45,
    average_attendance_rate: 92.5,
    total_absences: 15
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await academicAPI.getCourses({});
        const data = res.data?.courses || (Array.isArray(res.data) ? res.data : []);
        if (data.length > 0) {
          setCourses(data);
          setSelectedCourse(data[0]);
        } else {
          // Fallback to mock
          setCourses(mockCourses);
          setSelectedCourse(mockCourses[0]);
          setStudents(mockStudents);
          setSessions(mockSessions);
          setAttendanceSummary(mockSummary);
        }
      } catch (e) {
        logger.error('Error loading courses:', e);
        // Fallback to mock
        setCourses(mockCourses);
        setSelectedCourse(mockCourses[0]);
        setStudents(mockStudents);
        setSessions(mockSessions);
        setAttendanceSummary(mockSummary);
      } finally {
        // Initialize attendance records for today
        const initialRecords = {};
        (students.length ? students : mockStudents).forEach(student => {
          initialRecords[student.enrollment_id] = 'present';
        });
        setAttendanceRecords(initialRecords);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Check if user has access to attendance management
  const hasAttendanceAccess = user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator';

  // If user doesn't have access, show restriction message
  if (!hasAttendanceAccess) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <GlassCard>
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" color="error" gutterBottom>
              Access Restricted
            </Typography>
            <Typography variant="body1" color="textSecondary">
              You do not have permission to access attendance management.
              Only administrators, academic staff, and course lecturers can manage attendance.
            </Typography>
          </Box>
        </GlassCard>
      </Box>
    );
  }

  // Mock data for demonstration - REMOVED DUPLICATE
  /*const mockCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      semester: 'Fall',
      year: 2024,
      enrolled_students: 45
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus II',
      semester: 'Fall',
      year: 2024,
      enrolled_students: 38
    }
  ];

  const mockStudents = [
    {
      student_id: 1,
      student_number: 'STU2024001',
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice.johnson@university.edu',
      enrollment_id: 1,
      total_sessions: 20,
      present_count: 18,
      absent_count: 1,
      late_count: 1,
      excused_count: 0,
      attendance_percentage: 95.0
    },
    {
      student_id: 2,
      student_number: 'STU2024002',
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob.smith@university.edu',
      enrollment_id: 2,
      total_sessions: 20,
      present_count: 16,
      absent_count: 3,
      late_count: 1,
      excused_count: 0,
      attendance_percentage: 85.0
    },
    {
      student_id: 3,
      student_number: 'STU2024003',
      first_name: 'Carol',
      last_name: 'Davis',
      email: 'carol.davis@university.edu',
      enrollment_id: 3,
      total_sessions: 20,
      present_count: 19,
      absent_count: 0,
      late_count: 1,
      excused_count: 0,
      attendance_percentage: 100.0
    }
  ];

  const mockSessions = [
    {
      session_date: '2024-11-15',
      session_time: '10:00',
      total_students: 45,
      present_count: 42,
      absent_count: 2,
      late_count: 1,
      excused_count: 0
    },
    {
      session_date: '2024-11-13',
      session_time: '10:00',
      total_students: 45,
      present_count: 40,
      absent_count: 3,
      late_count: 2,
      excused_count: 0
    }
  ];

  const mockSummary = {
    total_sessions: 20,
    total_students: 45,
    average_attendance_rate: 92.5,
    total_absences: 15
  };

  useEffect(() => {
    // Simulate API call - mock data is static so no dependencies needed
    setTimeout(() => {
      setCourses(mockCourses);
      if (mockCourses.length > 0) {
        setSelectedCourse(mockCourses[0]);
        setStudents(mockStudents);
        setSessions(mockSessions);
        setAttendanceSummary(mockSummary);

        // Initialize attendance records for today
        const initialRecords = {};
        mockStudents.forEach(student => {
          initialRecords[student.enrollment_id] = 'present';
        });
        setAttendanceRecords(initialRecords);
      }
      setLoading(false);
    }, 1000);
  }, []); // Mock data is static, no dependencies needed */

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceColor = (percentage) => {
    if (percentage >= 95) return '#10b981';
    if (percentage >= 85) return '#f59e0b';
    if (percentage >= 75) return '#ef4444';
    return '#6b7280';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <PresentIcon sx={{ color: '#10b981' }} />;
      case 'absent': return <AbsentIcon sx={{ color: '#ef4444' }} />;
      case 'late': return <LateIcon sx={{ color: '#f59e0b' }} />;
      case 'excused': return <ExcusedIcon sx={{ color: '#6b7280' }} />;
      default: return <PresentIcon sx={{ color: '#10b981' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#10b981';
      case 'absent': return '#ef4444';
      case 'late': return '#f59e0b';
      case 'excused': return '#6b7280';
      default: return '#10b981';
    }
  };

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    // In real app, fetch attendance data for this course
  };

  const handleAttendanceChange = (enrollmentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [enrollmentId]: status
    }));
  };

  const handleTakeAttendance = () => {
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = () => {
    // In real app, save attendance to API
    logger.debug('Saving attendance for', selectedDate, attendanceRecords);
    setAttendanceDialogOpen(false);
  };

  const getAttendanceStats = () => {
    const totalStudents = students.length;
    const highAttendance = students.filter(s => s.attendance_percentage >= 95).length;
    const goodAttendance = students.filter(s => s.attendance_percentage >= 85 && s.attendance_percentage < 95).length;
    const warningAttendance = students.filter(s => s.attendance_percentage >= 75 && s.attendance_percentage < 85).length;
    const lowAttendance = students.filter(s => s.attendance_percentage < 75).length;
    const averageAttendance = students.reduce((sum, s) => sum + s.attendance_percentage, 0) / totalStudents;

    return { totalStudents, highAttendance, goodAttendance, warningAttendance, lowAttendance, averageAttendance };
  };

  const stats = getAttendanceStats();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 0
    }}>
      {/* Enhanced Header with Floating Bubbles */}
      <Box sx={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0 0 50px 50px',
        p: 4,
        mb: 4,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: `${pulse} 4s ease-in-out infinite`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          animation: `${pulse} 3s ease-in-out infinite reverse`,
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, animation: `${slideIn} 0.8s ease-out` }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em'
            }}
          >
            📊 Attendance Tracking
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              maxWidth: '600px'
            }}
          >
            Monitor and manage student attendance across all courses
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        {/* Enhanced Course Selection Card */}
        <GlassCard sx={{ 
          mb: 4, 
          animation: `${fadeInUp} 0.8s ease-out 0.1s both`,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: '20px',
          p: 3
        }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ 
              minWidth: 350,
              '& .MuiOutlinedInput-root': {
                borderRadius: '15px',
                background: 'rgba(102, 126, 234, 0.05)',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.08)',
                },
                '&.Mui-focused': {
                  background: 'rgba(102, 126, 234, 0.1)',
                }
              }
            }}>
              <InputLabel sx={{ fontWeight: 600, color: '#667eea' }}>Select Course</InputLabel>
              <Select
                value={selectedCourse?.id || ''}
                onChange={(e) => handleCourseChange(e.target.value)}
                label="Select Course"
                sx={{ fontWeight: 600 }}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id} sx={{ fontWeight: 500 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="700" color="#667eea">
                        {(course.courseCode || course.code)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(course.courseName || course.name)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              placeholder="🔍 Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flexGrow: 1, 
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '15px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)',
                  },
                  '&.Mui-focused': {
                    background: 'rgba(102, 126, 234, 0.1)',
                  }
                }
              }}
            />

            {(user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') && (
              <Button
                variant="contained"
                startIcon={<CalendarIcon />}
                onClick={handleTakeAttendance}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  minWidth: 180,
                  height: 56,
                  borderRadius: '15px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.5)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                📅 Take Attendance
              </Button>
            )}
          </Box>
        </GlassCard>

      {selectedCourse && (
        <>
          {/* Enhanced Stats Cards with Better Visual Design */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '25px',
                p: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                animation: `${scaleIn} 0.6s ease-out 0.2s both`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                }
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ fontSize: '2rem', mr: 1 }} />
                    <Typography variant="h6" fontWeight="700">👥 Students</Typography>
                  </Box>
                  <Typography variant="h2" fontWeight="900" sx={{ mb: 1, fontSize: '3rem' }}>
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Enrolled
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                borderRadius: '25px',
                p: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                animation: `${scaleIn} 0.6s ease-out 0.3s both`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                }
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: '2rem', mr: 1 }} />
                    <Typography variant="h6" fontWeight="700">📈 Average</Typography>
                  </Box>
                  <Typography variant="h2" fontWeight="900" sx={{ mb: 1, fontSize: '3rem' }}>
                    {stats.averageAttendance.toFixed(1)}%
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Attendance Rate
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '25px',
                p: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                animation: `${scaleIn} 0.6s ease-out 0.4s both`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(79, 172, 254, 0.3)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                }
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PresentIcon sx={{ fontSize: '2rem', mr: 1 }} />
                    <Typography variant="h6" fontWeight="700">⭐ Excellent</Typography>
                  </Box>
                  <Typography variant="h2" fontWeight="900" sx={{ mb: 1, fontSize: '3rem' }}>
                    {stats.highAttendance}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    High Performers (95%+)
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                borderRadius: '25px',
                p: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                animation: `${scaleIn} 0.6s ease-out 0.5s both`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                }
              }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WarningIcon sx={{ fontSize: '2rem', mr: 1 }} />
                    <Typography variant="h6" fontWeight="700">⚠️ At Risk</Typography>
                  </Box>
                  <Typography variant="h2" fontWeight="900" sx={{ mb: 1, fontSize: '3rem' }}>
                    {stats.lowAttendance}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Need Attention (&lt;75%)
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Enhanced Main Content */}
          <GlassCard sx={{ 
            animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '25px',
            p: 4,
            boxShadow: '0 25px 50px rgba(0,0,0,0.1)'
          }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)} 
              sx={{ 
                mb: 4,
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  minHeight: 60,
                  borderRadius: '15px',
                  mx: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  }
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              <Tab label="📊 Student Attendance" />
              <Tab label="📅 Session History" />
              <Tab label="📈 Reports" />
            </Tabs>

            {tabValue === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Student ID</TableCell>
                      <TableCell align="center">Attendance Rate</TableCell>
                      <TableCell align="center">Present</TableCell>
                      <TableCell align="center">Absent</TableCell>
                      <TableCell align="center">Late</TableCell>
                      <TableCell align="center">Progress</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow
                        key={student.student_id}
                        sx={{
                          animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                background: `linear-gradient(135deg, ${getAttendanceColor(student.attendance_percentage)}, ${getAttendanceColor(student.attendance_percentage)}dd)`,
                                width: 40,
                                height: 40,
                                mr: 2,
                                fontSize: '1rem',
                                fontWeight: 700,
                              }}
                            >
                              {student.first_name[0]}{student.last_name[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="600">
                                {student.first_name} {student.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {student.student_number}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" fontWeight="700" sx={{ color: getAttendanceColor(student.attendance_percentage) }}>
                            {student.attendance_percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                            {student.present_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>
                            {student.absent_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                            {student.late_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ width: 80, mx: 'auto' }}>
                            <LinearProgress
                              variant="determinate"
                              value={student.attendance_percentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#f3f4f6',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getAttendanceColor(student.attendance_percentage),
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={student.attendance_percentage >= 95 ? 'Excellent' : student.attendance_percentage >= 85 ? 'Good' : student.attendance_percentage >= 75 ? 'Warning' : 'At Risk'}
                            color={student.attendance_percentage >= 95 ? 'success' : student.attendance_percentage >= 85 ? 'info' : student.attendance_percentage >= 75 ? 'warning' : 'error'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tabValue === 1 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell align="center">Total Students</TableCell>
                      <TableCell align="center">Present</TableCell>
                      <TableCell align="center">Absent</TableCell>
                      <TableCell align="center">Late</TableCell>
                      <TableCell align="center">Attendance Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((session, index) => (
                      <TableRow
                        key={`${session.session_date}-${session.session_time}`}
                        sx={{
                          animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {new Date(session.session_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {session.session_time}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {session.total_students}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                            {session.present_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>
                            {session.absent_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                            {session.late_count}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="600">
                            {((session.present_count + session.late_count) / session.total_students * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    Attendance Summary
                  </Typography>
                  <Box sx={{ p: 2, background: 'rgba(102, 126, 234, 0.05)', borderRadius: 2, mb: 3 }}>
                    <Typography variant="body2" paragraph>
                      <strong>Total Sessions:</strong> {attendanceSummary.total_sessions}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Average Attendance Rate:</strong> {attendanceSummary.average_attendance_rate?.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Total Absences:</strong> {attendanceSummary.total_absences}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Students at Risk:</strong> {stats.lowAttendance} (attendance below 75%)
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Download Attendance Report
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    Attendance Trends
                  </Typography>
                  <Box sx={{ p: 2, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 2 }}>
                    <Typography variant="body2" paragraph>
                      <strong>Excellent Attendance (95%+):</strong> {stats.highAttendance} students
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Good Attendance (85-94%):</strong> {stats.goodAttendance} students
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Warning (75-84%):</strong> {stats.warningAttendance} students
                    </Typography>
                    <Typography variant="body2">
                      <strong>At Risk (below 75%):</strong> {stats.lowAttendance} students
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </GlassCard>
        </>
      )}

      {/* Take Attendance Dialog */}
      <Dialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="700">
            Take Attendance - {(selectedCourse?.courseCode || selectedCourse?.code)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(selectedDate).toLocaleDateString()}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Session Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mr: 2 }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Absent</TableCell>
                  <TableCell align="center">Late</TableCell>
                  <TableCell align="center">Excused</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.enrollment_id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            width: 32,
                            height: 32,
                            mr: 2,
                            fontSize: '0.875rem',
                          }}
                        >
                          {student.first_name[0]}{student.last_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {student.first_name} {student.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.student_number}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color={attendanceRecords[student.enrollment_id] === 'present' ? 'success' : 'default'}
                        onClick={() => handleAttendanceChange(student.enrollment_id, 'present')}
                      >
                        <PresentIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color={attendanceRecords[student.enrollment_id] === 'absent' ? 'error' : 'default'}
                        onClick={() => handleAttendanceChange(student.enrollment_id, 'absent')}
                      >
                        <AbsentIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color={attendanceRecords[student.enrollment_id] === 'late' ? 'warning' : 'default'}
                        onClick={() => handleAttendanceChange(student.enrollment_id, 'late')}
                      >
                        <LateIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color={attendanceRecords[student.enrollment_id] === 'excused' ? 'info' : 'default'}
                        onClick={() => handleAttendanceChange(student.enrollment_id, 'excused')}
                      >
                        <ExcusedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveAttendance} startIcon={<SaveIcon />}>
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default AttendancePage;
