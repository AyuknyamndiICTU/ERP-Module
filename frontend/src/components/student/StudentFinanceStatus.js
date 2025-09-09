import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  Warning,
  CheckCircle,
  Schedule,
  Block
} from '@mui/icons-material';
import axios from 'axios';

const StudentFinanceStatus = ({ studentId }) => {
  const [financeData, setFinanceData] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchFinanceData();
      fetchInstallments();
    }
  }, [studentId]);

  const fetchFinanceData = async () => {
    try {
      const response = await axios.get(`/api/finance/student/${studentId}/finance-status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFinanceData(response.data.financeStatus);
    } catch (error) {
      setError('Failed to fetch finance status');
      console.error('Error fetching finance data:', error);
    }
  };

  const fetchInstallments = async () => {
    try {
      const response = await axios.get(`/api/finance/student/${studentId}/installments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInstallments(response.data.installments || []);
    } catch (error) {
      console.error('Error fetching installments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'overdue': return 'error';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle />;
      case 'partial': return <Schedule />;
      case 'overdue': return <Warning />;
      case 'blocked': return <Block />;
      default: return <Payment />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculatePaymentProgress = () => {
    if (!financeData) return 0;
    return (financeData.totalPaidAmount / financeData.totalFeeAmount) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!financeData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No finance record found for this student.
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Finance Status - {financeData.student?.matricule}
      </Typography>
      
      {financeData.isBlocked && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">Account Blocked</Typography>
          <Typography>{financeData.blockReason}</Typography>
          <Typography variant="body2">
            Blocked on: {formatDate(financeData.blockedDate)}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Payment Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Overview
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <AccountBalance color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">
                      {formatCurrency(financeData.totalFeeAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Fee Amount
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Payment color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">
                      {formatCurrency(financeData.totalPaidAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Amount Paid
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">
                      {formatCurrency(financeData.outstandingAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Outstanding Amount
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Payment Progress: {Math.round(calculatePaymentProgress())}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={calculatePaymentProgress()} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Academic Year: {financeData.academicYear}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Semester: {financeData.semester}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Payment: {financeData.lastPaymentDate ? formatDate(financeData.lastPaymentDate) : 'None'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next Due: {financeData.nextDueDate ? formatDate(financeData.nextDueDate) : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Status
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                {getStatusIcon(financeData.paymentStatus)}
                <Chip
                  label={financeData.paymentStatus.toUpperCase()}
                  color={getStatusColor(financeData.paymentStatus)}
                  sx={{ ml: 1 }}
                />
              </Box>

              {financeData.installmentPlan && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Installment Plan
                  </Typography>
                  <Typography variant="body2">
                    Total Installments: {financeData.installmentPlan.totalInstallments}
                  </Typography>
                  <Typography variant="body2">
                    Amount per Installment: {formatCurrency(financeData.installmentPlan.installmentAmount)}
                  </Typography>
                  <Typography variant="body2">
                    Frequency: {financeData.installmentPlan.frequency}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Installments Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Installment Details
              </Typography>
              
              {installments.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Installment #</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Paid Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Transaction Ref</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {installments.map((installment) => (
                        <TableRow key={installment.id}>
                          <TableCell>
                            {installment.installmentNumber} / {installment.totalInstallments}
                          </TableCell>
                          <TableCell>{formatDate(installment.dueDate)}</TableCell>
                          <TableCell>{formatCurrency(installment.amount)}</TableCell>
                          <TableCell>{formatCurrency(installment.paidAmount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={installment.status}
                              color={getStatusColor(installment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {installment.paymentMethod || '-'}
                          </TableCell>
                          <TableCell>
                            {installment.transactionReference || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No installments found for this student.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentFinanceStatus;
