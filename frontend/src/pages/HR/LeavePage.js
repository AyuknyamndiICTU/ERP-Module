import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useApiData, useDialogState } from '../../hooks/useApiData';
import { FormDialog, ConfirmDialog, DetailDialog } from '../../components/Common/DialogComponents';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

const LeavePage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Mock API service for leave requests
  const mockLeaveService = {
    getAll: async () => ({
      data: {
        success: true,
        data: [
          {
            id: 1,
            employeeName: 'John Smith',
            employeeId: 'EMP001',
            leaveType: 'Annual Leave',
            startDate: '2024-09-15',
            endDate: '2024-09-20',
            days: 6,
            status: 'pending',
            reason: 'Family vacation',
            appliedDate: '2024-08-20',
            approvedBy: null,
            comments: ''
          },
          {
            id: 2,
            employeeName: 'Sarah Johnson',
            employeeId: 'EMP002',
            leaveType: 'Sick Leave',
            startDate: '2024-08-25',
            endDate: '2024-08-27',
            days: 3,
            status: 'approved',
            reason: 'Medical treatment',
            appliedDate: '2024-08-22',
            approvedBy: 'HR Manager',
            comments: 'Medical certificate provided'
          },
          {
            id: 3,
            employeeName: 'Michael Brown',
            employeeId: 'EMP003',
            leaveType: 'Personal Leave',
            startDate: '2024-09-01',
            endDate: '2024-09-02',
            days: 2,
            status: 'rejected',
            reason: 'Personal matters',
            appliedDate: '2024-08-28',
            approvedBy: 'HR Manager',
            comments: 'Insufficient notice period'
          },
          {
            id: 4,
            employeeName: 'Emily Davis',
            employeeId: 'EMP004',
            leaveType: 'Maternity Leave',
            startDate: '2024-10-01',
            endDate: '2024-12-31',
            days: 92,
            status: 'approved',
            reason: 'Maternity leave',
            appliedDate: '2024-08-15',
            approvedBy: 'HR Manager',
            comments: 'Maternity leave approved as per policy'
          }
        ]
      }
    }),
    create: async (data) => ({
      data: {
        success: true,
        data: { id: Date.now(), ...data, status: 'pending', appliedDate: new Date().toISOString().split('T')[0] }
      }
    }),
    update: async (id, data) => ({ data: { success: true, data: { id, ...data } } }),
    delete: async (id) => ({ data: { success: true } }),
    getById: async (id) => ({ data: { success: true, data: {} } })
  };

  const { data: leaveRequests, loading, createItem, updateItem, deleteItem, handleSearch } = useApiData(mockLeaveService);
  const { dialogs, selectedItem, openDialog, closeDialog } = useDialogState();

  const leaveFields = [
    { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
    { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
    { name: 'leaveType', label: 'Leave Type', type: 'select', required: true, options: [
      { value: 'Annual Leave', label: 'Annual Leave' },
      { value: 'Sick Leave', label: 'Sick Leave' },
      { value: 'Personal Leave', label: 'Personal Leave' },
      { value: 'Maternity Leave', label: 'Maternity Leave' },
      { value: 'Paternity Leave', label: 'Paternity Leave' },
      { value: 'Emergency Leave', label: 'Emergency Leave' },
      { value: 'Study Leave', label: 'Study Leave' }
    ]},
    { name: 'startDate', label: 'Start Date', type: 'date', required: true, width: 6 },
    { name: 'endDate', label: 'End Date', type: 'date', required: true, width: 6 },
    { name: 'reason', label: 'Reason', type: 'textarea', required: true, rows: 3 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const handleMenuClick = (event, leave) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeave(leave);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLeave(null);
  };

  const handleCreateLeave = async (data) => {
    try {
      // Calculate days between start and end date
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      await createItem({
        ...data,
        days
      });
      closeDialog('create');
    } catch (error) {
      logger.error('Error creating leave request:', error);
    }
  };

  const handleUpdateLeave = async (data) => {
    try {
      await updateItem(selectedItem.id, data);
      closeDialog('edit');
    } catch (error) {
      logger.error('Error updating leave request:', error);
    }
  };

  const handleDeleteLeave = async () => {
    try {
      await deleteItem(selectedItem.id);
      closeDialog('delete');
    } catch (error) {
      logger.error('Error deleting leave request:', error);
    }
  };

  const handleApproveLeave = async (leave) => {
    try {
      await updateItem(leave.id, {
        ...leave,
        status: 'approved',
        approvedBy: 'HR Manager',
        comments: 'Leave approved'
      });
      handleMenuClose();
    } catch (error) {
      logger.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = async (leave) => {
    try {
      await updateItem(leave.id, {
        ...leave,
        status: 'rejected',
        approvedBy: 'HR Manager',
        comments: 'Leave rejected'
      });
      handleMenuClose();
    } catch (error) {
      logger.error('Error rejecting leave:', error);
    }
  };

  // Filter leave requests based on tab
  const getFilteredLeaves = () => {
    switch (tabValue) {
      case 0: return leaveRequests; // All
      case 1: return leaveRequests.filter(leave => leave.status === 'pending');
      case 2: return leaveRequests.filter(leave => leave.status === 'approved');
      case 3: return leaveRequests.filter(leave => leave.status === 'rejected');
      default: return leaveRequests;
    }
  };

  // Calculate summary statistics
  const totalRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter(leave => leave.status === 'pending').length;
  const approvedRequests = leaveRequests.filter(leave => leave.status === 'approved').length;
  const rejectedRequests = leaveRequests.filter(leave => leave.status === 'rejected').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Leave Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog('create')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
          }}
        >
          Apply Leave
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {totalRequests}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {pendingRequests}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {approvedRequests}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="error.main" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {rejectedRequests}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search leave requests..."
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
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

      {/* Leave Requests Table */}
      <GlassCard>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ px: 3, pt: 2 }}>
          <Tab label="All Requests" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredLeaves().map((leave) => (
                <TableRow key={leave.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                        {leave.employeeName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {leave.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {leave.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {leave.leaveType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {leave.startDate} to {leave.endDate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {leave.days} days
                    </Typography>
                  </TableCell>
                  <TableCell>{leave.appliedDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status.toUpperCase()}
                      color={getStatusColor(leave.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, leave)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { openDialog('detail', selectedLeave); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        {selectedLeave?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleApproveLeave(selectedLeave)} sx={{ color: 'success.main' }}>
              <ApproveIcon sx={{ mr: 1 }} fontSize="small" />
              Approve
            </MenuItem>
            <MenuItem onClick={() => handleRejectLeave(selectedLeave)} sx={{ color: 'error.main' }}>
              <RejectIcon sx={{ mr: 1 }} fontSize="small" />
              Reject
            </MenuItem>
          </>
        )}
        {selectedLeave?.status === 'pending' && (
          <MenuItem onClick={() => { openDialog('edit', selectedLeave); handleMenuClose(); }}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit Request
          </MenuItem>
        )}
        <MenuItem onClick={() => { openDialog('delete', selectedLeave); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Request
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <FormDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        title="Apply for Leave"
        fields={leaveFields}
        onSave={handleCreateLeave}
        loading={loading}
      />

      <FormDialog
        open={dialogs.edit}
        onClose={() => closeDialog('edit')}
        title="Edit Leave Request"
        fields={leaveFields}
        data={selectedItem}
        onSave={handleUpdateLeave}
        loading={loading}
      />

      <DetailDialog
        open={dialogs.detail}
        onClose={() => closeDialog('detail')}
        title="Leave Request Details"
        data={selectedItem}
        fields={[
          { name: 'employeeName', label: 'Employee Name' },
          { name: 'employeeId', label: 'Employee ID' },
          { name: 'leaveType', label: 'Leave Type' },
          { name: 'startDate', label: 'Start Date', width: 6 },
          { name: 'endDate', label: 'End Date', width: 6 },
          { name: 'days', label: 'Total Days' },
          { name: 'appliedDate', label: 'Applied Date' },
          { name: 'status', label: 'Status', render: (value) => (
            <Chip label={value?.toUpperCase()} color={getStatusColor(value)} size="small" />
          )},
          { name: 'approvedBy', label: 'Approved By' },
          { name: 'reason', label: 'Reason', width: 12 },
          { name: 'comments', label: 'Comments', width: 12 }
        ]}
        actions={[
          ...(selectedItem?.status === 'pending' ? [
            {
              label: 'Approve',
              onClick: () => { handleApproveLeave(selectedItem); closeDialog('detail'); },
              icon: <ApproveIcon />,
              variant: 'contained',
              color: 'success'
            },
            {
              label: 'Reject',
              onClick: () => { handleRejectLeave(selectedItem); closeDialog('detail'); },
              icon: <RejectIcon />,
              variant: 'outlined',
              color: 'error'
            }
          ] : []),
          {
            label: 'Edit',
            onClick: () => { closeDialog('detail'); openDialog('edit', selectedItem); },
            icon: <EditIcon />,
            variant: 'outlined'
          }
        ]}
      />

      <ConfirmDialog
        open={dialogs.delete}
        onClose={() => closeDialog('delete')}
        onConfirm={handleDeleteLeave}
        title="Delete Leave Request"
        message={`Are you sure you want to delete the leave request for ${selectedItem?.employeeName}? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={loading}
      />
    </Box>
  );
};

export default LeavePage;
