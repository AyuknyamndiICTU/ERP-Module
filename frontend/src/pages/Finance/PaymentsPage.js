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
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Mock data
  const mockPayments = [
    {
      id: 1,
      paymentId: 'PAY-2024-001',
      studentName: 'Alice Johnson',
      studentId: 'STU001',
      amount: 2500.00,
      paymentDate: '2024-11-15',
      status: 'completed',
      method: 'Credit Card',
      invoiceNumber: 'INV-2024-001',
      description: 'Tuition Fee Payment'
    },
    {
      id: 2,
      paymentId: 'PAY-2024-002',
      studentName: 'Bob Smith',
      studentId: 'STU002',
      amount: 1200.00,
      paymentDate: '2024-11-14',
      status: 'completed',
      method: 'Bank Transfer',
      invoiceNumber: 'INV-2024-002',
      description: 'Lab Fee Payment'
    },
    {
      id: 3,
      paymentId: 'PAY-2024-003',
      studentName: 'Carol Davis',
      studentId: 'STU003',
      amount: 800.00,
      paymentDate: '2024-11-13',
      status: 'pending',
      method: 'Cash',
      invoiceNumber: 'INV-2024-003',
      description: 'Library Fee Payment'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card': return <CreditCardIcon />;
      case 'Bank Transfer': return <PaymentIcon />;
      case 'Cash': return <MoneyIcon />;
      default: return <PaymentIcon />;
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.studentId.toLowerCase().includes(searchTerm.toLowerCase())
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
          Payment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Process Payment
        </Button>
      </Box>

      {/* Search */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search payments..."
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
                    {filteredPayments.length}
                  </Typography>
                  <Typography variant="body2">Total Payments</Typography>
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
                    ${filteredPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Total Amount</Typography>
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
                    {filteredPayments.filter(p => p.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2">Completed</Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {filteredPayments.filter(p => p.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <CreditCardIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Payment ID</strong></TableCell>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{payment.paymentId}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {payment.studentName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {payment.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="primary.main">
                      ${payment.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getMethodIcon(payment.method)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {payment.method}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      color={getStatusColor(payment.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedPayment(payment);
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
          View Receipt
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <PaymentIcon sx={{ mr: 1 }} />
          Process Refund
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentsPage;
