import { Typography, Box, Paper } from '@mui/material';

export default function Reports() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Business Reports
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          View and generate business reports and analytics.
        </Typography>
      </Paper>
    </Box>
  );
}
