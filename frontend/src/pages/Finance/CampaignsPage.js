import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import FormDialog from '../../components/Common/FormDialog';
import GlassCard from '../../components/GlassCard';
import { financeAPI } from '../../services/api';
import { debounce } from 'lodash';

const CampaignsPage = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Mock data
  const mockCampaigns = [
    {
      id: 1,
      name: 'Fall 2024 Enrollment Drive',
      type: 'enrollment',
      status: 'active',
      targetAudience: 'High School Graduates',
      budget: 50000,
      spent: 32000,
      startDate: '2024-09-01',
      endDate: '2024-11-30',
      leads: 245,
      conversions: 89,
      roi: 156,
      description: 'Comprehensive enrollment campaign targeting high school graduates'
    },
    {
      id: 2,
      name: 'Digital Marketing Q4',
      type: 'promotion',
      status: 'active',
      targetAudience: 'Working Professionals',
      budget: 30000,
      spent: 18000,
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      leads: 156,
      conversions: 45,
      roi: 89,
      description: 'Online course promotion for working professionals'
    },
    {
      id: 3,
      name: 'Alumni Networking Event',
      type: 'event',
      status: 'completed',
      targetAudience: 'Alumni Network',
      budget: 15000,
      spent: 15000,
      startDate: '2024-08-15',
      endDate: '2024-08-15',
      leads: 78,
      conversions: 12,
      roi: 45,
      description: 'Annual alumni networking and recruitment event'
    }
  ];

  // Fetch campaigns from backend
  const fetchCampaigns = useCallback(async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await financeAPI.getCampaigns({ 
        search, 
        page, 
        limit: pagination.limit 
      });
      
      if (response.data && response.data.campaigns) {
        setCampaigns(response.data.campaigns);
        setPagination(prev => ({
          ...prev,
          page: response.data.currentPage || page,
          total: response.data.total || response.data.campaigns.length
        }));
      } else {
        // Fallback to mock data if API fails
        console.warn('API response invalid, using fallback data');
        setCampaigns(mockCampaigns);
        setPagination(prev => ({ ...prev, total: mockCampaigns.length }));
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns. Using sample data.');
      // Use fallback mock data
      setCampaigns(mockCampaigns);
      setPagination(prev => ({ ...prev, total: mockCampaigns.length }));
      setSnackbar({
        open: true,
        message: 'Failed to load campaigns. Using offline data.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchCampaigns(searchValue, 1);
    }, 500),
    [fetchCampaigns]
  );

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchCampaigns('', 1);
    }
  }, [searchTerm, debouncedSearch, fetchCampaigns]);

  const handleAddCampaign = async (formData) => {
    try {
      const campaignData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        budget: parseFloat(formData.budget),
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetAudience: formData.targetAudience,
        status: 'active'
      };

      const response = await financeAPI.createCampaign(campaignData);

      if (response.data) {
        setSnackbar({
          open: true,
          message: 'Campaign created successfully!',
          severity: 'success'
        });
        setShowAddDialog(false);
        fetchCampaigns(searchTerm, pagination.page);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create campaign',
        severity: 'error'
      });
    }
  };

  const handleEditCampaign = async (campaignId, updateData) => {
    try {
      const response = await financeAPI.updateCampaign(campaignId, updateData);

      if (response.data) {
        setSnackbar({
          open: true,
          message: 'Campaign updated successfully!',
          severity: 'success'
        });
        fetchCampaigns(searchTerm, pagination.page);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update campaign',
        severity: 'error'
      });
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await financeAPI.deleteCampaign(campaignId);

      setSnackbar({
        open: true,
        message: 'Campaign deleted successfully!',
        severity: 'success'
      });
      fetchCampaigns(searchTerm, pagination.page);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete campaign',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  // Use campaigns directly since filtering is handled by backend API
  const filteredCampaigns = campaigns;

  const campaignFields = [
    { name: 'name', label: 'Campaign Name', type: 'text', required: true },
    { name: 'type', label: 'Campaign Type', type: 'select', required: true, options: [
      { value: 'enrollment', label: 'Enrollment Drive' },
      { value: 'promotion', label: 'Course Promotion' },
      { value: 'event', label: 'Event Marketing' },
      { value: 'retention', label: 'Student Retention' },
      { value: 'brand', label: 'Brand Awareness' }
    ]},
    { name: 'targetAudience', label: 'Target Audience', type: 'text', required: true },
    { name: 'budget', label: 'Budget (FCFA)', type: 'number', required: true, min: 0 },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true, width: 6 },
    { name: 'endDate', label: 'End Date', type: 'date', required: true, width: 6 },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'enrollment': return <CampaignIcon />;
      case 'promotion': return <TrendingUpIcon />;
      case 'event': return <AnalyticsIcon />;
      default: return <CampaignIcon />;
    }
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700" sx={{ color: 'primary.main' }}>
          Marketing Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Create Campaign
        </Button>
      </Box>

      {/* Search */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </GlassCard>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {(totalBudget || 0).toLocaleString()} FCFA
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {(totalSpent || 0).toLocaleString()} FCFA
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Total Leads
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {(totalLeads || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Conversions
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {(totalConversions || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="secondary.main" gutterBottom>
                Active Campaigns
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {campaigns.filter(c => c.status === 'active').length}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Campaign Cards */}
      <Grid container spacing={3}>
        {filteredCampaigns.map((campaign) => (
          <Grid item xs={12} md={6} lg={4} key={campaign.id}>
            <GlassCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {getTypeIcon(campaign.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="600">
                      {campaign.name}
                    </Typography>
                    <Chip
                      label={campaign.status.toUpperCase()}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: campaign.status === 'active' ? '#10b981' : 
                                       campaign.status === 'pending' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                                       campaign.status === 'completed' ? '#3b82f6' : 
                                       campaign.status === 'cancelled' ? '#ef4444' : '#6b7280',
                        background: campaign.status === 'pending' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                        color: 'white',
                        '& .MuiChip-label': {
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setSelectedCampaign(campaign);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {campaign.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Budget Usage
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={campaign.budget ? (campaign.spent / campaign.budget) * 100 : 0}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {(campaign.spent || 0).toLocaleString()} FCFA / {(campaign.budget || 0).toLocaleString()} FCFA
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Leads
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {campaign.leads || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Conversions
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {campaign.conversions || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          handleEditCampaign(selectedCampaign.id, { status: 'active' });
          setAnchorEl(null);
        }}>
          <ViewIcon sx={{ mr: 1 }} />
          Activate Campaign
        </MenuItem>
        <MenuItem onClick={() => {
          handleEditCampaign(selectedCampaign.id, { status: 'paused' });
          setAnchorEl(null);
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Pause Campaign
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteCampaign(selectedCampaign.id);
          setAnchorEl(null);
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Campaign
        </MenuItem>
      </Menu>

      {/* Add Campaign Dialog */}
      <FormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Create New Campaign"
        fields={campaignFields}
        onSave={handleAddCampaign}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignsPage;
