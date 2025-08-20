import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useApiData, useDialogState } from '../../hooks/useApiData';
import { FormDialog, ConfirmDialog, DetailDialog } from '../../components/Common/DialogComponents';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

const InvoicesPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Mock API service for invoices
  const mockInvoiceService = {
    getAll: async () => ({
      data: {
        success: true,
        data: [
          {
            id: 1,
            invoiceNumber: 'INV-2024-001',
            studentName: 'Alice Johnson',
            studentId: 'STU001',
            amount: 2500.00,
            dueDate: '2024-09-15',
            status: 'pending',
            feeType: 'Tuition Fee',
            createdDate: '2024-08-15',
            description: 'Fall 2024 Semester Tuition'
          },
          {
            id: 2,
            invoiceNumber: 'INV-2024-002',
            studentName: 'Bob Smith',
            studentId: 'STU002',
            amount: 150.00,
            dueDate: '2024-08-30',
            status: 'paid',
            feeType: 'Library Fee',
            createdDate: '2024-08-10',
            description: 'Library access and late fees'
          },
          {
            id: 3,
            invoiceNumber: 'INV-2024-003',
            studentName: 'Carol Davis',
            studentId: 'STU003',
            amount: 500.00,
            dueDate: '2024-09-01',
            status: 'overdue',
            feeType: 'Lab Fee',
            createdDate: '2024-07-20',
            description: 'Computer Lab usage fee'
          }
        ]
      }
    }),
    create: async (data) => ({
      data: {
        success: true,
        data: { id: Date.now(), ...data, invoiceNumber: `INV-2024-${String(Date.now()).slice(-3)}` }
      }
    }),
    update: async (id, data) => ({ data: { success: true, data: { id, ...data } } }),
    delete: async (id) => ({ data: { success: true } }),
    getById: async (id) => ({ data: { success: true, data: {} } })
  };

  const { data: invoices, loading, createItem, updateItem, deleteItem, handleSearch } = useApiData(mockInvoiceService);
  const { dialogs, selectedItem, openDialog, closeDialog } = useDialogState();

  const invoiceFields = [
    { name: 'studentName', label: 'Student Name', type: 'text', required: true, width: 6 },
    { name: 'studentId', label: 'Student ID', type: 'text', required: true, width: 6 },
    { name: 'feeType', label: 'Fee Type', type: 'select', required: true, options: [
      { value: 'tuition', label: 'Tuition Fee' },
      { value: 'library', label: 'Library Fee' },
      { value: 'lab', label: 'Lab Fee' },
      { value: 'sports', label: 'Sports Fee' },
      { value: 'transport', label: 'Transport Fee' }
    ]},
    { name: 'amount', label: 'Amount ($)', type: 'number', required: true, min: 0 },
    { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const handleMenuClick = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleCreateInvoice = async (data) => {
    try {
      await createItem({
        ...data,
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0]
      });
      closeDialog('create');
    } catch (error) {
      logger.error('Error creating invoice:', error);
    }
  };

  const handleUpdateInvoice = async (data) => {
    try {
      await updateItem(selectedItem.id, data);
      closeDialog('edit');
    } catch (error) {
      logger.error('Error updating invoice:', error);
    }
  };

  const handleDeleteInvoice = async () => {
    try {
      await deleteItem(selectedItem.id);
      closeDialog('delete');
    } catch (error) {
      logger.error('Error deleting invoice:', error);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Invoice Management
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
          Create Invoice
        </Button>
      </Box>

      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search invoices..."
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

      {/* Invoices Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Fee Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {invoice.invoiceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.8rem' }}>
                        {invoice.studentName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {invoice.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{invoice.feeType}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${invoice.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status.toUpperCase()}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, invoice)}
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
        <MenuItem onClick={() => { openDialog('detail', selectedInvoice); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { openDialog('edit', selectedInvoice); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => { /* Send invoice functionality */ handleMenuClose(); }}>
          <SendIcon sx={{ mr: 1 }} fontSize="small" />
          Send Invoice
        </MenuItem>
        <MenuItem onClick={() => { /* Download invoice functionality */ handleMenuClose(); }}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Download PDF
        </MenuItem>
        <MenuItem onClick={() => { openDialog('delete', selectedInvoice); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <FormDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        title="Create New Invoice"
        fields={invoiceFields}
        onSave={handleCreateInvoice}
        loading={loading}
      />

      <FormDialog
        open={dialogs.edit}
        onClose={() => closeDialog('edit')}
        title="Edit Invoice"
        fields={invoiceFields}
        data={selectedItem}
        onSave={handleUpdateInvoice}
        loading={loading}
      />

      <DetailDialog
        open={dialogs.detail}
        onClose={() => closeDialog('detail')}
        title="Invoice Details"
        data={selectedItem}
        fields={[
          { name: 'invoiceNumber', label: 'Invoice Number' },
          { name: 'studentName', label: 'Student Name' },
          { name: 'studentId', label: 'Student ID' },
          { name: 'feeType', label: 'Fee Type' },
          { name: 'amount', label: 'Amount', render: (value) => `$${value?.toFixed(2)}` },
          { name: 'dueDate', label: 'Due Date' },
          { name: 'status', label: 'Status', render: (value) => (
            <Chip label={value?.toUpperCase()} color={getStatusColor(value)} size="small" />
          )},
          { name: 'createdDate', label: 'Created Date' },
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
            label: 'Send Invoice',
            onClick: () => { /* Send invoice functionality */ },
            icon: <SendIcon />,
            variant: 'contained'
          }
        ]}
      />

      <ConfirmDialog
        open={dialogs.delete}
        onClose={() => closeDialog('delete')}
        onConfirm={handleDeleteInvoice}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${selectedItem?.invoiceNumber}? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={loading}
      />
    </Box>
  );
};

export default InvoicesPage;
