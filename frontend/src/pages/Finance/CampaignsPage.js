import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Campaign as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Analytics as AnalyticsIcon} from '@mui/icons-material';
import { useApiData, useDialogState } from '../../hooks/useApiData';
import { FormDialog, ConfirmDialog, DetailDialog } from '../../components/Common/DialogComponents';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

const CampaignsPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Mock API service for campaigns
  const mockCampaignService = {
    getAll: async () => ({
      data: {
        success: true,
        data: [
          {
            id: 1,
            name: 'Fall 2024 Enrollment Drive',
            type: 'enrollment',
            status: 'active',
            budget: 5000,
            spent: 3200,
            startDate: '2024-08-01',
            endDate: '2024-09-30',
            targetAudience: 'High School Graduates',
            leads: 245,
            conversions: 89,
            roi: 180,
            description: 'Comprehensive enrollment campaign targeting high school graduates'
          },
          {
            id: 2,
            name: 'Online Learning Promotion',
            type: 'promotion',
            status: 'paused',
            budget: 3000,
            spent: 1800,
            startDate: '2024-07-15',
            endDate: '2024-08-31',
            targetAudience: 'Working Professionals',
            leads: 156,
            conversions: 34,
            roi: 95,
            description: 'Promoting online courses for working professionals'
          },
          {
            id: 3,
            name: 'Summer Workshop Series',
            type: 'event',
            status: 'completed',
            budget: 2500,
            spent: 2400,
            startDate: '2024-06-01',
            endDate: '2024-07-31',
            targetAudience: 'Students & Parents',
            leads: 189,
            conversions: 67,
            roi: 145,
            description: 'Summer workshop series for skill development'
          }
        ]
      }
    }),
    create: async (data) => ({
      data: {
        success: true,
        data: { id: Date.now(), ...data, leads: 0, conversions: 0, spent: 0 }
      }
    }),
    update: async (id, data) => ({ data: { success: true, data: { id, ...data } } }),
    delete: async (id) => ({ data: { success: true } }),
    getById: async (id) => ({ data: { success: true, data: {} } })
  };

  const { data: campaigns, loading, createItem, updateItem, deleteItem, handleSearch } = useApiData(mockCampaignService);
  const { dialogs, selectedItem, openDialog, closeDialog } = useDialogState();

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
    { name: 'budget', label: 'Budget ($)', type: 'number', required: true, min: 0 },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true, width: 6 },
    { name: 'endDate', label: 'End Date', type: 'date', required: true, width: 6 },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'enrollment': return <CampaignIcon />;
      case 'promotion': return <TrendingUpIcon />;
      case 'event': return <AnalyticsIcon />;
      default: return <CampaignIcon />;
    }
  };

  const handleMenuClick = (event, campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleCreateCampaign = async (data) => {
    try {
      await createItem({
        ...data,
        status: 'draft'
      });
      closeDialog('create');
    } catch (error) {
      logger.error('Error creating campaign:', error);
    }
  };

  const handleUpdateCampaign = async (data) => {
    try {
      await updateItem(selectedItem.id, data);
      closeDialog('edit');
    } catch (error) {
      logger.error('Error updating campaign:', error);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await deleteItem(selectedItem.id);
      closeDialog('delete');
    } catch (error) {
      logger.error('Error deleting campaign:', error);
    }
  };

  const handleStatusChange = (campaign, newStatus) => {
    updateItem(campaign.id, { ...campaign, status: newStatus });
    handleMenuClose();
  };

  // Calculate summary statistics
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalLeads = campaigns.reduce((sum, campaign) => sum + campaign.leads, 0);
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  const averageROI = campaigns.length > 0 ? campaigns.reduce((sum, campaign) => sum + campaign.roi, 0) / campaigns.length : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Marketing Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog('create')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2}}
        >
          Create Campaign
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4" fontWeight="700">
                ${totalBudget.toLocaleString()}
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
                ${totalSpent.toLocaleString()}
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
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg ROI
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {averageROI.toFixed(0)}%
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search campaigns..."
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )}}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ minWidth: 120 }}
          >
            Filter
          </Button>
        </Box>
      </GlassCard>

      {/* Campaigns Grid */}
      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid item xs={12} md={6} lg={4} key={campaign.id}>
            <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                      mr: 2
                    }}>
                      {getTypeIcon(campaign.type)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {campaign.name}
                      </Typography>
                      <Chip
                        label={campaign.status.toUpperCase()}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, campaign)}
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
                    ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
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
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ROI
                    </Typography>
                    <Typography variant="h6" fontWeight="600" color="success.main">
                      {campaign.roi}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Conv. Rate
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {campaign.leads > 0 ? Math.round((campaign.conversions / campaign.leads) * 100) : 0}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => openDialog('detail', campaign)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => logger.debug('View analytics:', campaign)}
                >
                  Analytics
                </Button>
              </CardActions>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { openDialog('detail', selectedCampaign); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { openDialog('edit', selectedCampaign); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Campaign
        </MenuItem>
        {selectedCampaign?.status === 'draft' && (
          <MenuItem onClick={() => handleStatusChange(selectedCampaign, 'active')}>
            <PlayIcon sx={{ mr: 1 }} fontSize="small" />
            Start Campaign
          </MenuItem>
        )}
        {selectedCampaign?.status === 'active' && (
          <MenuItem onClick={() => handleStatusChange(selectedCampaign, 'paused')}>
            <PauseIcon sx={{ mr: 1 }} fontSize="small" />
            Pause Campaign
          </MenuItem>
        )}
        {selectedCampaign?.status === 'paused' && (
          <MenuItem onClick={() => handleStatusChange(selectedCampaign, 'active')}>
            <PlayIcon sx={{ mr: 1 }} fontSize="small" />
            Resume Campaign
          </MenuItem>
        )}
        <MenuItem onClick={() => { logger.debug('View analytics:', selectedCampaign); handleMenuClose(); }}>
          <AnalyticsIcon sx={{ mr: 1 }} fontSize="small" />
          View Analytics
        </MenuItem>
        <MenuItem onClick={() => { openDialog('delete', selectedCampaign); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Campaign
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <FormDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        title="Create New Campaign"
        fields={campaignFields}
        onSave={handleCreateCampaign}
        loading={loading}
      />

      <FormDialog
        open={dialogs.edit}
        onClose={() => closeDialog('edit')}
        title="Edit Campaign"
        fields={campaignFields}
        data={selectedItem}
        onSave={handleUpdateCampaign}
        loading={loading}
      />

      <DetailDialog
        open={dialogs.detail}
        onClose={() => closeDialog('detail')}
        title="Campaign Details"
        data={selectedItem}
        fields={[
          { name: 'name', label: 'Campaign Name' },
          { name: 'type', label: 'Type' },
          { name: 'status', label: 'Status', render: (value) => (
            <Chip label={value?.toUpperCase()} color={getStatusColor(value)} size="small" />
          )},
          { name: 'targetAudience', label: 'Target Audience' },
          { name: 'budget', label: 'Budget', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'spent', label: 'Spent', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'startDate', label: 'Start Date' },
          { name: 'endDate', label: 'End Date' },
          { name: 'leads', label: 'Leads Generated' },
          { name: 'conversions', label: 'Conversions' },
          { name: 'roi', label: 'ROI', render: (value) => `${value}%` },
          { name: 'description', label: 'Description', width: 12 }
        ]}
        actions={[
          {
            label: 'Edit',
            onClick: () => { closeDialog('detail'); openDialog('edit', selectedItem); },
            icon: <EditIcon />,
            variant: 'outlined'
          },
          {
            label: 'View Analytics',
            onClick: () => logger.debug('View analytics:', selectedItem),
            icon: <AnalyticsIcon />,
            variant: 'contained'
          }
        ]}
      />

      <ConfirmDialog
        open={dialogs.delete}
        onClose={() => closeDialog('delete')}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        message={`Are you sure you want to delete the campaign "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={loading}
      />
    </Box>
  );
};

export default CampaignsPage;
