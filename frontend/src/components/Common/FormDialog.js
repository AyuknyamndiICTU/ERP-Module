import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';

const FormDialog = ({ open, onClose, title, fields = [], onSave }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const missingFields = fields.filter(field => field.required && !formData[field.name]);
    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    onSave(formData);
    setFormData({});
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {fields.map((field) => {
            if (field.type === 'select') {
              return (
                <FormControl key={field.name} fullWidth required={field.required}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={formData[field.name] || ''}
                    label={field.label}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    {field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            return (
              <TextField
                key={field.name}
                fullWidth
                label={field.label}
                type={field.type || 'text'}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                multiline={field.type === 'textarea'}
                rows={field.type === 'textarea' ? 4 : 1}
              />
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
