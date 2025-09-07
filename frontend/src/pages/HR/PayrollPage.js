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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import FormDialog from '../../components/Common/FormDialog';
import GlassCard from '../../components/GlassCard';

const PayrollPage = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);

  // Mock data
  const mockPayrolls = [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Computer Science',
      position: 'Professor',
      baseSalary: 75000,
      allowances: 5000,
      deductions: 8000,
      netSalary: 72000,
      payPeriod: 'November 2024',
      status: 'paid',
      payDate: '2024-11-30'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'Mathematics',
      position: 'Associate Professor',
      baseSalary: 68000,
      allowances: 4000,
      deductions: 7200,
      netSalary: 64800,
      payPeriod: 'November 2024',
      status: 'processed',
      payDate: '2024-11-30'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'Administration',
      position: 'HR Manager',
      baseSalary: 55000,
      allowances: 3000,
      deductions: 5800,
      netSalary: 52200,
      payPeriod: 'November 2024',
      status: 'pending',
      payDate: '2024-11-30'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPayrolls(mockPayrolls);
      setLoading(false);
    }, 1000);
  }, []);

  const handleProcessPayroll = (formData) => {
    // Process new payroll entry
    const newPayroll = {
      id: payrolls.length + 1,
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      department: formData.department,
      position: formData.position,
      baseSalary: parseFloat(formData.baseSalary),
      allowances: parseFloat(formData.allowances || 0),
      deductions: parseFloat(formData.deductions || 0),
      netSalary: parseFloat(formData.baseSalary) + parseFloat(formData.allowances || 0) - parseFloat(formData.deductions || 0),
      payPeriod: formData.payPeriod,
      status: 'processed',
      payDate: new Date().toISOString().split('T')[0]
    };
    
    setPayrolls([...payrolls, newPayroll]);
    setShowProcessDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'processed': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const filteredPayrolls = payrolls.filter(payroll => 
    payroll.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Payroll Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowProcessDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Process Payroll
        </Button>
      </Box>

      {/* Search */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search payroll records..."
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
                    {filteredPayrolls.length}
                  </Typography>
                  <Typography variant="body2">Total Records</Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {(filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0) / 1000).toFixed(0)}K FCFA
                  </Typography>
                  <Typography variant="body2">Total Payroll</Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {filteredPayrolls.filter(p => p.status === 'paid').length}
                  </Typography>
                  <Typography variant="body2">Paid</Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {filteredPayrolls.filter(p => p.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payroll Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Employee</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Base Salary</strong></TableCell>
                <TableCell><strong>Allowances</strong></TableCell>
                <TableCell><strong>Deductions</strong></TableCell>
                <TableCell><strong>Net Salary</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayrolls.map((payroll) => (
                <TableRow key={payroll.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {payroll.employeeName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {payroll.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payroll.employeeId} • {payroll.position}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{payroll.department}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {payroll.baseSalary.toLocaleString()} FCFA
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main">
                      +{payroll.allowances.toLocaleString()} FCFA
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error.main">
                      -{payroll.deductions.toLocaleString()} FCFA
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {payroll.netSalary.toLocaleString()} FCFA
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                      color={getStatusColor(payroll.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedPayroll(payroll);
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
          <ReceiptIcon sx={{ mr: 1 }} />
          View Payslip
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download PDF
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <SendIcon sx={{ mr: 1 }} />
          Send to Employee
        </MenuItem>
      </Menu>

      {/* Process Payroll Dialog */}
      <FormDialog
        open={showProcessDialog}
        onClose={() => setShowProcessDialog(false)}
        title="Process New Payroll"
        fields={[
          { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
          { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
          { name: 'department', label: 'Department', type: 'select', required: true, options: [
            { value: 'Computer Science', label: 'Computer Science' },
            { value: 'Mathematics', label: 'Mathematics' },
            { value: 'Physics', label: 'Physics' },
            { value: 'Administration', label: 'Administration' },
            { value: 'Finance', label: 'Finance' }
          ]},
          { name: 'position', label: 'Position', type: 'text', required: true },
          { name: 'baseSalary', label: 'Base Salary (FCFA)', type: 'number', required: true, min: 0 },
          { name: 'allowances', label: 'Allowances (FCFA)', type: 'number', min: 0, width: 6 },
          { name: 'deductions', label: 'Deductions (FCFA)', type: 'number', min: 0, width: 6 },
          { name: 'payPeriod', label: 'Pay Period', type: 'text', required: true, placeholder: 'e.g., December 2024' }
        ]}
        onSave={handleProcessPayroll}
      />
    </Box>
  );
};

export default PayrollPage;
