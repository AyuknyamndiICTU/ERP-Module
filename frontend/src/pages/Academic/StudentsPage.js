import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const StudentsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Students
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Student management functionality will be implemented in Phase 2.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentsPage;
