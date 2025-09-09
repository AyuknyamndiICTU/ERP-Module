import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const ICTUStudentRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [majors, setMajors] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: null,
    gender: '',
    age: '',
    bloodGroup: '',
    regionOfOrigin: '',
    placeOfOrigin: '',
    address: {
      street: '',
      city: '',
      region: '',
      country: 'Cameroon'
    },
    phoneNumber: '',
    
    // Academic Information
    facultyId: '',
    departmentId: '',
    majorId: '',
    semester: 1,
    level: '',
    studentType: 'regular',
    previousEducation: '',
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
      email: ''
    }
  });

  const steps = [
    'Personal Information',
    'Academic Selection',
    'Contact & Emergency',
    'Review & Submit'
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const studentTypes = ['regular', 'transfer'];
  const levels = ['undergraduate', 'masters', 'phd'];
  const relationships = ['Parent', 'Guardian', 'Sibling', 'Spouse', 'Other'];

  useEffect(() => {
    fetchFaculties();
    fetchMajors();
  }, []);

  useEffect(() => {
    if (formData.facultyId) {
      fetchDepartments(formData.facultyId);
    }
  }, [formData.facultyId]);

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

  const fetchDepartments = async (facultyId) => {
    try {
      const response = await axios.get(`/api/faculties/${facultyId}/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
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

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.regionOfOrigin) newErrors.regionOfOrigin = 'Region of origin is required';
        if (!formData.placeOfOrigin) newErrors.placeOfOrigin = 'Place of origin is required';
        break;
        
      case 1: // Academic Selection
        if (!formData.facultyId) newErrors.facultyId = 'Faculty is required';
        if (!formData.departmentId) newErrors.departmentId = 'Department is required';
        if (!formData.majorId) newErrors.majorId = 'Major is required';
        if (!formData.level) newErrors.level = 'Level is required';
        break;
        
      case 2: // Contact & Emergency
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.emergencyContact.name) newErrors['emergencyContact.name'] = 'Emergency contact name is required';
        if (!formData.emergencyContact.phoneNumber) newErrors['emergencyContact.phoneNumber'] = 'Emergency contact phone is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/students/register', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSuccess(`Registration successful! Your matricule is: ${response.data.student.matricule}`);
      setActiveStep(4); // Success step
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          error={!!errors.firstName}
          helperText={errors.firstName}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          error={!!errors.lastName}
          helperText={errors.lastName}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={(date) => handleInputChange('dateOfBirth', date)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                required
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth error={!!errors.gender} required>
          <InputLabel>Gender</InputLabel>
          <Select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            label="Gender"
          >
            {genders.map(gender => (
              <MenuItem key={gender} value={gender}>{gender}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Blood Group</InputLabel>
          <Select
            value={formData.bloodGroup}
            onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
            label="Blood Group"
          >
            {bloodGroups.map(group => (
              <MenuItem key={group} value={group}>{group}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.regionOfOrigin} required>
          <InputLabel>Region of Origin</InputLabel>
          <Select
            value={formData.regionOfOrigin}
            onChange={(e) => handleInputChange('regionOfOrigin', e.target.value)}
            label="Region of Origin"
          >
            {regions.map(region => (
              <MenuItem key={region} value={region}>{region}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Place of Origin"
          value={formData.placeOfOrigin}
          onChange={(e) => handleInputChange('placeOfOrigin', e.target.value)}
          error={!!errors.placeOfOrigin}
          helperText={errors.placeOfOrigin}
          required
        />
      </Grid>
    </Grid>
  );

  const renderAcademicSelection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Academic Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.facultyId} required>
          <InputLabel>Faculty</InputLabel>
          <Select
            value={formData.facultyId}
            onChange={(e) => handleInputChange('facultyId', e.target.value)}
            label="Faculty"
          >
            {faculties.map(faculty => (
              <MenuItem key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.departmentId} required disabled={!formData.facultyId}>
          <InputLabel>Department</InputLabel>
          <Select
            value={formData.departmentId}
            onChange={(e) => handleInputChange('departmentId', e.target.value)}
            label="Department"
          >
            {departments.map(department => (
              <MenuItem key={department.id} value={department.id}>
                {department.name} ({department.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.majorId} required>
          <InputLabel>Major Level</InputLabel>
          <Select
            value={formData.majorId}
            onChange={(e) => handleInputChange('majorId', e.target.value)}
            label="Major Level"
          >
            {majors.map(major => (
              <MenuItem key={major.id} value={major.id}>
                {major.name} ({major.level})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.level} required>
          <InputLabel>Level</InputLabel>
          <Select
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            label="Level"
          >
            {levels.map(level => (
              <MenuItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Semester"
          type="number"
          value={formData.semester}
          onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
          inputProps={{ min: 1, max: 8 }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Student Type</InputLabel>
          <Select
            value={formData.studentType}
            onChange={(e) => handleInputChange('studentType', e.target.value)}
            label="Student Type"
          >
            {studentTypes.map(type => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Previous Education Background"
          multiline
          rows={3}
          value={formData.previousEducation}
          onChange={(e) => handleInputChange('previousEducation', e.target.value)}
          placeholder="Describe your previous educational background..."
        />
      </Grid>
    </Grid>
  );

  const renderContactInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Street Address"
          value={formData.address.street}
          onChange={(e) => handleInputChange('address.street', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.address.city}
          onChange={(e) => handleInputChange('address.city', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Region</InputLabel>
          <Select
            value={formData.address.region}
            onChange={(e) => handleInputChange('address.region', e.target.value)}
            label="Region"
          >
            {regions.map(region => (
              <MenuItem key={region} value={region}>{region}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Emergency Contact
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          value={formData.emergencyContact.name}
          onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
          error={!!errors['emergencyContact.name']}
          helperText={errors['emergencyContact.name']}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Relationship</InputLabel>
          <Select
            value={formData.emergencyContact.relationship}
            onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
            label="Relationship"
          >
            {relationships.map(rel => (
              <MenuItem key={rel} value={rel}>{rel}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          value={formData.emergencyContact.phoneNumber}
          onChange={(e) => handleInputChange('emergencyContact.phoneNumber', e.target.value)}
          error={!!errors['emergencyContact.phoneNumber']}
          helperText={errors['emergencyContact.phoneNumber']}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Email"
          type="email"
          value={formData.emergencyContact.email}
          onChange={(e) => handleInputChange('emergencyContact.email', e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderReview = () => {
    const selectedFaculty = faculties.find(f => f.id === formData.facultyId);
    const selectedDepartment = departments.find(d => d.id === formData.departmentId);
    const selectedMajor = majors.find(m => m.id === formData.majorId);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Review Your Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Personal Information
            </Typography>
            <Typography><strong>Name:</strong> {formData.firstName} {formData.lastName}</Typography>
            <Typography><strong>Email:</strong> {formData.email}</Typography>
            <Typography><strong>Gender:</strong> {formData.gender}</Typography>
            <Typography><strong>Region:</strong> {formData.regionOfOrigin}</Typography>
            <Typography><strong>Place:</strong> {formData.placeOfOrigin}</Typography>
            {formData.bloodGroup && <Typography><strong>Blood Group:</strong> {formData.bloodGroup}</Typography>}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Academic Information
            </Typography>
            <Typography><strong>Faculty:</strong> {selectedFaculty?.name}</Typography>
            <Typography><strong>Department:</strong> {selectedDepartment?.name}</Typography>
            <Typography><strong>Major:</strong> {selectedMajor?.name}</Typography>
            <Typography><strong>Level:</strong> {formData.level}</Typography>
            <Typography><strong>Semester:</strong> {formData.semester}</Typography>
            <Typography><strong>Type:</strong> {formData.studentType}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Contact Information
            </Typography>
            <Typography><strong>Phone:</strong> {formData.phoneNumber}</Typography>
            <Typography><strong>Emergency Contact:</strong> {formData.emergencyContact.name} ({formData.emergencyContact.relationship})</Typography>
            <Typography><strong>Emergency Phone:</strong> {formData.emergencyContact.phoneNumber}</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderSuccess = () => (
    <Box textAlign="center" py={4}>
      <Typography variant="h4" color="primary" gutterBottom>
        🎉 Registration Successful!
      </Typography>
      <Alert severity="success" sx={{ mb: 3 }}>
        {success}
      </Alert>
      <Typography variant="body1" paragraph>
        Welcome to ICTU! Your registration has been completed and locked. 
        Only faculty or major coordinators can make changes to your information now.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        You will receive further instructions via email regarding course enrollment and fee payment.
      </Typography>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalInformation();
      case 1:
        return renderAcademicSelection();
      case 2:
        return renderContactInformation();
      case 3:
        return renderReview();
      case 4:
        return renderSuccess();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            ICTU Student Registration
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Institute of Communication Technology University
          </Typography>
        </Box>

        {activeStep < 4 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {getStepContent(activeStep)}

        {activeStep < 4 && (
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ICTUStudentRegistration;
