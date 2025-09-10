import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CloudUpload, Send, PriorityHigh } from '@mui/icons-material';
import { academicAPI, complaintsAPI, usersAPI } from '../../services/api';
import logger from '../../utils/logger';

const ComplaintForm = () => {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);

  const [formData, setFormData] = useState({
    courseId: '',
    lecturerId: '',
    subject: '',
    description: '',
    priority: 'medium',
    attachments: []
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'info' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'urgent', label: 'Urgent', color: 'error' }
  ];

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
  }, []);

  const fetchCourses = async () => {
    try {
      setError('');
      const response = await academicAPI.getCourses();
      // Assuming the API returns data directly
      if (response.data && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else if (Array.isArray(response.data)) {
        setCourses(response.data);
      }
      logger.debug('Courses fetched:', response.data);
    } catch (error) {
      logger.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again.');
    }
  };

  const fetchLecturers = async () => {
    try {
      setError('');
      const response = await usersAPI.getLecturers();
      if (response.data && Array.isArray(response.data.users)) {
        setLecturers(response.data.users);
      } else if (Array.isArray(response.data)) {
        setLecturers(response.data);
      }
      logger.debug('Lecturers fetched:', response.data);
    } catch (error) {
      logger.error('Error fetching lecturers:', error);
      setError('Failed to load lecturers. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not allowed for ${file.name}.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.courseId) return 'Please select a course';
    if (!formData.lecturerId) return 'Please select a lecturer';
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.description.length < 20) return 'Description must be at least 20 characters';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare submission data (temporarily without attachments for API compatibility)
      const submitData = {
        courseId: formData.courseId,
        lecturerId: formData.lecturerId,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        // TODO: Handle attachments - backend expects array of strings, not files
        attachments: [] // Placeholder for attachment URLs or IDs
      };

      logger.debug('Submitting complaint:', submitData);

      const response = await complaintsAPI.submitComplaint(submitData);

      setSuccess('Complaint submitted successfully! You will be notified when there is a response.');

      // Reset form
      setFormData({
        courseId: '',
        lecturerId: '',
        subject: '',
        description: '',
        priority: 'medium',
        attachments: []
      });
      setAttachments([]);

      logger.info('Complaint submitted successfully');

    } catch (error) {
      logger.error('Complaint submission error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to submit complaint. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = priorities.find(p => p.value === formData.priority);

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            Submit a Complaint
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Report issues with courses, grades, or any academic concerns
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Course</InputLabel>
                <Select
                  value={formData.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  label="Course"
                >
                  {courses.map(course => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Lecturer</InputLabel>
                <Select
                  value={formData.lecturerId}
                  onChange={(e) => handleInputChange('lecturerId', e.target.value)}
                  label="Lecturer"
                >
                  {lecturers.map(lecturer => (
                    <MenuItem key={lecturer.id} value={lecturer.id}>
                      {lecturer.firstName} {lecturer.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                required
                placeholder="Brief summary of your complaint"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={6}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                placeholder="Provide detailed information about your complaint..."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box display="flex" alignItems="center">
                        <PriorityHigh sx={{ mr: 1, color: `${priority.color}.main` }} />
                        {priority.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedPriority && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {selectedPriority.value === 'urgent' && 'Urgent complaints are handled within 24 hours'}
                  {selectedPriority.value === 'high' && 'High priority complaints are handled within 2-3 days'}
                  {selectedPriority.value === 'medium' && 'Medium priority complaints are handled within a week'}
                  {selectedPriority.value === 'low' && 'Low priority complaints are handled as time permits'}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box>
                <input
                  accept="image/*,.pdf,.txt"
                  style={{ display: 'none' }}
                  id="attachment-upload"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="attachment-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    fullWidth
                  >
                    Upload Supporting Documents
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Supported formats: Images (JPEG, PNG, GIF), PDF, Text files. Max 5MB per file.
                </Typography>
              </Box>

              {attachments.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachments ({attachments.length})
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {attachments.map((file, index) => (
                      <Chip
                        key={index}
                        label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`}
                        onDelete={() => removeAttachment(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {loading && (
          <Box mt={3}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Submitting your complaint...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ComplaintForm;
