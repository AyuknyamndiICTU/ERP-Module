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
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  keyframes,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  Grade as GradeIcon,
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

// Exam types and statuses
const EXAM_TYPES = [
  { value: 'midterm', label: 'Midterm' },
  { value: 'final', label: 'Final Exam' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'project', label: 'Project' },
  { value: 'practical', label: 'Practical' },
];

const EXAM_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'postponed', label: 'Postponed' },
];

const ExamsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    courseId: '',
    semester: '',
    examType: '',
    status: '',
    academicYear: new Date().getFullYear().toString(),
  });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('view'); // 'view', 'create', 'edit'
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishing, setPublishing] = useState(false);

  // Fetch exams data
  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filters.courseId) params.courseId = filters.courseId;
      if (filters.semester) params.semester = filters.semester;
      if (filters.examType) params.examType = filters.examType;
      if (filters.status) params.status = filters.status;
      if (filters.academicYear) params.academicYear = filters.academicYear;

      const response = await academicAPI.getExams(params);
      setExams(response.data || []);
    } catch (error) {
      logger.error('Error fetching exams:', error);
      setError(error.response?.data?.message || 'Failed to load exams');
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

  // Handle exam actions
  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleCreateExam = () => {
    setSelectedExam(null);
    setFormData({
      courseId: '',
      lecturerId: user?.id || '',
      examType: '',
      title: '',
      description: '',
      examDate: '',
      startTime: '',
      endTime: '',
      duration: '',
      totalMarks: '',
      passingMarks: '',
      semester: 1,
      academicYear: filters.academicYear || new Date().getFullYear().toString(),
      location: '',
      instructions: '',
      status: 'scheduled',
      isPublished: false,
      allowLateSubmission: false,
      lateSubmissionDeadline: '',
      submissionInstructions: '',
    });
    setDialogType('create');
    setDialogOpen(true);
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setFormData({
      courseId: exam.courseId,
      lecturerId: exam.lecturerId,
      examType: exam.examType,
      title: exam.title,
      description: exam.description,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      semester: exam.semester,
      academicYear: exam.academicYear,
      location: exam.location,
      instructions: exam.instructions,
      status: exam.status,
      isPublished: exam.isPublished,
      allowLateSubmission: exam.allowLateSubmission,
      lateSubmissionDeadline: exam.lateSubmissionDeadline,
      submissionInstructions: exam.submissionInstructions,
    });
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handlePublishExam = async (exam) => {
    try {
      setPublishing(true);
      await academicAPI.publishExam(exam.id, {
        publishedBy: user.id,
        publishedAt: new Date().toISOString(),
        isPublished: true
      });
      fetchExams(); // Refresh the list
    } catch (error) {
      logger.error('Error publishing exam:', error);
      setError('Failed to publish exam');
    } finally {
      setPublishing(false);
    }
  };

  // Create exam handler
  const onCreateExam = async () => {
    try {
      setError(null);
      await academicAPI.createExam(formData);
      setDialogOpen(false);
      fetchExams();
    } catch (error) {
      logger.error('Error creating exam:', error);
      setError(error.message || 'Failed to create exam');
    }
  };

  // Update exam handler
  const onUpdateExam = async () => {
    try {
      setError(null);
      await academicAPI.updateExam(selectedExam.id, formData);
      setDialogOpen(false);
      fetchExams();
    } catch (error) {
      logger.error('Error updating exam:', error);
      setError(error.message || 'Failed to update exam');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'ongoing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'postponed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get exam type color
  const getExamTypeColor = (examType) => {
    switch (examType) {
      case 'midterm':
        return 'info';
      case 'final':
        return 'error';
      case 'quiz':
        return 'warning';
      case 'assignment':
        return 'success';
      case 'project':
        return 'secondary';
      case 'practical':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Check if user can manage exams
  const canManageExams = () => {
    return ['lecturer', 'faculty_coordinator', 'major_coordinator', 'admin'].includes(user?.role);
  };

  // Initialize and fetch data
  useEffect(() => {
    fetchExams();
  }, [filters]);

  // Render loading state
  if (loading && exams.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading exams...
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
                <AssessmentIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
                Exams & Assessments
              </Typography>
              <Typography variant="body1" sx={{
                opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}>
                Manage course examinations and assessments
              </Typography>
            </Box>
            {canManageExams() && (
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
                onClick={handleCreateExam}
              >
                <AddIcon sx={{ mr: 1 }} />
                Create Exam
              </Button>
            )}
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
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>Exam Type</InputLabel>
                <Select
                  value={filters.examType}
                  onChange={(e) => handleFilterChange('examType', e.target.value)}
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  }}
                >
                  <MenuItem value="">
                    <em>All Types</em>
                  </MenuItem>
                  {EXAM_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  }}
                >
                  <MenuItem value="">
                    <em>All Statuses</em>
                  </MenuItem>
                  {EXAM_STATUSES.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

      {/* Exams Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : exams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No exams found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.values(filters).some(filter => filter) ? 'Try adjusting your filters.' : 'Exams will appear here when they are scheduled.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {exams.map((exam, index) => (
            <Grid item xs={12} md={6} lg={4} key={exam.id}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  animation: `${slideInLeft} 0.6s ease-out ${index * 0.1}s both`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(102, 126, 234, 0.2)',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => handleExamClick(exam)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {exam.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        Course ID: {exam.courseId}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip
                        label={exam.examType.toUpperCase()}
                        size="small"
                        color={getExamTypeColor(exam.examType)}
                        variant="outlined"
                      />
                      <Chip
                        label={exam.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(exam.status)}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(exam.examDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Duration: {exam.duration} minutes
                      </Typography>
                    </Box>
                  </Box>

                  {exam.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {exam.location}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      size="small"
                      label={`Semester ${exam.semester}`}
                      sx={{ background: 'rgba(102, 126, 234, 0.1)', color: 'primary.main' }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {exam.totalMarks} marks
                    </Typography>
                  </Box>

                  {canManageExams() && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {!exam.isPublished ? (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishExam(exam);
                          }}
                          disabled={publishing}
                        >
                          Publish
                        </Button>
                      ) : (
                        <Chip size="small" label="Published" color="success" variant="outlined" />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditExam(exam);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Exam Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'create' ? 'Create New Exam' :
           dialogType === 'edit' ? 'Edit Exam' :
           'Exam Details'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'view' && selectedExam ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedExam.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Course ID: {selectedExam.courseId}
              </Typography>

              <Chip
                label={selectedExam.examType.toUpperCase()}
                color={getExamTypeColor(selectedExam.examType)}
                size="small"
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EventIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Date: {formatDate(selectedExam.examDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AccessTimeIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Time: {formatTime(selectedExam.startTime)} - {formatTime(selectedExam.endTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ScheduleIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Duration: {selectedExam.duration} minutes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> {' '}
                    <Chip
                      label={selectedExam.status.toUpperCase()}
                      color={getStatusColor(selectedExam.status)}
                      size="small"
                    />
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Total Marks:</strong> {selectedExam.totalMarks}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Passing Marks:</strong> {selectedExam.passingMarks || 'Not set'}
                  </Typography>
                  {selectedExam.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LocationIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        Location: {selectedExam.location}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {selectedExam.description && (
                    <>
                      <Typography variant="body2" gutterBottom>
                        <strong>Description:</strong>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedExam.description}
                      </Typography>
                    </>
                  )}
                  {selectedExam.instructions && (
                    <>
                      <Typography variant="body2" gutterBottom>
                        <strong>Instructions:</strong>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedExam.instructions}
                      </Typography>
                    </>
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
                    label="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Exam Type</InputLabel>
                    <Select
                      value={formData.examType || ''}
                      onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    >
                      {EXAM_TYPES.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
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
                    type="date"
                    label="Exam Date"
                    value={formData.examDate || ''}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start Time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="End Time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duration (minutes)"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Marks"
                    value={formData.totalMarks || ''}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Passing Marks"
                    value={formData.passingMarks || ''}
                    onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Instructions"
                    multiline
                    rows={4}
                    value={formData.instructions || ''}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {dialogType === 'create' && (
            <Button
              onClick={onCreateExam}
              variant="contained"
              disabled={loading || !formData.title || !formData.examType || !formData.courseId || !formData.examDate}
            >
              {loading ? <CircularProgress size={20} /> : 'Create'}
            </Button>
          )}
          {dialogType === 'edit' && (
            <Button
              onClick={onUpdateExam}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamsPage;
