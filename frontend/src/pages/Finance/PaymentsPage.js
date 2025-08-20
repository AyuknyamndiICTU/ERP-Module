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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Undo as RefundIcon,
  Download as DownloadIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';
import { useApiData, useDialogState } from '../../hooks/useApiData';
import { FormDialog, ConfirmDialog, DetailDialog } from '../../components/Common/DialogComponents';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

const PaymentsPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Mock API service for payments
  const mockPaymentService = {
    getAll: async () => ({
      data: {
        success: true,
        data: [
          {
            id: 1,
            transactionId: 'TXN-2024-001',
            invoiceNumber: 'INV-2024-001',
            studentName: 'Alice Johnson',
            studentId: 'STU001',
            amount: 2500.00,
            paymentMethod: 'Credit Card',
            status: 'completed',
            paymentDate: '2024-08-20',
            description: 'Tuition Fee Payment'
          },
          {
            id: 2,
            transactionId: 'TXN-2024-002',
            invoiceNumber: 'INV-2024-002',
            studentName: 'Bob Smith',
            studentId: 'STU002',
            amount: 150.00,
            paymentMethod: 'Bank Transfer',
            status: 'pending',
            paymentDate: '2024-08-21',
            description: 'Library Fee Payment'
          },
          {
            id: 3,
            transactionId: 'TXN-2024-003',
            invoiceNumber: 'INV-2024-003',
            studentName: 'Carol Davis',
            studentId: 'STU003',
            amount: 500.00,
            paymentMethod: 'Cash',
            status: 'failed',
            paymentDate: '2024-08-19',
            description: 'Lab Fee Payment'
          }
        ]
      }
    }),
    create: async (data) => ({
      data: {
        success: true,
        data: { id: Date.now(), ...data, transactionId: `TXN-2024-${String(Date.now()).slice(-3)}` }
      }
    }),
    update: async (id, data) => ({ data: { success: true, data: { id, ...data } } }),
    delete: async (id) => ({ data: { success: true } }),
    getById: async (id) => ({ data: { success: true, data: {} } })
  };

  const { data: payments, loading, createItem, updateItem, deleteItem, handleSearch } = useApiData(mockPaymentService);
  const { dialogs, selectedItem, openDialog, closeDialog } = useDialogState();

  const paymentFields = [
    { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true, width: 6 },
    { name: 'studentName', label: 'Student Name', type: 'text', required: true, width: 6 },
    { name: 'amount', label: 'Amount ($)', type: 'number', required: true, min: 0 },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', required: true, options: [
      { value: 'Credit Card', label: 'Credit Card' },
      { value: 'Debit Card', label: 'Debit Card' },
      { value: 'Bank Transfer', label: 'Bank Transfer' },
      { value: 'Cash', label: 'Cash' },
      { value: 'Check', label: 'Check' }
    ]},
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCardIcon fontSize="small" />;
      case 'Bank Transfer':
        return <BankIcon fontSize="small" />;
      default:
        return <PaymentIcon fontSize="small" />;
    }
  };

  const handleMenuClick = (event, payment) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayment(null);
  };

  const handleCreatePayment = async (data) => {
    try {
      await createItem({
        ...data,
        status: 'pending'
      });
      closeDialog('create');
    } catch (error) {
      logger.error('Error creating payment:', error);
    }
  };

  const handleUpdatePayment = async (data) => {
    try {
      await updateItem(selectedItem.id, data);
      closeDialog('edit');
    } catch (error) {
      logger.error('Error updating payment:', error);
    }
  };

  const handleDeletePayment = async () => {
    try {
      await deleteItem(selectedItem.id);
      closeDialog('delete');
    } catch (error) {
      logger.error('Error deleting payment:', error);
    }
  };

  // Calculate summary statistics
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Payment Management
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
          Record Payment
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Payments
              </Typography>
              <Typography variant="h4" fontWeight="700">
                ${totalPayments.toFixed(2)}
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
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {payments.length > 0 ? Math.round((completedPayments / payments.length) * 100) : 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={payments.length > 0 ? (completedPayments / payments.length) * 100 : 0}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search payments..."
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

      {/* Payments Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {payment.transactionId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.8rem' }}>
                        {payment.studentName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {payment.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{payment.invoiceNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${payment.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {payment.paymentMethod}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status.toUpperCase()}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, payment)}
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
        <MenuItem onClick={() => { openDialog('detail', selectedPayment); handleMenuClose(); }}>
          <PaymentIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { logger.debug('Download receipt:', selectedPayment); handleMenuClose(); }}>
          <ReceiptIcon sx={{ mr: 1 }} fontSize="small" />
          Download Receipt
        </MenuItem>
        {selectedPayment?.status === 'completed' && (
          <MenuItem onClick={() => { logger.debug('Process refund:', selectedPayment); handleMenuClose(); }}>
            <RefundIcon sx={{ mr: 1 }} fontSize="small" />
            Process Refund
          </MenuItem>
        )}
      </Menu>

      {/* Dialogs */}
      <FormDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        title="Record New Payment"
        fields={paymentFields}
        onSave={handleCreatePayment}
        loading={loading}
      />

      <DetailDialog
        open={dialogs.detail}
        onClose={() => closeDialog('detail')}
        title="Payment Details"
        data={selectedItem}
        fields={[
          { name: 'transactionId', label: 'Transaction ID' },
          { name: 'invoiceNumber', label: 'Invoice Number' },
          { name: 'studentName', label: 'Student Name' },
          { name: 'studentId', label: 'Student ID' },
          { name: 'amount', label: 'Amount', render: (value) => `$${value?.toFixed(2)}` },
          { name: 'paymentMethod', label: 'Payment Method' },
          { name: 'paymentDate', label: 'Payment Date' },
          { name: 'status', label: 'Status', render: (value) => (
            <Chip label={value?.toUpperCase()} color={getStatusColor(value)} size="small" />
          )},
          { name: 'description', label: 'Description', width: 12 }
        ]}
        actions={[
          {
            label: 'Download Receipt',
            onClick: () => logger.debug('Download receipt:', selectedItem),
            icon: <ReceiptIcon />,
            variant: 'outlined'
          },
          ...(selectedItem?.status === 'completed' ? [{
            label: 'Process Refund',
            onClick: () => logger.debug('Process refund:', selectedItem),
            icon: <RefundIcon />,
            variant: 'contained',
            color: 'warning'
          }] : [])
        ]}
      />
    </Box>
  );
};

export default PaymentsPage;
