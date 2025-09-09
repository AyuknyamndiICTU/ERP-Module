import React, { useState, useEffect } from 'react';
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
import axios from 'axios';

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

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/finance/campaigns', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.campaigns) {
        setCampaigns(response.data.campaigns);
      } else {
        // Fallback to mock data if API fails
        setCampaigns(mockCampaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns. Using sample data.');
      // Use mock data as fallback
      setCampaigns(mockCampaigns);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCampaign = async (formData) => {
    try {
      const campaignData = {
        name: formData.name,
        description: formData.description,
        budget: parseFloat(formData.budget),
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetAudience: formData.targetAudience
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/finance/campaigns', campaignData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.campaign) {
        setSnackbar({
          open: true,
          message: 'Campaign created successfully!',
          severity: 'success'
        });
        fetchCampaigns(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create campaign',
        severity: 'error'
      });
    } finally {
      setShowAddDialog(false);
    }
  };

  const handleEditCampaign = async (campaignId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/finance/campaigns/${campaignId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.campaign) {
        setSnackbar({
          open: true,
          message: 'Campaign updated successfully!',
          severity: 'success'
        });
        fetchCampaigns(); // Refresh the list
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
      const token = localStorage.getItem('token');
      await axios.delete(`/api/finance/campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Campaign deleted successfully!',
        severity: 'success'
      });
      fetchCampaigns(); // Refresh the list
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

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {totalBudget.toLocaleString()} FCFA
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
                {totalSpent.toLocaleString()} FCFA
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
                {totalLeads.toLocaleString()}
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
                {totalConversions.toLocaleString()}
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
                      color={getStatusColor(campaign.status)}
                      size="small"
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
                    value={(campaign.spent / campaign.budget) * 100}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {campaign.spent.toLocaleString()} FCFA / {campaign.budget.toLocaleString()} FCFA
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Leads
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {campaign.leads}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Conversions
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {campaign.conversions}
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
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Campaign
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
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
    </Box>
  );
};

export default CampaignsPage;
