import { Typography, Box, Paper } from '@mui/material';

export default function Contracts() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Contracts
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Manage business contracts and agreements.
        </Typography>
      </Paper>
    </Box>
  );
}
