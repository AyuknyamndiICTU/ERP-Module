import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Work,
  Payment as PaymentIcon,
  BeachAccess,
  Assessment,
  Computer,
  Person,
  CheckCircle,
  Pending,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../common/RoleGuard';

const HRModule = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    employees: [],
    payroll: [],
    leaveRequests: [],
    performanceReviews: [],
    assets: []
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const canManageHR = ['admin', 'hr_staff'].includes(user?.role);

  useEffect(() => {
    loadHRData();
  }, [activeTab]);

  const loadHRData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (activeTab) {
        case 0: // Employees
          setData(prev => ({
            ...prev,
            employees: [
              {
                id: 1,
                name: 'Dr. John Smith',
                employeeId: 'EMP001',
                department: 'Computer Science',
                position: 'Professor',
                email: 'john.smith@university.edu',
                phone: '+1-555-0123',
                hireDate: '2020-01-15',
                status: 'active',
                salary: 85000
              },
              {
                id: 2,
                name: 'Sarah Johnson',
                employeeId: 'EMP002',
                department: 'Administration',
                position: 'HR Manager',
                email: 'sarah.johnson@university.edu',
                phone: '+1-555-0124',
                hireDate: '2019-03-20',
                status: 'active',
                salary: 65000
              }
            ]
          }));
          break;
        case 1: // Payroll
          setData(prev => ({
            ...prev,
            payroll: [
              {
                id: 1,
                employeeName: 'Dr. John Smith',
                employeeId: 'EMP001',
                period: 'December 2024',
                baseSalary: 7083.33,
                deductions: 850,
                bonuses: 500,
                netPay: 6733.33,
                status: 'processed'
              }
            ]
          }));
          break;
        case 2: // Leave Requests
          setData(prev => ({
            ...prev,
            leaveRequests: [
              {
                id: 1,
                employeeName: 'Dr. John Smith',
                leaveType: 'Annual Leave',
                startDate: '2024-12-25',
                endDate: '2024-12-30',
                days: 5,
                reason: 'Christmas vacation',
                status: 'pending',
                submittedDate: '2024-12-15'
              },
              {
                id: 2,
                employeeName: 'Sarah Johnson',
                leaveType: 'Sick Leave',
                startDate: '2024-12-18',
                endDate: '2024-12-19',
                days: 2,
                reason: 'Medical appointment',
                status: 'approved',
                submittedDate: '2024-12-16'
              }
            ]
          }));
          break;
        case 3: // Performance Reviews
          setData(prev => ({
            ...prev,
            performanceReviews: [
              {
                id: 1,
                employeeName: 'Dr. John Smith',
                reviewPeriod: 'Q4 2024',
                overallRating: 4.5,
                goals: 'Research publication, Course development',
                achievements: 'Published 2 papers, Developed new curriculum',
                reviewDate: '2024-12-10',
                reviewer: 'Dean Williams'
              }
            ]
          }));
          break;
        case 4: // Assets
          setData(prev => ({
            ...prev,
            assets: [
              {
                id: 1,
                name: 'MacBook Pro 16"',
                type: 'Laptop',
                serialNumber: 'MBP2024001',
                assignedTo: 'Dr. John Smith',
                assignedDate: '2024-01-15',
                status: 'assigned',
                value: 2500
              },
              {
                id: 2,
                name: 'Dell Monitor 27"',
                type: 'Monitor',
                serialNumber: 'DM27001',
                assignedTo: null,
                assignedDate: null,
                status: 'available',
                value: 350
              }
            ]
          }));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading HR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'processed':
      case 'assigned':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
      case 'rejected':
      case 'failed':
        return 'error';
      case 'available':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'processed':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'rejected':
        return <Cancel />;
      default:
        return null;
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            children
          )}
        </Box>
      )}
    </div>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Human Resources Management
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Employees" icon={<Person />} />
            <Tab label="Payroll" icon={<PaymentIcon />} />
            <Tab label="Leave Requests" icon={<BeachAccess />} />
            <Tab label="Performance" icon={<Assessment />} />
            <Tab label="Assets" icon={<Computer />} />
          </Tabs>
        </Box>

        {/* Employees Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Employee Management</Typography>
            <RoleGuard allowedRoles={['admin', 'hr_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('employee')}
                sx={{ textTransform: 'none' }}
              >
                Add Employee
              </Button>
            </RoleGuard>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Hire Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {employee.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{employee.employeeId}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{new Date(employee.hireDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={employee.status}
                        color={getStatusColor(employee.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <RoleGuard allowedRoles={['admin', 'hr_staff']}>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </RoleGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payroll Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Payroll Management</Typography>
            <RoleGuard allowedRoles={['admin', 'hr_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('payroll')}
                sx={{ textTransform: 'none' }}
              >
                Process Payroll
              </Button>
            </RoleGuard>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Base Salary</TableCell>
                  <TableCell align="right">Deductions</TableCell>
                  <TableCell align="right">Bonuses</TableCell>
                  <TableCell align="right">Net Pay</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.payroll.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {payroll.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payroll.employeeId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{payroll.period}</TableCell>
                    <TableCell align="right">${payroll.baseSalary.toLocaleString()}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      -${payroll.deductions.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      +${payroll.bonuses.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${payroll.netPay.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(payroll.status)}
                        label={payroll.status}
                        color={getStatusColor(payroll.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Leave Requests Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Leave Request Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('leave')}
              sx={{ textTransform: 'none' }}
            >
              Request Leave
            </Button>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell align="center">Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.leaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{request.employeeName}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{request.days}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <RoleGuard allowedRoles={['admin', 'hr_staff']}>
                        {request.status === 'pending' && (
                          <>
                            <IconButton size="small" color="success">
                              <CheckCircle />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </RoleGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Performance Reviews Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Performance Reviews</Typography>
            <RoleGuard allowedRoles={['admin', 'hr_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('performance')}
                sx={{ textTransform: 'none' }}
              >
                Create Review
              </Button>
            </RoleGuard>
          </Box>
          
          <Grid container spacing={2}>
            {data.performanceReviews.map((review) => (
              <Grid item xs={12} md={6} key={review.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{review.employeeName}</Typography>
                        <Typography color="text.secondary">{review.reviewPeriod}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                          {review.overallRating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /5.0
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Goals:
                      </Typography>
                      <Typography variant="body2">{review.goals}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Achievements:
                      </Typography>
                      <Typography variant="body2">{review.achievements}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Reviewed by: {review.reviewer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Assets Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Asset Management</Typography>
            <RoleGuard allowedRoles={['admin', 'hr_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('asset')}
                sx={{ textTransform: 'none' }}
              >
                Add Asset
              </Button>
            </RoleGuard>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Assigned Date</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{asset.name}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.serialNumber}</TableCell>
                    <TableCell>{asset.assignedTo || '-'}</TableCell>
                    <TableCell>
                      {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell align="right">${asset.value.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={asset.status}
                        color={getStatusColor(asset.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <RoleGuard allowedRoles={['admin', 'hr_staff']}>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        {asset.status === 'available' && (
                          <IconButton size="small" color="primary">
                            <Work />
                          </IconButton>
                        )}
                      </RoleGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Generic Dialog for Forms */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'employee' && 'Add New Employee'}
          {dialogType === 'payroll' && 'Process Payroll'}
          {dialogType === 'leave' && 'Request Leave'}
          {dialogType === 'performance' && 'Create Performance Review'}
          {dialogType === 'asset' && 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Form implementation in progress. This dialog prevents UI freezing by properly handling state.
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  dialogType === 'employee' ? 'Employee Name' :
                  dialogType === 'leave' ? 'Leave Type' :
                  dialogType === 'asset' ? 'Asset Name' : 'Title'
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  dialogType === 'employee' ? 'Department' :
                  dialogType === 'payroll' ? 'Employee' :
                  dialogType === 'leave' ? 'Start Date' :
                  dialogType === 'asset' ? 'Asset Type' : 'Value'
                }
                type={dialogType === 'leave' ? 'date' : 'text'}
                InputLabelProps={dialogType === 'leave' ? { shrink: true } : {}}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">
            {dialogType === 'employee' ? 'Add Employee' :
             dialogType === 'payroll' ? 'Process' :
             dialogType === 'leave' ? 'Submit Request' :
             dialogType === 'performance' ? 'Create Review' :
             'Add Asset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HRModule;
