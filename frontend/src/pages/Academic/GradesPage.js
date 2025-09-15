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
  CircularProgress,
  keyframes
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard, { StatsCard } from '../../components/GlassCard';
import TranscriptGenerator from '../../components/Transcript/TranscriptGenerator';
import { academicAPI } from '../../services/api';
import logger from '../../utils/logger';

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

const GradesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch courses - filter based on user role
        let coursesParams = {};
        if (user?.role === 'lecturer') {
          coursesParams.instructorId = user.id;
        } else if (user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') {
          // Coordinators see courses in their faculty/major
          coursesParams.facultyId = user.facultyId || user.faculty_id;
        }

        logger.debug('Fetching courses with params:', coursesParams);
        const coursesResponse = await academicAPI.getCourses(coursesParams);

        let courses = [];
        if (coursesResponse.data?.courses) {
          courses = coursesResponse.data.courses;
        } else if (Array.isArray(coursesResponse.data)) {
          courses = coursesResponse.data;
        }

        setCourses(courses);

        if (courses.length > 0) {
          setSelectedCourse(courses[0]);
          await fetchCourseData(courses[0].id);
        }

        // If student, fetch their own grade data
        if (user?.role === 'student') {
          await fetchStudentGrades();
        }

      } catch (error) {
        logger.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchCourseData = async (courseId) => {
    try {
      logger.debug('Fetching data for course:', courseId);

      // Fetch grades for the course
      const gradesParams = { courseId };
      if (user?.role === 'student') {
        gradesParams.studentId = user.id;
      }

      const gradesResponse = await academicAPI.getGrades(gradesParams);
      const grades = gradesResponse.data?.grades || [];
      setGrades(grades);

      logger.debug('Fetched grades:', grades.length);

      // Process grades to create student list
      const studentMap = new Map();

      grades.forEach(grade => {
        const studentId = grade.student?.id || grade.studentId;
        const student = grade.student || {
          id: grade.studentId,
          // These fields from student table
          matricule: grade.matricule || grade.studentNumber,
          firstName: grade.firstName,
          lastName: grade.lastName,
          email: grade.email
        };

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student_id: studentId,
            student_number: student.matricule || `STU${studentId}`,
            first_name: student.firstName || 'Unknown',
            last_name: student.lastName || 'Student',
            email: student.email || '',
            grades: []
          });
        }

        studentMap.get(studentId).grades.push({
          id: grade.id,
          assignment_type: grade.componentType || 'exam',
          assignment_name: grade.componentName || 'Final Exam',
          points_earned: grade.caMarks || grade.totalMarks || 0,
          points_possible: 100,
          percentage: grade.caMarks || grade.totalMarks || 0,
          letter_grade: grade.letterGrade || 'F',
          grade_points: grade.gradePoints || 0,
          weight: 1.0,
          due_date: grade.createdAt || new Date().toISOString(),
          status: grade.status || 'published'
        });
      });

      // Calculate GPA and create student list
      const studentsWithGPA = Array.from(studentMap.values()).map(student => {
        let totalGradePoints = 0;
        let totalCredits = 0;

        student.grades.forEach(grade => {
          const credits = 3; // Assuming 3 credits per grade component
          totalGradePoints += grade.grade_points * credits;
          totalCredits += credits;
        });

        const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

        return {
          ...student,
          current_grade: gpa,
          enrollment_id: student.student_id
        };
      });

      // Filter data based on user role
      let finalStudents = studentsWithGPA;
      if (user?.role === 'student') {
        finalStudents = studentsWithGPA.filter(student => student.student_id === user.id);
      }

      setStudents(finalStudents);
      
      // Calculate grade distribution
      calculateGradeDistribution(finalStudents);

    } catch (error) {
      logger.error('Error fetching course data:', error);
    }
  };

  const fetchStudentGrades = async () => {
    try {
      // Fetch grades for current student
      const gradesResponse = await academicAPI.getGrades();
      const grades = gradesResponse.data?.grades || [];
      setGrades(grades);

      // Transform grades to student format
      const studentGrades = grades.map(grade => ({
        id: grade.id,
        assignment_type: grade.componentType || 'exam',
        assignment_name: grade.componentName || 'Final Exam',
        points_earned: grade.caMarks || grade.totalMarks || 0,
        points_possible: 100,
        percentage: grade.caMarks || grade.totalMarks || 0,
        letter_grade: grade.letterGrade || 'F',
        grade_points: grade.gradePoints || 0,
        weight: 1.0,
        due_date: grade.createdAt || new Date().toISOString(),
        status: grade.status || 'published'
      }));

      const mockStudentData = [{
        student_id: user.id,
        student_number: user.matricule || `STU${user.id}`,
        first_name: user.firstName || 'Student',
        last_name: user.lastName || '',
        email: user.email || '',
        enrollment_id: user.id,
        current_grade: grades.length > 0 ? (grades[0].gradePoints || 0) : 0.0,
        grades: studentGrades
      }];

      setStudents(mockStudentData);

    } catch (error) {
      logger.error('Error fetching student grades:', error);
    }
  };

  const calculateGradeDistribution = (studentsList) => {
    const distribution = [
      { letter_grade: 'A', count: 0, min: 3.7 },
      { letter_grade: 'B', count: 0, min: 3.0 },
      { letter_grade: 'C', count: 0, min: 2.0 },
      { letter_grade: 'D', count: 0, min: 1.0 },
      { letter_grade: 'F', count: 0, min: 0.0 }
    ];

    studentsList.forEach(student => {
      const grade = student.current_grade;
      if (grade >= 3.7) distribution[0].count++;
      else if (grade >= 3.0) distribution[1].count++;
      else if (grade >= 2.0) distribution[2].count++;
      else if (grade >= 1.0) distribution[3].count++;
      else distribution[4].count++;
    });

    setGradeDistribution(distribution);
  };

  const filteredStudents = students.filter(student =>
    student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.student_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGradeColor = (grade) => {
    if (grade >= 3.7) return '#10b981';
    if (grade >= 3.0) return '#f59e0b';
    if (grade >= 2.0) return '#ef4444';
    return '#6b7280';
  };

  const getLetterGradeColor = (letter) => {
    if (letter.startsWith('A')) return '#10b981';
    if (letter.startsWith('B')) return '#3b82f6';
    if (letter.startsWith('C')) return '#f59e0b';
    if (letter.startsWith('D')) return '#ef4444';
    return '#6b7280';
  };

  const handleCourseChange = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);

    // Fetch students and grades for this course
    await fetchCourseData(courseId);
  };

  const handleAddGrade = () => {
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') {
      setEditingGrade({
        enrollment_id: '',
        courseId: selectedCourse?.id || '',
        studentId: '',
        assignment_type: 'assignment',
        assignment_name: '',
        caMarks: '',
        examMarks: '',
        totalMarks: '',
        status: 'draft'
      });
      setGradeDialogOpen(true);
    } else {
      // Show restriction dialog
      alert('Access Restricted: Only administrators and academic staff can add grades.');
    }
  };

  const handleEditGrade = (grade) => {
    if (user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') {
      setEditingGrade({
        id: grade.id,
        courseId: selectedCourse?.id || grade.courseId,
        studentId: grade.studentId || grade.student_id,
        assignment_type: grade.assignment_type,
        assignment_name: grade.assignment_name,
        caMarks: grade.caMarks || grade.points_earned,
        examMarks: grade.examMarks || '',
        totalMarks: grade.totalMarks || grade.points_possible,
        status: grade.status || 'draft'
      });
      setGradeDialogOpen(true);
    } else {
      alert('Access Restricted: Only administrators and academic staff can edit grades.');
    }
  };

  const handleSaveGrade = async () => {
    try {
      logger.debug('Saving grade:', editingGrade);

      if (editingGrade.id) {
        // Update existing grade
        const updateData = {
          caMarks: editingGrade.caMarks,
          examMarks: editingGrade.examMarks,
          totalMarks: parseFloat(editingGrade.caMarks) + parseFloat(editingGrade.examMarks),
          status: editingGrade.status
        };
        await academicAPI.updateGrade(editingGrade.id, updateData);
      } else {
        // Create new grade
        const gradeData = {
          courseId: editingGrade.courseId,
          studentId: editingGrade.studentId,
          caMarks: parseFloat(editingGrade.caMarks) || 0,
          examMarks: parseFloat(editingGrade.examMarks) || 0,
          status: editingGrade.status
        };
        gradeData.totalMarks = gradeData.caMarks + gradeData.examMarks;
        await academicAPI.createGrade(gradeData);
      }

      // Refresh course data
      if (selectedCourse) {
        await fetchCourseData(selectedCourse.id);
      }

      setGradeDialogOpen(false);
      setEditingGrade(null);

      logger.info('Grade saved successfully');

    } catch (error) {
      logger.error('Error saving grade:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save grade';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleViewTranscript = (student) => {
    setSelectedStudent(student);
    setTranscriptOpen(true);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 0
    }}>
      {/* Enhanced Header with Floating Elements */}
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
            🎓 Grades Management
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
            Manage student grades, assignments, and academic performance
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          animation: `${fadeInUp} 0.6s ease-out`
        }}>
          <Box sx={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}>
            <CircularProgress 
              size={60} 
              sx={{ 
                color: 'white',
                animation: `${pulse} 2s ease-in-out infinite`
              }} 
            />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <GradeIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 24 }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ 
            color: 'white', 
            mb: 1,
            fontWeight: 600,
            animation: `${slideIn} 0.8s ease-out 0.2s both`
          }}>
            Loading Grades Data
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            animation: `${slideIn} 0.8s ease-out 0.4s both`
          }}>
            Fetching courses, students, and grade information...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 4, pb: 4 }}>
          {/* Course Selection */}
          <GlassCard sx={{ mb: 4, animation: `${fadeInUp} 0.8s ease-out 0.1s both` }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel>Select Course</InputLabel>
                <Select
                  value={selectedCourse?.id || ''}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  label="Select Course"
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {(course.courseCode || course.code)} - {(course.courseName || course.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )}}
                sx={{ flexGrow: 1, minWidth: 250 }}
              />

              {user?.role === 'student' && students.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleViewTranscript(students[0])}
                  sx={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    minWidth: 140,
                    mr: 2
                  }}
                >
                  Download Transcript
                </Button>
              )}

              {(user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddGrade}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    minWidth: 140
                  }}
                >
                  Add Grade
                </Button>
              )}
            </Box>
          </GlassCard>

          {selectedCourse && (
            <>
              <Box sx={{ px: 3 }}>
                {/* Enhanced Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '25px',
                      p: 3,
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: `${scaleIn} 0.6s ease-out 0.1s both`,
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
                          {students.length}
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
                      animation: `${scaleIn} 0.6s ease-out 0.2s both`,
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
                          <GradeIcon sx={{ fontSize: '2rem', mr: 1 }} />
                          <Typography variant="h6" fontWeight="700">📊 Average</Typography>
                        </Box>
                        <Typography variant="h2" fontWeight="900" sx={{ mb: 1, fontSize: '3rem' }}>
                          {students.length > 0 ? (students.reduce((sum, s) => sum + s.current_grade, 0) / students.length).toFixed(2) : '0.00'}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          GPA Score
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
                      animation: `${scaleIn} 0.6s ease-out 0.3s both`,
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
                          <TrendingUpIcon sx={{ fontSize: '2rem', mr: 1 }} />
                          <Typography variant="h6" fontWeight="700">⭐ High</Typography>
                        </Box>
                        <Typography variant="h2" fontWeight="900" sx={{ mb: 1, fontSize: '3rem' }}>
                          {students.filter(s => s.current_grade >= 3.5).length}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          Performers (3.5+)
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
                      animation: `${scaleIn} 0.6s ease-out 0.4s both`,
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
                          <AssessmentIcon sx={{ fontSize: '2rem', mr: 1 }} />
                          <Typography variant="h6" fontWeight="700">📝 Active</Typography>
                        </Box>
                        <Typography variant="h2" fontWeight="900" sx={{ mb: 1, fontSize: '3rem' }}>
                          {assignments.length}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                          Assignments
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Main Content */}
                <GlassCard sx={{ animation: `${fadeInUp} 0.8s ease-out 0.6s both` }}>
                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                    <Tab label="Student Grades" />
                    <Tab label="Assignments" />
                    <Tab label="Grade Distribution" />
                  </Tabs>

                  {tabValue === 0 && (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Student ID</TableCell>
                            <TableCell align="center">Current Grade</TableCell>
                            <TableCell align="center">GPA</TableCell>
                            <TableCell align="center">Progress</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredStudents.map((student, index) => (
                            <TableRow
                              key={student.student_id}
                              sx={{
                                animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`,
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 126, 234, 0.05)'
                                }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      background: `linear-gradient(135deg, ${getGradeColor(student.current_grade)}, ${getGradeColor(student.current_grade)}dd)`,
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      fontSize: '1rem',
                                      fontWeight: 700
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
                                <Chip
                                  label={student.current_grade >= 3.7 ? 'A' : student.current_grade >= 3.0 ? 'B' : student.current_grade >= 2.0 ? 'C' : 'D'}
                                  sx={{
                                    background: getLetterGradeColor(student.current_grade >= 3.7 ? 'A' : student.current_grade >= 3.0 ? 'B' : student.current_grade >= 2.0 ? 'C' : 'D'),
                                    color: '#ffffff',
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight="600">
                                  {student.current_grade.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ width: 80, mx: 'auto' }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(student.current_grade / 4.0) * 100}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      backgroundColor: '#f3f4f6',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: getGradeColor(student.current_grade),
                                        borderRadius: 4
                                      }
                                    }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleEditGrade(student.grades[0])}
                                  sx={{ mr: 1 }}
                                >
                                  Edit
                                </Button>
                                {(user?.role === 'admin' || user?.role === 'system_admin' || user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator') && (
                                  <Button
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => handleViewTranscript(student)}
                                  >
                                    Transcript
                                  </Button>
                                )}
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
                            <TableCell>Assignment</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="center">Points</TableCell>
                            <TableCell align="center">Weight</TableCell>
                            <TableCell align="center">Due Date</TableCell>
                            <TableCell align="center">Submissions</TableCell>
                            <TableCell align="center">Average</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {assignments.map((assignment, index) => (
                            <TableRow
                              key={assignment.assignment_name}
                              sx={{
                                animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`
                              }}
                            >
                              <TableCell>
                                <Typography variant="subtitle2" fontWeight="600">
                                  {assignment.assignment_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={assignment.assignment_type}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {assignment.points_possible}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {(assignment.weight * 100).toFixed(0)}%
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {new Date(assignment.due_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {assignment.submission_count}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight="600">
                                  {assignment.average_score.toFixed(1)}%
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
                          Grade Distribution
                        </Typography>
                        {gradeDistribution.map((grade, index) => (
                          <Box
                            key={grade.letter_grade}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 2,
                              animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`
                            }}
                          >
                            <Typography variant="h6" sx={{ minWidth: 40, fontWeight: 700 }}>
                              {grade.letter_grade}
                            </Typography>
                            <Box sx={{ flexGrow: 1, mx: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={students.length > 0 ? (grade.count / students.length) * 100 : 0}
                                sx={{
                                  height: 12,
                                  borderRadius: 6,
                                  backgroundColor: '#f3f4f6',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getLetterGradeColor(grade.letter_grade),
                                    borderRadius: 6
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight="600" sx={{ minWidth: 60 }}>
                              {grade.count} ({students.length > 0 ? ((grade.count / students.length) * 100).toFixed(1) : '0.0'}%)
                            </Typography>
                          </Box>
                        ))}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" fontWeight="700" gutterBottom>
                          Course Statistics
                        </Typography>
                        <Box sx={{ p: 2, background: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                          <Typography variant="body2" paragraph>
                            <strong>Total Students:</strong> {students.length}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Course Average:</strong> {students.length > 0 ? (students.reduce((sum, s) => sum + s.current_grade, 0) / students.length).toFixed(2) : '0.00'}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Highest Grade:</strong> {students.length > 0 ? Math.max(...students.map(s => s.current_grade)).toFixed(2) : '0.00'}
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Lowest Grade:</strong> {students.length > 0 ? Math.min(...students.map(s => s.current_grade)).toFixed(2) : '0.00'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Pass Rate:</strong> {students.length > 0 ? ((students.filter(s => s.current_grade >= 2.0).length / students.length) * 100).toFixed(1) : '0.0'}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </GlassCard>
              </Box>
            </>
          )}

          {/* Grade Entry Dialog */}
          <Dialog
            open={gradeDialogOpen}
            onClose={() => setGradeDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h5" fontWeight="700">
                {editingGrade?.id ? 'Edit Grade' : 'Add New Grade'}
              </Typography>
            </DialogTitle>
            <DialogContent>
              {editingGrade && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Assignment Type</InputLabel>
                      <Select
                        value={editingGrade.assignment_type}
                        onChange={(e) => setEditingGrade({...editingGrade, assignment_type: e.target.value})}
                        label="Assignment Type"
                      >
                        <MenuItem value="assignment">Assignment</MenuItem>
                        <MenuItem value="quiz">Quiz</MenuItem>
                        <MenuItem value="exam">Exam</MenuItem>
                        <MenuItem value="project">Project</MenuItem>
                        <MenuItem value="participation">Participation</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Assignment Name"
                      value={editingGrade.assignment_name}
                      onChange={(e) => setEditingGrade({...editingGrade, assignment_name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CA Marks"
                      type="number"
                      value={editingGrade.caMarks}
                      onChange={(e) => setEditingGrade({...editingGrade, caMarks: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Exam Marks"
                      type="number"
                      value={editingGrade.examMarks}
                      onChange={(e) => setEditingGrade({...editingGrade, examMarks: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editingGrade.status}
                        onChange={(e) => setEditingGrade({...editingGrade, status: e.target.value})}
                        label="Status"
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setGradeDialogOpen(false)} startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSaveGrade} startIcon={<SaveIcon />}>
                Save Grade
              </Button>
            </DialogActions>
          </Dialog>

          {/* Transcript Generator */}
          <TranscriptGenerator
            open={transcriptOpen}
            onClose={() => setTranscriptOpen(false)}
            student={user?.role === 'student' ? students[0] : selectedStudent}
            grades={user?.role === 'student' ? students[0]?.grades || [] : grades}
          />
        </Box>
      )}
    </Box>
  );
};

export default GradesPage;