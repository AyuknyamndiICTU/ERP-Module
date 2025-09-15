import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import logger from '../../utils/logger';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    department: user?.department || '',
    position: user?.position || user?.role || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make real API call to update profile
      const response = await api.put('/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio
      });

      if (response.data.success) {
        // Update user context
        updateUser({
          ...user,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          bio: profileData.bio
        });

        setIsEditing(false);
        setNotification({ open: true, message: 'Profile updated successfully', severity: 'success' });
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      logger.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      setError(errorMessage);
      setNotification({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user?.firstName || user?.name?.split(' ')[0] || '',
      lastName: user?.lastName || user?.name?.split(' ')[1] || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      department: user?.department || '',
      position: user?.position || user?.role || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#f44336',
      system_admin: '#d32f2f',
      lecturer: '#2196f3',
      faculty_coordinator: '#1976d2',
      major_coordinator: '#0d47a1',
      student: '#4caf50',
      finance_staff: '#ff9800',
      hr_staff: '#9c27b0',
      marketing_staff: '#e91e63',
      employee: '#607d8b'
    };
    return colors[role] || '#757575';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      system_admin: 'System Administrator',
      lecturer: 'Lecturer',
      faculty_coordinator: 'Faculty Coordinator',
      major_coordinator: 'Major Coordinator',
      student: 'Student',
      finance_staff: 'Finance Staff',
      hr_staff: 'HR Staff',
      marketing_staff: 'Marketing Staff',
      employee: 'Employee'
    };
    return labels[role] || role;
  };

  // Load user data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        try {
          // Try to get fresh profile data from API
          const response = await api.get('/profile');
          if (response.data.success) {
            const userData = response.data.user;
            setProfileData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              department: userData.department || '',
              position: userData.position || userData.role || '',
              bio: userData.bio || '',
              avatar: userData.avatar || ''
            });
          } else {
            // Fallback to user context data
            setProfileData({
              firstName: user.firstName || user.name?.split(' ')[0] || '',
              lastName: user.lastName || user.name?.split(' ')[1] || '',
              email: user.email || '',
              phone: user.phone || '',
              address: user.address || '',
              department: user.department || '',
              position: user.position || user.role || '',
              bio: user.bio || '',
              avatar: user.avatar || ''
            });
          }
        } catch (error) {
          logger.error('Error loading profile data:', error);
          // Fallback to user context data
          setProfileData({
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ')[1] || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            department: user.department || '',
            position: user.position || user.role || '',
            bio: user.bio || '',
            avatar: user.avatar || ''
          });
        }
      }
    };

    loadProfileData();
  }, [user]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Profile Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your personal information and account settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <GlassCard>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: getRoleColor(user?.role),
                    border: '4px solid rgba(255,255,255,0.2)'
                  }}
                  src={profileData.avatar}
                >
                  {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                </Avatar>
                {isEditing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {profileData.firstName} {profileData.lastName}
              </Typography>

              <Chip
                label={getRoleLabel(user?.role)}
                sx={{
                  bgcolor: getRoleColor(user?.role),
                  color: 'white',
                  fontWeight: 600,
                  mb: 2
                }}
              />

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {profileData.bio || 'No bio available'}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      color="inherit"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </GlassCard>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <GlassCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Personal Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profileData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Position"
                    value={profileData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
