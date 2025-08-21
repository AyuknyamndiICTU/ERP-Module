import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
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
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

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
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to update the profile
      logger.info('Updating profile:', profileData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the user context
      if (updateUser) {
        updateUser({
          ...user,
          ...profileData,
          name: `${profileData.firstName} ${profileData.lastName}`
        });
      }

      setIsEditing(false);
      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      logger.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
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
      academic_staff: '#2196f3',
      student: '#4caf50',
      finance_staff: '#ff9800',
      hr_personnel: '#9c27b0',
      marketing_staff: '#00bcd4'
    };
    return colors[role] || '#757575';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      academic_staff: 'Academic Staff',
      student: 'Student',
      finance_staff: 'Finance Staff',
      hr_personnel: 'HR Personnel',
      marketing_staff: 'Marketing Staff'
    };
    return labels[role] || role;
  };

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
