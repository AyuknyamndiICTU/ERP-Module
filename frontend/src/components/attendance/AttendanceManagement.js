import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  School
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../common/RoleGuard';

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const canManageAttendance = ['admin', 'teacher'].includes(user?.role);
  const isStudent = user?.role === 'student';

  // Mock data - replace with API calls
  useEffect(() => {
    if (isStudent) {
      // Student sees only their own attendance
      setAttendanceRecords([
        {
          id: 1,
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          date: '2024-12-20',
          status: 'present',
          time: '09:00 AM',
          lecturer: 'Dr. Smith'
        },
        {
          id: 2,
          courseCode: 'MATH201',
          courseName: 'Calculus II',
          date: '2024-12-20',
          status: 'absent',
          time: '11:00 AM',
          lecturer: 'Prof. Johnson'
        },
        {
          id: 3,
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          date: '2024-12-19',
          status: 'present',
          time: '09:00 AM',
          lecturer: 'Dr. Smith'
        }
      ]);
    } else {
      // Admin/Teacher sees all attendance records
      setAttendanceRecords([
        {
          id: 1,
          studentName: 'John Doe',
          studentId: 'STU001',
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          date: '2024-12-20',
          status: 'present',
          time: '09:00 AM'
        },
        {
          id: 2,
          studentName: 'Jane Smith',
          studentId: 'STU002',
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          date: '2024-12-20',
          status: 'absent',
          time: '09:00 AM'
        },
        {
          id: 3,
          studentName: 'Mike Johnson',
          studentId: 'STU003',
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          date: '2024-12-20',
          status: 'late',
          time: '09:00 AM'
        }
      ]);
    }
  }, [isStudent]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle />;
      case 'absent':
        return <Cancel />;
      case 'late':
        return <Schedule />;
      default:
        return null;
    }
  };

  const handleTakeAttendance = () => {
    setOpenAttendanceDialog(true);
  };

  const handleMarkAttendance = (recordId, newStatus) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.id === recordId ? { ...record, status: newStatus } : record
      )
    );
  };

  const calculateAttendanceStats = () => {
    if (isStudent) {
      const total = attendanceRecords.length;
      const present = attendanceRecords.filter(r => r.status === 'present').length;
      const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
      return { total, present, percentage };
    }
    return null;
  };

  const stats = calculateAttendanceStats();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isStudent ? 'My Attendance' : 'Attendance Management'}
        </Typography>
        
        <RoleGuard allowedRoles={['admin', 'teacher']}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleTakeAttendance}
            sx={{ textTransform: 'none' }}
          >
            Take Attendance
          </Button>
        </RoleGuard>
      </Box>

      {/* Student Attendance Stats */}
      {isStudent && stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {stats.percentage}%
                </Typography>
                <Typography color="text.secondary">
                  Attendance Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {stats.present}
                </Typography>
                <Typography color="text.secondary">
                  Courses Attended
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Typography color="text.secondary">
                  Total Courses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Attendance Records */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isStudent ? 'Attendance History' : 'Trainee Attendance Records'}
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  {!isStudent && (
                    <>
                      <TableCell>Trainee Name</TableCell>
                      <TableCell>Trainee ID</TableCell>
                    </>
                  )}
                  <TableCell>Course</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  {isStudent && <TableCell>Lecturer</TableCell>}
                  <TableCell align="center">Status</TableCell>
                  {canManageAttendance && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    {!isStudent && (
                      <>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" color="action" />
                            {record.studentName}
                          </Box>
                        </TableCell>
                        <TableCell>{record.studentId}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {record.courseCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.courseName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    {isStudent && <TableCell>{record.lecturer}</TableCell>}
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(record.status)}
                        label={record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                        color={getStatusColor(record.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          minWidth: 100
                        }}
                      />
                    </TableCell>
                    {canManageAttendance && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Mark Present">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleMarkAttendance(record.id, 'present')}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark Absent">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleMarkAttendance(record.id, 'absent')}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark Late">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleMarkAttendance(record.id, 'late')}
                            >
                              <Schedule fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {attendanceRecords.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No attendance records found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Take Attendance Dialog */}
      <Dialog 
        open={openAttendanceDialog} 
        onClose={() => setOpenAttendanceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School />
            Take Attendance
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  label="Course"
                >
                  <MenuItem value="CS101">CS101 - Introduction to Programming</MenuItem>
                  <MenuItem value="MATH201">MATH201 - Calculus II</MenuItem>
                  <MenuItem value="ENG101">ENG101 - English Composition</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            Select a course and date to begin taking attendance. You can mark trainees as Present, Absent, Late, or Excused.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttendanceDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            disabled={!selectedCourse}
            onClick={() => {
              // Implement attendance taking logic
              setOpenAttendanceDialog(false);
            }}
          >
            Start Taking Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement;
