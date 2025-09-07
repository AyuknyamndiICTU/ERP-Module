import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Download,
  Visibility,
  Assignment,
  Quiz,
  School
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../common/RoleGuard';

const GradeManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [caMarks, setCaMarks] = useState([]);
  const [examMarks, setExamMarks] = useState([]);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const isStudent = user?.role === 'student';
  const canManageGrades = ['admin', 'teacher'].includes(user?.role);

  // Mock data - replace with API calls
  useEffect(() => {
    // Fetch grades based on user role
    if (isStudent) {
      // Fetch only student's own grades
      setGrades([
        {
          id: 1,
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          assignments: 85,
          ca: 78,
          exam: 82,
          total: 81.5,
          grade: 'A-',
          semester: 'Fall 2024'
        },
        {
          id: 2,
          courseCode: 'MATH201',
          courseName: 'Calculus II',
          assignments: 92,
          ca: 88,
          exam: 85,
          total: 88.3,
          grade: 'A',
          semester: 'Fall 2024'
        }
      ]);
    } else {
      // Fetch all grades for admin/teacher
      setGrades([
        {
          id: 1,
          studentName: 'John Doe',
          studentId: 'STU001',
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          assignments: 85,
          ca: 78,
          exam: 82,
          total: 81.5,
          grade: 'A-'
        },
        {
          id: 2,
          studentName: 'Jane Smith',
          studentId: 'STU002',
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          assignments: 92,
          ca: 88,
          exam: 85,
          total: 88.3,
          grade: 'A'
        }
      ]);
    }
  }, [isStudent]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddGrade = () => {
    setSelectedGrade(null);
    setOpenGradeDialog(true);
  };

  const handleEditGrade = (grade) => {
    setSelectedGrade(grade);
    setOpenGradeDialog(true);
  };

  const handleDownloadTranscript = () => {
    // Implement PDF download functionality
    console.log('Downloading transcript...');
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'success';
      case 'A-':
      case 'B+':
        return 'info';
      case 'B':
      case 'B-':
        return 'warning';
      default:
        return 'error';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isStudent ? 'My Grades' : 'Grade Management'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isStudent && (
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadTranscript}
              sx={{ textTransform: 'none' }}
            >
              Download Transcript
            </Button>
          )}
          
          <RoleGuard allowedRoles={['admin', 'teacher']}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddGrade}
              sx={{ textTransform: 'none' }}
            >
              Add Grade
            </Button>
          </RoleGuard>
        </Box>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overall Grades" />
            <Tab label="Assignments" />
            <Tab label="CA Marks" />
            <Tab label="Exam Marks" />
            {isStudent && <Tab label="Transcript" />}
            {canManageGrades && <Tab label="Statistics" />}
          </Tabs>
        </Box>

        {/* Overall Grades Tab */}
        <TabPanel value={activeTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {!isStudent && (
                    <>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Student ID</TableCell>
                    </>
                  )}
                  <TableCell>Course Code</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell align="center">Assignments</TableCell>
                  <TableCell align="center">CA</TableCell>
                  <TableCell align="center">Exam</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Grade</TableCell>
                  {canManageGrades && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    {!isStudent && (
                      <>
                        <TableCell>{grade.studentName}</TableCell>
                        <TableCell>{grade.studentId}</TableCell>
                      </>
                    )}
                    <TableCell sx={{ fontWeight: 'bold' }}>{grade.courseCode}</TableCell>
                    <TableCell>{grade.courseName}</TableCell>
                    <TableCell align="center">{grade.assignments}%</TableCell>
                    <TableCell align="center">{grade.ca}%</TableCell>
                    <TableCell align="center">{grade.exam}%</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {grade.total}%
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={grade.grade}
                        color={getGradeColor(grade.grade)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    {canManageGrades && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditGrade(grade)}
                        >
                          <Edit />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Assignments Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Assignment Submissions</Typography>
            <RoleGuard allowedRoles={['admin', 'teacher']}>
              <Button
                variant="outlined"
                startIcon={<Assignment />}
                sx={{ textTransform: 'none' }}
              >
                Create Assignment
              </Button>
            </RoleGuard>
          </Box>
          
          <Grid container spacing={2}>
            {[1, 2, 3].map((assignment) => (
              <Grid item xs={12} md={6} lg={4} key={assignment}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Assignment {assignment}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Due: Dec 15, 2024
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Chip label="Submitted" color="success" size="small" />
                      <Typography variant="h6" color="primary">
                        85/100
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* CA Marks Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Continuous Assessment Marks
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            CA marks include quizzes, class participation, and mid-term assessments.
          </Alert>
          {/* CA marks content */}
        </TabPanel>

        {/* Exam Marks Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Final Examination Marks
          </Typography>
          {/* Exam marks content */}
        </TabPanel>

        {/* Transcript Tab (Students only) */}
        {isStudent && (
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Academic Transcript</Typography>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownloadTranscript}
                sx={{ textTransform: 'none' }}
              >
                Download PDF
              </Button>
            </Box>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" align="center" gutterBottom>
                OFFICIAL TRANSCRIPT
              </Typography>
              <Typography align="center" color="text.secondary" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Fall 2024 Semester
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course Code</TableCell>
                        <TableCell>Course Title</TableCell>
                        <TableCell align="center">Credits</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell align="center">Points</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell>{grade.courseCode}</TableCell>
                          <TableCell>{grade.courseName}</TableCell>
                          <TableCell align="center">3</TableCell>
                          <TableCell align="center">{grade.grade}</TableCell>
                          <TableCell align="center">
                            {grade.grade === 'A' ? '4.0' : grade.grade === 'A-' ? '3.7' : '3.3'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="h6">
                    Semester GPA: 3.75
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </TabPanel>
        )}

        {/* Statistics Tab (Admin/Teacher only) */}
        {canManageGrades && (
          <TabPanel value={activeTab} index={isStudent ? 5 : 4}>
            <Typography variant="h6" gutterBottom>
              Grade Statistics & Reports
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class Performance
                    </Typography>
                    <Typography variant="h4" color="primary">
                      82.5%
                    </Typography>
                    <Typography color="text.secondary">
                      Average Grade
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pass Rate
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      95%
                    </Typography>
                    <Typography color="text.secondary">
                      Students Passing
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        )}
      </Card>

      {/* Grade Dialog */}
      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGrade ? 'Edit Grade' : 'Add New Grade'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Student"
                defaultValue={selectedGrade?.studentName || ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course"
                defaultValue={selectedGrade?.courseName || ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Assignment Score"
                type="number"
                defaultValue={selectedGrade?.assignments || ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="CA Score"
                type="number"
                defaultValue={selectedGrade?.ca || ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Exam Score"
                type="number"
                defaultValue={selectedGrade?.exam || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradeDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedGrade ? 'Update' : 'Add'} Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradeManagement;
