import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CoursesPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Courses
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Course management functionality will be implemented in Phase 2.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CoursesPage;
