import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const MarksEntryForm = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [publishDialog, setPublishDialog] = useState(false);
  const [marksType, setMarksType] = useState('ca'); // 'ca' or 'exam'

  useEffect(() => {
    fetchLecturerCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchEnrolledStudents();
    }
  }, [selectedCourse]);

  const fetchLecturerCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses', {
        params: { lecturerId: user.id },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCourses(response.data.courses || getFallbackCourses());
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(getFallbackCourses());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackCourses = () => [
    {
      id: '1',
      name: 'Introduction to Programming',
      code: 'CS101',
      semester: 'Fall 2024',
      department: { name: 'Computer Science' }
    },
    {
      id: '2',
      name: 'Database Systems',
      code: 'CS201',
      semester: 'Fall 2024',
      department: { name: 'Computer Science' }
    },
    {
      id: '3',
      name: 'Web Development',
      code: 'CS301',
      semester: 'Fall 2024',
      department: { name: 'Computer Science' }
    }
  ];

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${selectedCourse}/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const studentsData = response.data.students || getFallbackStudents();
      setStudents(studentsData);
      
      // Initialize marks state
      const initialMarks = {};
      studentsData.forEach(student => {
        initialMarks[student.id] = {
          caMarks: student.grades?.caMarks || '',
          examMarks: student.grades?.examMarks || '',
          totalMarks: student.grades?.totalMarks || '',
          grade: student.grades?.grade || '',
          status: student.grades?.status || 'draft'
        };
      });
      setMarks(initialMarks);
    } catch (error) {
      console.error('Error fetching students:', error);
      const fallbackStudents = getFallbackStudents();
      setStudents(fallbackStudents);
      
      const initialMarks = {};
      fallbackStudents.forEach(student => {
        initialMarks[student.id] = {
          caMarks: '',
          examMarks: '',
          totalMarks: '',
          grade: '',
          status: 'draft'
        };
      });
      setMarks(initialMarks);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackStudents = () => [
    {
      id: '1',
      matricule: 'ICTU20241001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@student.ictu.edu.cm',
      department: { name: 'Computer Science' },
      major: { name: 'Undergraduate' }
    },
    {
      id: '2',
      matricule: 'ICTU20241002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@student.ictu.edu.cm',
      department: { name: 'Computer Science' },
      major: { name: 'Undergraduate' }
    },
    {
      id: '3',
      matricule: 'ICTU20241003',
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@student.ictu.edu.cm',
      department: { name: 'Computer Science' },
      major: { name: 'Masters' }
    },
    {
      id: '4',
      matricule: 'ICTU20241004',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@student.ictu.edu.cm',
      department: { name: 'Computer Science' },
      major: { name: 'Undergraduate' }
    },
    {
      id: '5',
      matricule: 'ICTU20241005',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@student.ictu.edu.cm',
      department: { name: 'Computer Science' },
      major: { name: 'PhD' }
    }
  ];

  const handleMarksChange = (studentId, field, value) => {
    const numValue = parseFloat(value) || 0;
    
    // Validate marks range
    if (field === 'caMarks' && numValue > 30) return;
    if (field === 'examMarks' && numValue > 70) return;
    if (numValue < 0) return;

    setMarks(prev => {
      const updated = { ...prev };
      updated[studentId] = { ...updated[studentId], [field]: value };
      
      // Auto-calculate total and grade
      if (field === 'caMarks' || field === 'examMarks') {
        const ca = parseFloat(updated[studentId].caMarks) || 0;
        const exam = parseFloat(updated[studentId].examMarks) || 0;
        const total = ca + exam;
        
        updated[studentId].totalMarks = total.toString();
        updated[studentId].grade = calculateGrade(total);
      }
      
      return updated;
    });
  };

  const calculateGrade = (total) => {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'secondary';
      case 'F': return 'error';
      default: return 'default';
    }
  };

  const saveMarks = async (publish = false) => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const marksData = Object.entries(marks).map(([studentId, studentMarks]) => ({
        studentId,
        courseId: selectedCourse,
        caMarks: parseFloat(studentMarks.caMarks) || 0,
        examMarks: parseFloat(studentMarks.examMarks) || 0,
        totalMarks: parseFloat(studentMarks.totalMarks) || 0,
        grade: studentMarks.grade,
        status: publish ? 'published' : 'draft'
      }));

      await axios.post('/api/grades/bulk', {
        grades: marksData,
        courseId: selectedCourse,
        publish
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess(publish ? 'Marks published successfully!' : 'Marks saved as draft successfully!');
      
      if (publish) {
        // Update local state to reflect published status
        setMarks(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(studentId => {
            updated[studentId].status = 'published';
          });
          return updated;
        });
        setPublishDialog(false);
      }

    } catch (error) {
      console.error('Error saving marks:', error);
      setError(error.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const exportMarks = () => {
    if (!selectedCourse || students.length === 0) return;

    const course = courses.find(c => c.id === selectedCourse);
    const csvContent = [
      ['Matricule', 'Name', 'Email', 'CA Marks (30)', 'Exam Marks (70)', 'Total (100)', 'Grade'],
      ...students.map(student => [
        student.matricule,
        `${student.firstName} ${student.lastName}`,
        student.email,
        marks[student.id]?.caMarks || '',
        marks[student.id]?.examMarks || '',
        marks[student.id]?.totalMarks || '',
        marks[student.id]?.grade || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course?.code || 'course'}_marks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getMarksStats = () => {
    const totalStudents = students.length;
    const gradedStudents = Object.values(marks).filter(m => m.totalMarks && parseFloat(m.totalMarks) > 0).length;
    const publishedStudents = Object.values(marks).filter(m => m.status === 'published').length;
    
    return { totalStudents, gradedStudents, publishedStudents };
  };

  const stats = getMarksStats();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          CA & Exam Marks Entry
        </Typography>
        
        {/* Course Selection */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Course</InputLabel>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                label="Select Course"
              >
                {courses.map(course => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.code} - {course.name} ({course.semester})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2} alignItems="center" height="100%">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchEnrolledStudents}
                disabled={!selectedCourse || loading}
              >
                Refresh Students
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportMarks}
                disabled={!selectedCourse || students.length === 0}
              >
                Export CSV
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Statistics Cards */}
        {selectedCourse && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Graded Students
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.gradedStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Published Marks
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.publishedStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Alert Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Marks Entry Table */}
        {selectedCourse && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Student Marks Entry
              </Typography>
              
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => saveMarks(false)}
                  disabled={saving || students.length === 0}
                >
                  {saving ? <CircularProgress size={20} /> : 'Save Draft'}
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<PublishIcon />}
                  onClick={() => setPublishDialog(true)}
                  disabled={saving || students.length === 0 || stats.gradedStudents === 0}
                >
                  Publish Marks
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>
                        CA Marks
                        <Tooltip title="Continuous Assessment marks out of 30">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        Exam Marks
                        <Tooltip title="Examination marks out of 70">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>Total (100)</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {student.matricule}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {student.firstName} {student.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {student.major?.name} - {student.department?.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {student.email}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={marks[student.id]?.caMarks || ''}
                            onChange={(e) => handleMarksChange(student.id, 'caMarks', e.target.value)}
                            inputProps={{ min: 0, max: 30, step: 0.5 }}
                            sx={{ width: 80 }}
                            placeholder="0-30"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={marks[student.id]?.examMarks || ''}
                            onChange={(e) => handleMarksChange(student.id, 'examMarks', e.target.value)}
                            inputProps={{ min: 0, max: 70, step: 0.5 }}
                            sx={{ width: 80 }}
                            placeholder="0-70"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {marks[student.id]?.totalMarks || '0'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          {marks[student.id]?.grade && (
                            <Chip
                              label={marks[student.id].grade}
                              color={getGradeColor(marks[student.id].grade)}
                              size="small"
                            />
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={marks[student.id]?.status || 'draft'}
                            color={marks[student.id]?.status === 'published' ? 'success' : 'default'}
                            size="small"
                            icon={marks[student.id]?.status === 'published' ? <CheckCircleIcon /> : <WarningIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>

      {/* Publish Confirmation Dialog */}
      <Dialog open={publishDialog} onClose={() => setPublishDialog(false)}>
        <DialogTitle>Publish Marks</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to publish the marks for this course? 
            Once published, students will be able to view their grades and the marks cannot be easily modified.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              • {stats.gradedStudents} out of {stats.totalStudents} students have been graded
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Students will receive notifications about their published grades
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => saveMarks(true)} 
            variant="contained" 
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Publish Marks'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarksEntryForm;
