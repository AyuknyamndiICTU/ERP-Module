import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Skeleton,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  keyframes,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { academicAPI } from '../../services/api';
import logger from '../../utils/logger';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Week day names
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const TimetablePage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    academicYear: new Date().getFullYear().toString(),
    semester: '',
    facultyId: '',
    dayOfWeek: '',
  });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('view'); // 'view', 'create', 'edit'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch timetable data
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filters.academicYear) params.academicYear = filters.academicYear;
      if (filters.semester) params.semester = filters.semester;
      if (filters.facultyId) params.facultyId = filters.facultyId;
      if (filters.dayOfWeek) params.dayOfWeek = filters.dayOfWeek;

      const response = await academicAPI.getTimetables(params);
      const data = response.data.timetables || [];

      // Organize data by day and time
      const organizedData = DAYS_OF_WEEK.map(day => ({
        day,
        entries: data.filter(entry => entry.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
      }));

      setTimetableData(organizedData);
    } catch (error) {
      logger.error('Error fetching timetable:', error);
      setError(error.response?.data?.message || 'Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle entry actions
  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleCreateEntry = () => {
    setSelectedEntry(null);
    setFormData({
      courseId: '',
      facultyId: '',
      majorId: '',
      semester: 1,
      academicYear: filters.academicYear || new Date().getFullYear().toString(),
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      lecturerId: user?.id || '',
      hall: '',
      isOnline: false,
      notes: '',
    });
    setDialogType('create');
    setDialogOpen(true);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      courseId: entry.courseId,
      facultyId: entry.facultyId,
      majorId: entry.majorId,
      semester: entry.semester,
      academicYear: entry.academicYear,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      lecturerId: entry.lecturerId,
      hall: entry.hall,
      isOnline: entry.isOnline,
      notes: entry.notes,
    });
    setDialogType('edit');
    setDialogOpen(true);
  };

  // Format time display
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'rescheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Initialize and fetch data
  useEffect(() => {
    fetchTimetable();
  }, [filters]);

  // Render loading state
  if (loading && timetableData.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading timetable data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h3" sx={{
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '1.75rem', md: '3rem' }
              }}>
                <ScheduleIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
                Timetable
              </Typography>
              <Typography variant="body1" sx={{
                opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}>
                View and manage your academic schedule
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                borderRadius: 3,
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                }
              }}
              onClick={handleCreateEntry}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add Entry
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Academic Year"
                value={filters.academicYear}
                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>Semester</InputLabel>
                <Select
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  }}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="1">Semester 1</MenuItem>
                  <MenuItem value="2">Semester 2</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Faculty"
                value={filters.facultyId}
                onChange={(e) => handleFilterChange('facultyId', e.target.value)}
                placeholder="Enter Faculty ID"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <IconButton
                onClick={fetchTimetable}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  borderRadius: 3,
                  width: 56,
                  height: 56,
                  mr: 2,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Timetable Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {timetableData.map((dayData, index) => (
            <Grid item xs={12} md={6} lg={4} key={dayData.day}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  animation: `${slideInLeft} 0.6s ease-out ${index * 0.1}s both`,
                  '&:hover': {
                    boxShadow: '0 12px 28px rgba(102, 126, 234, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {DAY_LABELS[dayData.day]}
                    </Typography>
                    <Chip
                      label={`${dayData.entries.length} classes`}
                      size="small"
                      sx={{
                        ml: 'auto',
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: 'primary.main'
                      }}
                    />
                  </Box>

                  {dayData.entries.length === 0 ? (
                    <Box sx={{
                      textAlign: 'center',
                      py: 4,
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: 2,
                      border: '2px dashed rgba(102, 126, 234, 0.2)'
                    }}>
                      <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No classes scheduled
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {dayData.entries.map((entry) => (
                        <Box
                          key={entry.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: entry.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                                       entry.status === 'rescheduled' ? 'rgba(245, 158, 11, 0.1)' :
                                       'rgba(59, 130, 246, 0.05)',
                            border: `1px solid ${entry.status === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' :
                                           entry.status === 'rescheduled' ? 'rgba(245, 158, 11, 0.3)' :
                                           'rgba(59, 130, 246, 0.2)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              borderColor: 'primary.main',
                            },
                          }}
                          onClick={() => handleEntryClick(entry)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {entry.course?.courseName || 'Unknown Course'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {entry.course?.courseCode || 'N/A'}
                              </Typography>
                            </Box>
                            <Chip
                              label={entry.status}
                              size="small"
                              color={getStatusColor(entry.status)}
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ScheduleIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {entry.isOnline ? 'Online' : (entry.hall || 'TBA')}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {entry.lecturer?.firstName && entry.lecturer?.lastName ?
                                  `${entry.lecturer.firstName} ${entry.lecturer.lastName}` :
                                  entry.lecturer?.email || 'Unknown Lecturer'}
                              </Typography>
                            </Box>

                            {user?.role === 'admin' || user?.role === 'faculty_coordinator' || user?.role === 'major_coordinator' ? (
                              <Box>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditEntry(entry);
                                    }}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle delete
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : null}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'create' ? 'Add Timetable Entry' :
           dialogType === 'edit' ? 'Edit Timetable Entry' :
           'View Timetable Entry'}
        </DialogTitle>
        <DialogContent>
          {selectedEntry && dialogType === 'view' ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedEntry.course?.courseName || 'Unknown Course'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedEntry.course?.courseCode || 'N/A'}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {formatTime(selectedEntry.startTime)} - {formatTime(selectedEntry.endTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {DAY_LABELS[selectedEntry.dayOfWeek]} - Semester {selectedEntry.semester}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      Lecturer: {selectedEntry.lecturer?.firstName && selectedEntry.lecturer?.lastName ?
                                `${selectedEntry.lecturer.firstName} ${selectedEntry.lecturer.lastName}` :
                                selectedEntry.lecturer?.email || 'Unknown'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      Location: {selectedEntry.isOnline ? 'Online' : (selectedEntry.hall || 'TBA')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Status:</strong> {' '}
                    <Chip
                      label={selectedEntry.status}
                      color={getStatusColor(selectedEntry.status)}
                      size="small"
                    />
                  </Typography>
                  {selectedEntry.notes && (
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Notes:</strong> {selectedEntry.notes}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Course ID"
                    value={formData.courseId || ''}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lecturer ID"
                    value={formData.lecturerId || ''}
                    onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      value={formData.dayOfWeek || ''}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <MenuItem key={day} value={day}>
                          {DAY_LABELS[day]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hall/Room"
                    value={formData.hall || ''}
                    onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {dialogType !== 'view' && (
            <Button onClick={() => setDialogOpen(false)} variant="contained">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TimetablePage;
