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
  keyframes} from '@mui/material';
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
import logger from '../../utils/logger';

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

const GradesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [gradeComponents, setGradeComponents] = useState([]);

  // Mock data for demonstration
  const mockCourses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Computer Science',
      semester: 'Fall',
      year: 2024,
      enrolled_count: 45
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus II',
      semester: 'Fall',
      year: 2024,
      enrolled_count: 38
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
      current_grade: 3.75,
      grades: [
        {
          id: 1,
          assignment_type: 'exam',
          assignment_name: 'Midterm Exam',
          points_earned: 85,
          points_possible: 100,
          percentage: 85,
          letter_grade: 'B',
          grade_points: 3.0,
          weight: 0.3,
          due_date: '2024-10-15',
          status: 'published'
        },
        {
          id: 2,
          assignment_type: 'assignment',
          assignment_name: 'Programming Project 1',
          points_earned: 95,
          points_possible: 100,
          percentage: 95,
          letter_grade: 'A',
          grade_points: 4.0,
          weight: 0.2,
          due_date: '2024-09-30',
          status: 'published'
        }
      ]
    },
    {
      student_id: 2,
      student_number: 'STU2024002',
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob.smith@university.edu',
      enrollment_id: 2,
      current_grade: 3.92,
      grades: [
        {
          id: 3,
          assignment_type: 'exam',
          assignment_name: 'Midterm Exam',
          points_earned: 92,
          points_possible: 100,
          percentage: 92,
          letter_grade: 'A-',
          grade_points: 3.7,
          weight: 0.3,
          due_date: '2024-10-15',
          status: 'published'
        },
        {
          id: 4,
          assignment_type: 'assignment',
          assignment_name: 'Programming Project 1',
          points_earned: 98,
          points_possible: 100,
          percentage: 98,
          letter_grade: 'A+',
          grade_points: 4.0,
          weight: 0.2,
          due_date: '2024-09-30',
          status: 'published'
        }
      ]
    }
  ];

  // Restructured grading system with CA and Exam components
  const mockGradeComponents = [
    {
      component_type: 'CA', // Continuous Assessment
      component_name: 'Continuous Assessment',
      weight: 0.4, // 40% of total grade
      max_score: 100,
      assessments: [
        {
          id: 1,
          name: 'Assignment 1',
          type: 'assignment',
          max_points: 25,
          weight: 0.25, // 25% of CA
          due_date: '2024-02-15',
          submission_count: 45,
          average_score: 88.0
        },
        {
          id: 2,
          name: 'Quiz 1',
          type: 'quiz',
          max_points: 15,
          weight: 0.15, // 15% of CA
          due_date: '2024-02-28',
          submission_count: 45,
          average_score: 86.7
        },
        {
          id: 3,
          name: 'Lab Work',
          type: 'lab',
          max_points: 30,
          weight: 0.30, // 30% of CA
          due_date: '2024-03-10',
          submission_count: 45,
          average_score: 91.3
        },
        {
          id: 4,
          name: 'Participation',
          type: 'participation',
          max_points: 30,
          weight: 0.30, // 30% of CA
          due_date: '2024-04-30',
          submission_count: 45,
          average_score: 89.5
        }
      ]
    },
    {
      component_type: 'EXAM', // Final Examination
      component_name: 'Final Examination',
      weight: 0.6, // 60% of total grade
      max_score: 100,
      assessments: [
        {
          id: 5,
          name: 'Final Exam',
          type: 'final_exam',
          max_points: 100,
          weight: 1.0, // 100% of exam component
          due_date: '2024-05-15',
          submission_count: 45,
          average_score: 82.4
        }
      ]
    }
  ];

  // Keep legacy assignments for backward compatibility
  const mockAssignments = mockGradeComponents.flatMap(component =>
    component.assessments.map(assessment => ({
      assignment_type: assessment.type,
      assignment_name: assessment.name,
      points_possible: assessment.max_points,
      weight: component.weight * assessment.weight,
      due_date: assessment.due_date,
      submission_count: assessment.submission_count,
      average_score: assessment.average_score
    }))
  );

  const mockGradeDistribution = [
    { letter_grade: 'A', count: 15 },
    { letter_grade: 'B', count: 18 },
    { letter_grade: 'C', count: 8 },
    { letter_grade: 'D', count: 3 },
    { letter_grade: 'F', count: 1 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(mockCourses);
      if (mockCourses.length > 0) {
        setSelectedCourse(mockCourses[0]);

        // Filter data based on user role for privacy
        if (user?.role === 'student') {
          // Students can only see their own grades
          const currentStudentId = user?.id || 1; // In real app, get from user context
          const filteredStudents = mockStudents.filter(student => student.student_id === currentStudentId);
          setStudents(filteredStudents);

          // Filter assignments to show only the student's grades
          const filteredAssignments = mockAssignments.map(assignment => ({
            ...assignment,
            grades: assignment.grades.filter(grade => grade.student_id === currentStudentId)
          }));
          setAssignments(filteredAssignments);
        } else {
          // Admin and faculty can see all data
          setStudents(mockStudents);
          setAssignments(mockAssignments);
        }

        setGradeDistribution(mockGradeDistribution);

        // Set grade components for the new system
        setGradeComponents(mockGradeComponents);
      }
      setLoading(false);
    }, 1000);
  }, [user]);

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course);
    // In real app, fetch students and grades for this course
  };

  const handleAddGrade = () => {
    if (user?.role === 'admin' || user?.role === 'academic_staff') {
      setEditingGrade({
        enrollment_id: '',
        assignment_type: 'assignment',
        assignment_name: '',
        points_earned: '',
        points_possible: 100,
        weight: 1.0,
        due_date: '',
        comments: ''
      });
      setGradeDialogOpen(true);
    } else {
      // Show restriction dialog
      alert('Access Restricted: Only administrators and academic staff can add grades.');
    }
  };

  const handleEditGrade = (grade) => {
    if (user?.role === 'admin' || user?.role === 'academic_staff') {
      setEditingGrade(grade);
      setGradeDialogOpen(true);
    } else {
      alert('Access Restricted: Only administrators and academic staff can edit grades.');
    }
  };

  const handleSaveGrade = () => {
    // In real app, save grade to API
    logger.debug('Saving grade:', editingGrade);
    setGradeDialogOpen(false);
    setEditingGrade(null);
  };

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
            mb: 1}}
        >
          Grade Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage student grades, assignments, and academic performance
        </Typography>
      </Box>

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
                  {course.code} - {course.name}
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

          {user?.role === 'student' && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => setTranscriptOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                minWidth: 140,
                mr: 2
              }}
            >
              Download Transcript
            </Button>
          )}

          {(user?.role === 'admin' || user?.role === 'academic_staff') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddGrade}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minWidth: 140}}
            >
              Add Grade
            </Button>
          )}
        </Box>
      </GlassCard>

      {selectedCourse && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<PersonIcon />}
                color="primary"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  animation: `${fadeInUp} 0.6s ease-out 0.2s both`}}
              >
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                  {students.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Enrolled Students
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<AssessmentIcon />}
                color="secondary"
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: '#ffffff',
                  animation: `${fadeInUp} 0.6s ease-out 0.3s both`}}
              >
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                  {assignments.length}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Assignments
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<GradeIcon />}
                color="success"
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: '#ffffff',
                  animation: `${fadeInUp} 0.6s ease-out 0.4s both`}}
              >
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                  {(students.reduce((sum, s) => sum + s.current_grade, 0) / students.length).toFixed(2)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Class Average
                </Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<TrendingUpIcon />}
                color="warning"
                sx={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#ffffff',
                  animation: `${fadeInUp} 0.6s ease-out 0.5s both`}}
              >
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                  {gradeDistribution.find(g => g.letter_grade === 'A')?.count || 0}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  A Students
                </Typography>
              </StatsCard>
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
                            backgroundColor: 'rgba(102, 126, 234, 0.05)'}}}
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
                                fontWeight: 700}}
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
                              fontWeight: 600}}
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
                                  borderRadius: 4}}}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditGrade(student.grades[0])}
                          >
                            Edit
                          </Button>
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
                          animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`}}
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
                        animation: `${fadeInUp} 0.6s ease-out ${index * 0.1}s both`}}
                    >
                      <Typography variant="h6" sx={{ minWidth: 40, fontWeight: 700 }}>
                        {grade.letter_grade}
                      </Typography>
                      <Box sx={{ flexGrow: 1, mx: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(grade.count / students.length) * 100}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: '#f3f4f6',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getLetterGradeColor(grade.letter_grade),
                              borderRadius: 6}}}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="600" sx={{ minWidth: 60 }}>
                        {grade.count} ({((grade.count / students.length) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    Class Statistics
                  </Typography>
                  <Box sx={{ p: 2, background: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                    <Typography variant="body2" paragraph>
                      <strong>Total Students:</strong> {students.length}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Class Average:</strong> {(students.reduce((sum, s) => sum + s.current_grade, 0) / students.length).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Highest Grade:</strong> {Math.max(...students.map(s => s.current_grade)).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Lowest Grade:</strong> {Math.min(...students.map(s => s.current_grade)).toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Pass Rate:</strong> {((students.filter(s => s.current_grade >= 2.0).length / students.length) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </GlassCard>
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
                    <MenuItem value="final">Final Exam</MenuItem>
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Points Earned"
                  type="number"
                  value={editingGrade.points_earned}
                  onChange={(e) => setEditingGrade({...editingGrade, points_earned: parseFloat(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Points Possible"
                  type="number"
                  value={editingGrade.points_possible}
                  onChange={(e) => setEditingGrade({...editingGrade, points_possible: parseFloat(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Weight"
                  type="number"
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  value={editingGrade.weight}
                  onChange={(e) => setEditingGrade({...editingGrade, weight: parseFloat(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={editingGrade.due_date}
                  onChange={(e) => setEditingGrade({...editingGrade, due_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Comments"
                  multiline
                  rows={3}
                  value={editingGrade.comments}
                  onChange={(e) => setEditingGrade({...editingGrade, comments: e.target.value})}
                />
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
        studentData={user?.role === 'student' ? user : null}
      />
    </Box>
  );
};

export default GradesPage;
