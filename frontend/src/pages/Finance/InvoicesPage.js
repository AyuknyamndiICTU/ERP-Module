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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    studentName: '',
    studentId: '',
    amount: '',
    feeType: 'Tuition Fee',
    dueDate: '',
    description: ''
  });

  // Mock data
  const mockInvoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      studentName: 'Alice Johnson',
      studentId: 'STU001',
      amount: 2500.00,
      dueDate: '2024-12-15',
      status: 'pending',
      feeType: 'Tuition Fee',
      description: 'Fall 2024 Tuition Fee',
      createdDate: '2024-11-01'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      studentName: 'Bob Smith',
      studentId: 'STU002',
      amount: 1200.00,
      dueDate: '2024-12-20',
      status: 'paid',
      feeType: 'Lab Fee',
      description: 'Computer Lab Usage Fee',
      createdDate: '2024-11-02'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      studentName: 'Carol Davis',
      studentId: 'STU003',
      amount: 800.00,
      dueDate: '2024-12-10',
      status: 'overdue',
      feeType: 'Library Fee',
      description: 'Library Services and Books',
      createdDate: '2024-10-15'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddInvoice = () => {
    if (user?.role === 'admin' || user?.role === 'finance_staff') {
      setDialogOpen(true);
    } else {
      alert('Access Restricted: Only administrators and finance staff can add invoices.');
    }
  };

  const handleSaveInvoice = () => {
    if (!newInvoice.studentName || !newInvoice.amount || !newInvoice.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const invoice = {
      id: invoices.length + 1,
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      ...newInvoice,
      amount: parseFloat(newInvoice.amount),
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setInvoices([...invoices, invoice]);
    setDialogOpen(false);
    setNewInvoice({
      studentName: '',
      studentId: '',
      amount: '',
      feeType: 'Tuition Fee',
      dueDate: '',
      description: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
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
          Invoice Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddInvoice}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Create Invoice
        </Button>
      </Box>

      {/* Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search invoices..."
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
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
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
                    {filteredInvoices.length}
                  </Typography>
                  <Typography variant="body2">Total Invoices</Typography>
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
                    ${filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
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
                    {filteredInvoices.filter(inv => inv.status === 'paid').length}
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
                    {filteredInvoices.filter(inv => inv.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Invoice #</strong></TableCell>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Fee Type</strong></TableCell>
                <TableCell><strong>Due Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {invoice.studentName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {invoice.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600" color="primary.main">
                      ${invoice.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>{invoice.feeType}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      color={getStatusColor(invoice.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedInvoice(invoice);
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
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Invoice
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <SendIcon sx={{ mr: 1 }} />
          Send Reminder
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Invoice Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student Name"
                value={newInvoice.studentName}
                onChange={(e) => setNewInvoice({...newInvoice, studentName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                value={newInvoice.studentId}
                onChange={(e) => setNewInvoice({...newInvoice, studentId: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Fee Type</InputLabel>
                <Select
                  value={newInvoice.feeType}
                  label="Fee Type"
                  onChange={(e) => setNewInvoice({...newInvoice, feeType: e.target.value})}
                >
                  <MenuItem value="Tuition Fee">Tuition Fee</MenuItem>
                  <MenuItem value="Lab Fee">Lab Fee</MenuItem>
                  <MenuItem value="Library Fee">Library Fee</MenuItem>
                  <MenuItem value="Registration Fee">Registration Fee</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveInvoice}>Create Invoice</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoicesPage;
