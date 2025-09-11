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
  Tab,
  Tabs,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

// Theme options
const THEMES = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

// Language options
const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Settings data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: null,
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'Africa/Lagos',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    autoSave: true,
    compactView: false,
  });

  const [security, setSecurity] = useState({
    password: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const [systemSettings, setSystemSettings] = useState({
    dataBackup: true,
    autoUpdates: true,
    maintenanceMode: false,
    debugMode: false,
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Here you would call the API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      logger.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      setLoading(true);
      setError(null);

      if (security.newPassword !== security.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Here you would call the API to change password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call

      setSecurity({ ...security, password: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      logger.error('Error changing password:', error);
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle preferences save
  const handlePreferencesSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Save preferences to localStorage or API
      localStorage.setItem('userPreferences', JSON.stringify(preferences));

      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      logger.error('Error saving preferences:', error);
      setError('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true);
        // Here you would upload the file to the server
        const avatarUrl = URL.createObjectURL(file);
        setProfileData({ ...profileData, avatar: avatarUrl });
        setSuccess('Avatar updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        logger.error('Error uploading avatar:', error);
        setError('Failed to upload avatar');
      } finally {
        setLoading(false);
      }
    }
  };

  // Export settings
  const exportSettings = () => {
    const settings = {
      profile: profileData,
      preferences,
      security: { ...security, password: '', newPassword: '', confirmPassword: '' },
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `settings_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Get window dimensions for responsive design
  const tabs = [
    { label: 'Profile', icon: <PersonIcon />, disabled: false },
    { label: 'Security', icon: <SecurityIcon />, disabled: false },
    { label: 'Notifications', icon: <NotificationsIcon />, disabled: false },
    { label: 'Appearance', icon: <PaletteIcon />, disabled: false },
    { label: 'System', icon: <StorageIcon />, disabled: !user?.role?.includes('admin') },
  ];

  // Initialize data on component mount
  useEffect(() => {
    // Load saved preferences
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        logger.error('Error loading saved preferences:', error);
      }
    }

    // Set user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const renderProfileTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', fontSize: '2.5rem' }}
                src={profileData.avatar}
              >
                {(profileData.firstName?.[0] || '') +
                 (profileData.lastName?.[0] || '') ||
                 user?.email?.[0]?.toUpperCase() ||
                 'U'}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 'calc(50% - 50px)',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
                size="small"
                component="label"
              >
                <CameraIcon fontSize="small" />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
              </IconButton>
            </Box>
            <Typography variant="h6" gutterBottom>
              {profileData.firstName} {profileData.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profileData.email}
            </Typography>
            {user?.role && (
              <Chip label={user.role.replace('_', ' ').toUpperCase()} size="small" color="primary" />
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Profile Information
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'action' }} /> }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action' }} /> }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleProfileUpdate}
                disabled={loading}
                startIcon={loading ? null : <SaveIcon />}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                onClick={exportSettings}
                startIcon={<DownloadIcon />}
              >
                Export Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSecurityTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon />
              Change Password
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={security.password}
                  onChange={(e) => setSecurity({ ...security, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handlePasswordChange}
                disabled={loading}
              >
                Change Password
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon />
              Security Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    color="primary"
                    checked={security.twoFactorEnabled}
                    onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Session Timeout"
                  secondary="Automatically log out after inactivity"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                    >
                      <MenuItem value={15}>15 min</MenuItem>
                      <MenuItem value={30}>30 min</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={120}>2 hours</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationsTab = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon />
          Notification Preferences
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><EmailIcon /></ListItemIcon>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive notifications via email"
            />
            <ListItemSecondaryAction>
              <Switch
                color="primary"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon><NotificationsIcon /></ListItemIcon>
            <ListItemText
              primary="Push Notifications"
              secondary="Receive push notifications in your browser"
            />
            <ListItemSecondaryAction>
              <Switch
                color="primary"
                checked={preferences.pushNotifications}
                onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon><PhoneIcon /></ListItemIcon>
            <ListItemText
              primary="SMS Notifications"
              secondary="Receive notifications via SMS (may incur charges)"
            />
            <ListItemSecondaryAction>
              <Switch
                color="primary"
                checked={preferences.smsNotifications}
                onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handlePreferencesSave}
            disabled={loading}
            startIcon={loading ? null : <SaveIcon />}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderAppearanceTab = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaletteIcon />
          Appearance Settings
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              >
                {THEMES.map(theme => (
                  <MenuItem key={theme.value} value={theme.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{theme.icon}</span>
                      {theme.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              >
                {LANGUAGES.map(lang => (
                  <MenuItem key={lang.value} value={lang.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{lang.flag}</span>
                      {lang.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <List>
              <ListItem>
                <ListItemIcon><SaveIcon /></ListItemIcon>
                <ListItemText
                  primary="Auto-save"
                  secondary="Automatically save your work as you type"
                />
                <ListItemSecondaryAction>
                  <Switch
                    color="primary"
                    checked={preferences.autoSave}
                    onChange={(e) => setPreferences({ ...preferences, autoSave: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText
                  primary="Compact View"
                  secondary="Use a more compact layout to show more information"
                />
                <ListItemSecondaryAction>
                  <Switch
                    color="primary"
                    checked={preferences.compactView}
                    onChange={(e) => setPreferences({ ...preferences, compactView: e.target.checked })}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handlePreferencesSave}
            disabled={loading}
            startIcon={loading ? null : <SaveIcon />}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSystemTab = () => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          System Settings
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><BackupIcon /></ListItemIcon>
            <ListItemText
              primary="Data Backup"
              secondary="Automatically backup system data"
            />
            <ListItemSecondaryAction>
              <Switch
                color="primary"
                checked={systemSettings.dataBackup}
                onChange={(e) => setSystemSettings({ ...systemSettings, dataBackup: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon><UploadIcon /></ListItemIcon>
            <ListItemText
              primary="Auto Updates"
              secondary="Automatically update the system when new versions are available"
            />
            <ListItemSecondaryAction>
              <Switch
                color="primary"
                checked={systemSettings.autoUpdates}
                onChange={(e) => setSystemSettings({ ...systemSettings, autoUpdates: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon sx={{ color: 'error.main' }}><SettingsIcon /></ListItemIcon>
            <ListItemText
              primary="Maintenance Mode"
              secondary="Put the system in maintenance mode (admin only)"
            />
            <ListItemSecondaryAction>
              <Switch
                color="error"
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon sx={{ color: 'warning.main' }}><SettingsIcon /></ListItemIcon>
            <ListItemText
              primary="Debug Mode"
              secondary="Enable debug mode for development (not recommended for production)"
            />
            <ListItemSecondaryAction>
              <Switch
                color="warning"
                checked={systemSettings.debugMode}
                onChange={(e) => setSystemSettings({ ...systemSettings, debugMode: e.target.checked })}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderProfileTab();
      case 1:
        return renderSecurityTab();
      case 2:
        return renderNotificationsTab();
      case 3:
        return renderAppearanceTab();
      case 4:
        return renderSystemTab();
      default:
        return renderProfileTab();
    }
  };

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
          }}
        >
          <Typography variant="h3" sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: '1.75rem', md: '3rem' }
          }}>
            <SettingsIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
            Settings
          </Typography>
          <Typography variant="body1" sx={{
            opacity: 0.9,
            fontSize: { xs: '0.9rem', md: '1rem' }
          }}>
            Manage your account settings and preferences
          </Typography>
        </Paper>
      </Box>

      {/* Success/Error Alerts */}
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

      {/* Settings Content */}
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              disabled={tab.disabled}
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsPage;
