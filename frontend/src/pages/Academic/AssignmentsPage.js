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
  Avatar,
  Stack,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as UploadFileIcon,
  Grade as GradeIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
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

// Assignment API functions (using raw axios calls since assignments aren't in main API)
const getAssignments = async (params = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/assignments`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assignments: ${response.status}`);
  }

  return response.json();
};

const submitAssignment = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/assignments/${id}/submit`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit assignment: ${response.status}`);
  }

  return response.json();
};

const createAssignment = async (data) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/assignments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create assignment: ${response.status}`);
  }

  return response.json();
};

const AssignmentsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    courseId: '',
    studentId: '',
  });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('view'); // 'view', 'create', 'submit'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch assignments data
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAssignments(filters);
      setAssignments(data.assignments || []);
    } catch (error) {
      logger.error('Error fetching assignments:', error);
      setError(error.message || 'Failed to load assignments');
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

  // Handle assignment actions
  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setDialogType('view');
    setDialogOpen(true);
  };

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setFormData({
      courseId: '',
      title: '',
      description: '',
      dueDate: '',
      maxScore: '',
    });
    setDialogType('create');
    setDialogOpen(true);
  };

  const handleSubmitAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      submissionText: '',
      fileUrl: '',
    });
    setDialogType('submit');
    setDialogOpen(true);
  };

  // Submit assignment handler
  const onSubmitAssignment = async () => {
    try {
      setError(null);
      await submitAssignment(selectedAssignment.id, formData);
      setDialogOpen(false);
      // Refresh assignments
      fetchAssignments();
    } catch (error) {
      logger.error('Error submitting assignment:', error);
      setError(error.message || 'Failed to submit assignment');
    }
  };

  // Create assignment handler
  const onCreateAssignment = async () => {
    try {
      setError(null);
      await createAssignment(formData);
      setDialogOpen(false);
      // Refresh assignments
      fetchAssignments();
    } catch (error) {
      logger.error('Error creating assignment:', error);
      setError(error.message || 'Failed to create assignment');
    }
  };

  // Get submission status color
  const getSubmissionStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'success';
      case 'late':
        return 'warning';
      default:
        return 'error';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if assignment is overdue
  const isOverdue = (dueDate) => {
    return new Date() > new Date(dueDate);
  };

  // Get student submission status
  const getSubmissionStatus = (assignment) => {
    if (!assignment.submitted_at) return 'not_submitted';
    if (isOverdue(assignment.due_date)) return 'late';
    return 'submitted';
  };

  // Get student grade
  const getGrade = (assignment) => {
    if (assignment.score !== null && assignment.score !== undefined) {
      return `${assignment.score}/${assignment.max_score}`;
    }
    return 'Not graded';
  };

  // Initialize and fetch data
  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  // Render loading state
  if (loading && assignments.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading assignments...
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
                <AssignmentIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
                Assignments
              </Typography>
              <Typography variant="body1" sx={{
                opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}>
                Manage and track your course assignments
              </Typography>
            </Box>
            {user?.role === 'lecturer' || user?.role === 'faculty_coordinator' ? (
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
                onClick={handleCreateAssignment}
              >
                <AddIcon sx={{ mr: 1 }} />
                Create Assignment
              </Button>
            ) : null}
          </Box>

          {/* Filters for Lecturers/Staff */}
          {(user?.role === 'lecturer' || user?.role === 'faculty_coordinator' || user?.role === 'admin') && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Course ID"
                  value={filters.courseId}
                  onChange={(e) => handleFilterChange('courseId', e.target.value)}
                  placeholder="Filter by course ID"
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
              {(user?.role === 'admin' || user?.role === 'faculty_coordinator') && (
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Student ID"
                    value={filters.studentId}
                    onChange={(e) => handleFilterChange('studentId', e.target.value)}
                    placeholder="Filter by student ID"
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
              )}
              <Grid item xs={12} sm={6} md={4}>
                <IconButton
                  onClick={fetchAssignments}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 3,
                    width: 56,
                    height: 56,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Assignments Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No assignments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filters.courseId || filters.studentId ? 'Try adjusting your filters.' : 'Assignments will appear here when they are created.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment, index) => (
            <Grid item xs={12} md={6} lg={4} key={assignment.id}>
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
                onClick={() => handleAssignmentClick(assignment)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {assignment.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {assignment.course_name} ({assignment.course_code})
                      </Typography>
                    </Box>

                    {(() => {
                      const status = getSubmissionStatus(assignment);
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {status === 'submitted' && <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />}
                          {status === 'late' && <PendingIcon sx={{ color: 'warning.main', fontSize: 20 }} />}
                          <Chip
                            label={status.replace('_', ' ').toUpperCase()}
                            size="small"
                            color={getSubmissionStatusColor(status)}
                            variant="outlined"
                          />
                        </Box>
                      );
                    })()}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Due: {formatDate(assignment.due_date)}
                    </Typography>
                    {isOverdue(assignment.due_date) && !assignment.submitted_at && (
                      <Chip
                        label="OVERDUE"
                        size="small"
                        color="error"
                        variant="filled"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Max Points: {assignment.max_score}
                      </Typography>
                      {assignment.score !== null && (
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                          Your Score: {assignment.score}
                        </Typography>
                      )}
                    </Box>

                    <Avatar sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: 'primary.main',
                    }}>
                      {assignment.first_name?.[0]}{assignment.last_name?.[0]}
                    </Avatar>
                  </Box>

                  {user?.role === 'student' && !assignment.submitted_at && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={<UploadFileIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmitAssignment(assignment);
                      }}
                      disabled={loading}
                    >
                      Submit Assignment
                    </Button>
                  )}

                  {(user?.role === 'lecturer' || user?.role === 'faculty_coordinator') && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle grade assignment
                        }}
                      >
                        Grade
                      </Button>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete
                        }}
                      >
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

      {/* Assignment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'create' ? 'Create New Assignment' :
           dialogType === 'submit' ? 'Submit Assignment' :
           selectedAssignment?.title || 'Assignment Details'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'submit' && selectedAssignment ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAssignment.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Due: {formatDate(selectedAssignment.due_date)}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Submission Text"
                    multiline
                    rows={4}
                    value={formData.submissionText || ''}
                    onChange={(e) => setFormData({ ...formData, submissionText: e.target.value })}
                    placeholder="Enter your assignment submission..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="File URL (optional)"
                    value={formData.fileUrl || ''}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </Box>
          ) : dialogType === 'create' ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Score"
                    value={formData.maxScore || ''}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Due Date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Course ID"
                    value={formData.courseId || ''}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          ) : selectedAssignment ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAssignment.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedAssignment.course_name} ({selectedAssignment.course_code})
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Due Date:</strong> {formatDate(selectedAssignment.due_date)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Maximum Score:</strong> {selectedAssignment.max_score}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Student:</strong> {selectedAssignment.first_name} {selectedAssignment.last_name}
                  </Typography>
                  {selectedAssignment.submitted_at && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Submitted:</strong> {new Date(selectedAssignment.submitted_at).toLocaleString()}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Description:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedAssignment.description || 'No description provided.'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Submission Status:</strong> {' '}
                    <Chip
                      label={getSubmissionStatus(selectedAssignment).replace('_', ' ').toUpperCase()}
                      color={getSubmissionStatusColor(getSubmissionStatus(selectedAssignment))}
                      size="small"
                    />
                  </Typography>
                </Grid>
                {selectedAssignment.score !== null && (
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Score:</strong> {getGrade(selectedAssignment)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {dialogType === 'submit' && (
            <Button
              onClick={onSubmitAssignment}
              variant="contained"
              disabled={loading || (!formData.submissionText && !formData.fileUrl)}
            >
              {loading ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
          )}
          {dialogType === 'create' && (
            <Button
              onClick={onCreateAssignment}
              variant="contained"
              disabled={loading || !formData.title || !formData.courseId || !formData.dueDate || !formData.maxScore}
            >
              {loading ? <CircularProgress size={20} /> : 'Create'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssignmentsPage;
