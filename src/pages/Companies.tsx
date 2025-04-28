import { Typography, Box, Paper } from '@mui/material';

export default function Companies() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Companies
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Manage your business companies and organizations here.
        </Typography>
      </Paper>
    </Box>
  );
}
