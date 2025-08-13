import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const InvoicesPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoices
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Invoice management functionality will be implemented in Phase 3.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoicesPage;
