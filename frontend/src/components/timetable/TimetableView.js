import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Schedule,
  Person,
  Room,
  Computer,
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import axios from 'axios';

const TimetableView = () => {
  const [timetables, setTimetables] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    facultyId: '',
    majorId: '',
    semester: 1,
    academicYear: new Date().getFullYear().toString()
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    lecturerId: '',
    hall: '',
    isOnline: false,
    notes: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    fetchFaculties();
    fetchMajors();
  }, []);

  useEffect(() => {
    if (filters.facultyId && filters.majorId) {
      fetchTimetables();
    }
  }, [filters]);

  const fetchFaculties = async () => {
    try {
      const response = await axios.get('/api/faculties', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFaculties(response.data.faculties || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const fetchMajors = async () => {
    try {
      const response = await axios.get('/api/majors', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMajors(response.data.majors || []);
    } catch (error) {
      console.error('Error fetching majors:', error);
    }
  };

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/timetables?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTimetables(response.data.timetables || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch timetables');
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTimetable = () => {
    setEditingTimetable(null);
    setFormData({
      courseId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      lecturerId: '',
      hall: '',
      isOnline: false,
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleEditTimetable = (timetable) => {
    setEditingTimetable(timetable);
    setFormData({
      courseId: timetable.courseId,
      dayOfWeek: timetable.dayOfWeek,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      lecturerId: timetable.lecturerId,
      hall: timetable.hall,
      isOnline: timetable.isOnline,
      notes: timetable.notes || ''
    });
    setDialogOpen(true);
  };

  const handleSaveTimetable = async () => {
    try {
      const data = {
        ...formData,
        facultyId: filters.facultyId,
        majorId: filters.majorId,
        semester: filters.semester,
        academicYear: filters.academicYear
      };

      if (editingTimetable) {
        await axios.put(`/api/timetables/${editingTimetable.id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('/api/timetables', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }

      setDialogOpen(false);
      fetchTimetables();
    } catch (error) {
      console.error('Error saving timetable:', error);
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (window.confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        await axios.delete(`/api/timetables/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchTimetables();
      } catch (error) {
        console.error('Error deleting timetable:', error);
      }
    }
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const groupTimetablesByDay = () => {
    const grouped = {};
    daysOfWeek.forEach(day => {
      grouped[day] = timetables.filter(t => t.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  };

  const renderTimetableGrid = () => {
    const groupedTimetables = groupTimetablesByDay();
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              {daysOfWeek.map(day => (
                <TableCell key={day} align="center">
                  <Typography variant="h6">{day}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(time => (
              <TableRow key={time}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {formatTime(time)}
                  </Typography>
                </TableCell>
                {daysOfWeek.map(day => {
                  const dayTimetables = groupedTimetables[day] || [];
                  const timetableAtTime = dayTimetables.find(t => 
                    t.startTime <= time && t.endTime > time
                  );
                  
                  return (
                    <TableCell key={`${day}-${time}`} align="center">
                      {timetableAtTime && (
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            minHeight: 80, 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => handleEditTimetable(timetableAtTime)}
                        >
                          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Typography variant="caption" fontWeight="bold">
                              {timetableAtTime.course?.name || 'Course'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {timetableAtTime.lecturer?.firstName} {timetableAtTime.lecturer?.lastName}
                            </Typography>
                            <Chip
                              label={timetableAtTime.isOnline ? 'Online' : timetableAtTime.hall}
                              size="small"
                              color={timetableAtTime.isOnline ? 'primary' : 'default'}
                              icon={timetableAtTime.isOnline ? <Computer /> : <Room />}
                            />
                          </CardContent>
                        </Card>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderTimetableList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Day</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Lecturer</TableCell>
            <TableCell>Hall</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {timetables.map((timetable) => (
            <TableRow key={timetable.id}>
              <TableCell>{timetable.dayOfWeek}</TableCell>
              <TableCell>
                {formatTime(timetable.startTime)} - {formatTime(timetable.endTime)}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {timetable.course?.name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {timetable.course?.code || ''}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Person sx={{ mr: 1, fontSize: 16 }} />
                  {timetable.lecturer?.firstName} {timetable.lecturer?.lastName}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={timetable.isOnline ? 'Online' : timetable.hall}
                  color={timetable.isOnline ? 'primary' : 'default'}
                  icon={timetable.isOnline ? <Computer /> : <Room />}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleEditTimetable(timetable)}
                  startIcon={<Edit />}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTimetable(timetable.id)}
                  startIcon={<Delete />}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
        ICTU Timetable Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Faculty</InputLabel>
              <Select
                value={filters.facultyId}
                onChange={(e) => handleFilterChange('facultyId', e.target.value)}
                label="Faculty"
              >
                {faculties.map(faculty => (
                  <MenuItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Major</InputLabel>
              <Select
                value={filters.majorId}
                onChange={(e) => handleFilterChange('majorId', e.target.value)}
                label="Major"
              >
                {majors.map(major => (
                  <MenuItem key={major.id} value={major.id}>
                    {major.name} ({major.level})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Semester"
              type="number"
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', parseInt(e.target.value))}
              inputProps={{ min: 1, max: 8 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Academic Year"
              value={filters.academicYear}
              onChange={(e) => handleFilterChange('academicYear', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddTimetable}
              startIcon={<Add />}
            >
              Add Entry
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : timetables.length > 0 ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Timetable Grid View
          </Typography>
          {renderTimetableGrid()}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            List View
          </Typography>
          {renderTimetableList()}
        </Box>
      ) : (
        <Alert severity="info">
          No timetable entries found for the selected criteria.
        </Alert>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTimetable ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  label="Day of Week"
                >
                  {daysOfWeek.map(day => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hall/Room"
                value={formData.hall}
                onChange={(e) => setFormData(prev => ({ ...prev, hall: e.target.value }))}
                placeholder="Enter hall name or 'Online' for online classes"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or instructions..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTimetable} variant="contained">
            {editingTimetable ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetableView;
