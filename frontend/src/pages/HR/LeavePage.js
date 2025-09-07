import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
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
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import FormDialog from '../../components/Common/FormDialog';

const LeavePage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data
  const mockLeaves = [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Computer Science',
      leaveType: 'Annual Leave',
      startDate: '2024-12-20',
      endDate: '2024-12-27',
      days: 8,
      reason: 'Family vacation during holidays',
      status: 'pending',
      appliedDate: '2024-11-15',
      approvedBy: null
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'Mathematics',
      leaveType: 'Sick Leave',
      startDate: '2024-11-18',
      endDate: '2024-11-20',
      days: 3,
      reason: 'Medical treatment',
      status: 'approved',
      appliedDate: '2024-11-17',
      approvedBy: 'HR Manager'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'Administration',
      leaveType: 'Personal Leave',
      startDate: '2024-11-25',
      endDate: '2024-11-25',
      days: 1,
      reason: 'Personal appointment',
      status: 'rejected',
      appliedDate: '2024-11-20',
      approvedBy: 'HR Manager'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      department: 'Finance',
      leaveType: 'Maternity Leave',
      startDate: '2024-12-01',
      endDate: '2025-02-28',
      days: 90,
      reason: 'Maternity leave',
      status: 'approved',
      appliedDate: '2024-10-15',
      approvedBy: 'HR Manager'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLeaves(mockLeaves);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Annual Leave': return 'primary';
      case 'Sick Leave': return 'error';
      case 'Personal Leave': return 'info';
      case 'Maternity Leave': return 'secondary';
      default: return 'default';
    }
  };

  const handleAddLeave = (formData) => {
    const newLeave = {
      id: leaves.length + 1,
      employeeId: user?.id || 'EMP999',
      employeeName: user?.firstName + ' ' + user?.lastName || 'Current User',
      department: user?.department || 'General',
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1,
      reason: formData.reason,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: null
    };
    
    setLeaves([...leaves, newLeave]);
    setShowAddDialog(false);
  };

  const handleApprove = (leaveId) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId 
        ? { ...leave, status: 'approved', approvedBy: 'HR Manager' }
        : leave
    ));
    setAnchorEl(null);
  };

  const handleReject = (leaveId) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId 
        ? { ...leave, status: 'rejected', approvedBy: 'HR Manager' }
        : leave
    ));
    setAnchorEl(null);
  };

  const leaveFields = [
    {
      name: 'leaveType',
      label: 'Leave Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Annual Leave', label: 'Annual Leave' },
        { value: 'Sick Leave', label: 'Sick Leave' },
        { value: 'Personal Leave', label: 'Personal Leave' },
        { value: 'Maternity Leave', label: 'Maternity Leave' },
        { value: 'Emergency Leave', label: 'Emergency Leave' }
      ]
    },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date', required: true },
    { name: 'reason', label: 'Reason', type: 'textarea', required: true }
  ];

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = tabValue === 0 || 
                      (tabValue === 1 && leave.status === 'pending') ||
                      (tabValue === 2 && leave.status === 'approved') ||
                      (tabValue === 3 && leave.status === 'rejected');
    
    return matchesSearch && matchesTab;
  });

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
          Leave Management
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
          Apply Leave
        </Button>
      </Box>

      {/* Search */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search leave applications..."
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {leaves.length}
                  </Typography>
                  <Typography variant="body2">Total Applications</Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {leaves.filter(l => l.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {leaves.filter(l => l.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2">Approved</Typography>
                </Box>
                <ApproveIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {leaves.reduce((sum, l) => sum + l.days, 0)}
                  </Typography>
                  <Typography variant="body2">Total Days</Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <GlassCard sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Applications" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </GlassCard>

      {/* Leave Applications Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Employee</strong></TableCell>
                <TableCell><strong>Leave Type</strong></TableCell>
                <TableCell><strong>Duration</strong></TableCell>
                <TableCell><strong>Days</strong></TableCell>
                <TableCell><strong>Reason</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {leave.employeeName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {leave.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {leave.employeeId} • {leave.department}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={leave.leaveType}
                      color={getLeaveTypeColor(leave.leaveType)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Applied: {new Date(leave.appliedDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="primary.main">
                      {leave.days} day{leave.days > 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {leave.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      color={getStatusColor(leave.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedLeave(leave);
                      }}
                      sx={{ color: 'primary.main' }}
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
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedLeave?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleApprove(selectedLeave.id)} sx={{ color: 'success.main' }}>
              <ApproveIcon sx={{ mr: 1 }} />
              Approve
            </MenuItem>
            <MenuItem onClick={() => handleReject(selectedLeave.id)} sx={{ color: 'error.main' }}>
              <RejectIcon sx={{ mr: 1 }} />
              Reject
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Add Leave Dialog */}
      <FormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Apply for Leave"
        fields={leaveFields}
        onSave={handleAddLeave}
      />
    </Box>
  );
};

export default LeavePage;
