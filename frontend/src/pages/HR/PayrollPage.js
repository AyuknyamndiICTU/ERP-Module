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
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  MonetizationOn as SalaryIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useApiData, useDialogState } from '../../hooks/useApiData';
import { FormDialog, ConfirmDialog, DetailDialog } from '../../components/Common/DialogComponents';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

const PayrollPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Mock API service for payroll
  const mockPayrollService = {
    getAll: async () => ({
      data: {
        success: true,
        data: [
          {
            id: 1,
            employeeName: 'John Smith',
            employeeId: 'EMP001',
            position: 'Senior Professor',
            department: 'Computer Science',
            baseSalary: 75000,
            allowances: 5000,
            deductions: 8500,
            netSalary: 71500,
            payPeriod: '2024-08',
            payDate: '2024-08-31',
            status: 'paid',
            bankAccount: '****1234',
            taxDeducted: 7500,
            overtime: 0
          },
          {
            id: 2,
            employeeName: 'Sarah Johnson',
            employeeId: 'EMP002',
            position: 'HR Manager',
            department: 'Human Resources',
            baseSalary: 65000,
            allowances: 3000,
            deductions: 7200,
            netSalary: 60800,
            payPeriod: '2024-08',
            payDate: '2024-08-31',
            status: 'paid',
            bankAccount: '****5678',
            taxDeducted: 6200,
            overtime: 0
          },
          {
            id: 3,
            employeeName: 'Michael Brown',
            employeeId: 'EMP003',
            position: 'Finance Analyst',
            department: 'Finance',
            baseSalary: 55000,
            allowances: 2000,
            deductions: 6100,
            netSalary: 50900,
            payPeriod: '2024-09',
            payDate: '2024-09-30',
            status: 'pending',
            bankAccount: '****9012',
            taxDeducted: 5100,
            overtime: 500
          },
          {
            id: 4,
            employeeName: 'Emily Davis',
            employeeId: 'EMP004',
            position: 'Assistant Professor',
            department: 'Mathematics',
            baseSalary: 60000,
            allowances: 2500,
            deductions: 6750,
            netSalary: 55750,
            payPeriod: '2024-09',
            payDate: '2024-09-30',
            status: 'processing',
            bankAccount: '****3456',
            taxDeducted: 5750,
            overtime: 0
          }
        ]
      }
    }),
    create: async (data) => ({
      data: {
        success: true,
        data: { id: Date.now(), ...data, status: 'pending' }
      }
    }),
    update: async (id, data) => ({ data: { success: true, data: { id, ...data } } }),
    delete: async (id) => ({ data: { success: true } }),
    getById: async (id) => ({ data: { success: true, data: {} } })
  };

  const { data: payrollRecords, loading, createItem, updateItem, deleteItem, handleSearch } = useApiData(mockPayrollService);
  const { dialogs, selectedItem, openDialog, closeDialog } = useDialogState();

  const payrollFields = [
    { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
    { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
    { name: 'payPeriod', label: 'Pay Period (YYYY-MM)', type: 'text', required: true },
    { name: 'baseSalary', label: 'Base Salary ($)', type: 'number', required: true, min: 0 },
    { name: 'allowances', label: 'Allowances ($)', type: 'number', min: 0 },
    { name: 'overtime', label: 'Overtime ($)', type: 'number', min: 0 },
    { name: 'deductions', label: 'Deductions ($)', type: 'number', min: 0 },
    { name: 'bankAccount', label: 'Bank Account', type: 'text' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'processing': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const handleMenuClick = (event, payroll) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayroll(payroll);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayroll(null);
  };

  const handleCreatePayroll = async (data) => {
    try {
      // Calculate net salary
      const gross = (data.baseSalary || 0) + (data.allowances || 0) + (data.overtime || 0);
      const taxDeducted = gross * 0.1; // 10% tax
      const totalDeductions = (data.deductions || 0) + taxDeducted;
      const netSalary = gross - totalDeductions;

      await createItem({
        ...data,
        netSalary,
        taxDeducted,
        payDate: new Date().toISOString().split('T')[0]
      });
      closeDialog('create');
    } catch (error) {
      logger.error('Error creating payroll:', error);
    }
  };

  const handleUpdatePayroll = async (data) => {
    try {
      await updateItem(selectedItem.id, data);
      closeDialog('edit');
    } catch (error) {
      logger.error('Error updating payroll:', error);
    }
  };

  const handleProcessPayment = async (payroll) => {
    try {
      await updateItem(payroll.id, {
        ...payroll,
        status: 'processing'
      });
      handleMenuClose();
    } catch (error) {
      logger.error('Error processing payment:', error);
    }
  };

  // Filter payroll records based on tab
  const getFilteredPayrolls = () => {
    switch (tabValue) {
      case 0: return payrollRecords; // All
      case 1: return payrollRecords.filter(payroll => payroll.status === 'pending');
      case 2: return payrollRecords.filter(payroll => payroll.status === 'processing');
      case 3: return payrollRecords.filter(payroll => payroll.status === 'paid');
      default: return payrollRecords;
    }
  };

  // Calculate summary statistics
  const totalPayroll = payrollRecords.reduce((sum, payroll) => sum + payroll.netSalary, 0);
  const pendingPayments = payrollRecords.filter(payroll => payroll.status === 'pending').length;
  const processingPayments = payrollRecords.filter(payroll => payroll.status === 'processing').length;
  const completedPayments = payrollRecords.filter(payroll => payroll.status === 'paid').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Payroll Management
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
          Process Payroll
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Payroll
              </Typography>
              <Typography variant="h4" fontWeight="700">
                ${totalPayroll.toLocaleString()}
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
                {pendingPayments}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Processing
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {processingPayments}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {completedPayments}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search payroll records..."
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

      {/* Payroll Table */}
      <GlassCard>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ px: 3, pt: 2 }}>
          <Tab label="All Records" />
          <Tab label="Pending" />
          <Tab label="Processing" />
          <Tab label="Paid" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Pay Period</TableCell>
                <TableCell>Gross Salary</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Net Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredPayrolls().map((payroll) => (
                <TableRow key={payroll.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
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
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {payroll.payPeriod}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pay Date: {payroll.payDate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${(payroll.baseSalary + payroll.allowances + payroll.overtime).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Base: ${payroll.baseSalary.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${payroll.deductions.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tax: ${payroll.taxDeducted.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="700" color="success.main">
                      ${payroll.netSalary.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payroll.status.toUpperCase()}
                      color={getStatusColor(payroll.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, payroll)}
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
        <MenuItem onClick={() => { openDialog('detail', selectedPayroll); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        {selectedPayroll?.status === 'pending' && (
          <MenuItem onClick={() => handleProcessPayment(selectedPayroll)} sx={{ color: 'info.main' }}>
            <PaymentIcon sx={{ mr: 1 }} fontSize="small" />
            Process Payment
          </MenuItem>
        )}
        <MenuItem onClick={() => { logger.debug('Download payslip:', selectedPayroll); handleMenuClose(); }}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download Payslip
        </MenuItem>
        <MenuItem onClick={() => { logger.debug('Send payslip:', selectedPayroll); handleMenuClose(); }}>
          <ReceiptIcon sx={{ mr: 1 }} fontSize="small" />
          Send Payslip
        </MenuItem>
        <MenuItem onClick={() => { openDialog('edit', selectedPayroll); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Record
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <FormDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        title="Process New Payroll"
        fields={payrollFields}
        onSave={handleCreatePayroll}
        loading={loading}
      />

      <FormDialog
        open={dialogs.edit}
        onClose={() => closeDialog('edit')}
        title="Edit Payroll Record"
        fields={payrollFields}
        data={selectedItem}
        onSave={handleUpdatePayroll}
        loading={loading}
      />

      <DetailDialog
        open={dialogs.detail}
        onClose={() => closeDialog('detail')}
        title="Payroll Details"
        data={selectedItem}
        fields={[
          { name: 'employeeName', label: 'Employee Name' },
          { name: 'employeeId', label: 'Employee ID' },
          { name: 'position', label: 'Position' },
          { name: 'department', label: 'Department' },
          { name: 'payPeriod', label: 'Pay Period' },
          { name: 'payDate', label: 'Pay Date' },
          { name: 'baseSalary', label: 'Base Salary', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'allowances', label: 'Allowances', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'overtime', label: 'Overtime', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'deductions', label: 'Deductions', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'taxDeducted', label: 'Tax Deducted', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'netSalary', label: 'Net Salary', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'bankAccount', label: 'Bank Account' },
          { name: 'status', label: 'Status', render: (value) => (
            <Chip label={value?.toUpperCase()} color={getStatusColor(value)} size="small" />
          )}
        ]}
        actions={[
          {
            label: 'Download Payslip',
            onClick: () => logger.debug('Download payslip:', selectedItem),
            icon: <DownloadIcon />,
            variant: 'outlined'
          },
          {
            label: 'Send Payslip',
            onClick: () => logger.debug('Send payslip:', selectedItem),
            icon: <ReceiptIcon />,
            variant: 'contained'
          }
        ]}
      />
    </Box>
  );
};

export default PayrollPage;
