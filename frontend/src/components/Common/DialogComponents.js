import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Generic Form Dialog Component
export const FormDialog = ({ 
  open, 
  onClose, 
  title, 
  fields, 
  data, 
  onSave, 
  loading = false,
  maxWidth = 'md',
  fullWidth = true 
}) => {
  const [formData, setFormData] = useState(data || {});
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    
    // Validate required fields
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const renderField = (field) => {
    const commonProps = {
      fullWidth: true,
      margin: 'normal',
      value: formData[field.name] || '',
      onChange: (e) => handleChange(field.name, e.target.value),
      error: !!errors[field.name],
      helperText: errors[field.name],
      disabled: loading,
    };

    switch (field.type) {
      case 'select':
        return (
          <FormControl key={field.name} {...commonProps}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              label={field.label}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'textarea':
        return (
          <TextField
            key={field.name}
            {...commonProps}
            label={field.label}
            multiline
            rows={field.rows || 4}
          />
        );
      
      case 'number':
        return (
          <TextField
            key={field.name}
            {...commonProps}
            label={field.label}
            type="number"
            inputProps={{ min: field.min, max: field.max, step: field.step }}
          />
        );
      
      case 'date':
        return (
          <TextField
            key={field.name}
            {...commonProps}
            label={field.label}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );
      
      case 'email':
        return (
          <TextField
            key={field.name}
            {...commonProps}
            label={field.label}
            type="email"
          />
        );
      
      default:
        return (
          <TextField
            key={field.name}
            {...commonProps}
            label={field.label}
            type={field.type || 'text'}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h5" fontWeight="700">
          {title}
        </Typography>
        <IconButton onClick={onClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          {fields.map(field => (
            <Grid item xs={12} sm={field.width || 12} key={field.name}>
              {renderField(field)}
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minWidth: 120,
          }}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Confirmation Dialog Component
export const ConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  loading = false 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="600">
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity={severity} sx={{ mb: 2 }}>
          {message}
        </Alert>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === 'error' ? 'error' : 'primary'}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Detail View Dialog Component
export const DetailDialog = ({ 
  open, 
  onClose, 
  title, 
  data, 
  fields,
  actions = [],
  maxWidth = 'md' 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h5" fontWeight="700">
          {title}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {fields.map(field => (
            <Grid item xs={12} sm={field.width || 6} key={field.name}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {field.label}
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {field.render ? field.render(data?.[field.name]) : (data?.[field.name] || 'N/A')}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      
      {actions.length > 0 && (
        <DialogActions sx={{ p: 3, pt: 2 }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'outlined'}
              color={action.color || 'primary'}
              startIcon={action.icon}
              sx={action.sx}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

const DialogComponents = { FormDialog, ConfirmDialog, DetailDialog };
export default DialogComponents;
