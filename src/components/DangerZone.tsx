import React, { ReactNode } from 'react';
import { Box, Paper, Typography, Divider, useTheme } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

interface DangerZoneProps {
  title?: string;
  children: ReactNode;
}

const DangerZone: React.FC<DangerZoneProps> = ({ 
  title = 'Danger Zone', 
  children 
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 0,
        border: '1px solid',
        borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.5)' : theme.palette.error.main,
        borderRadius: 2,
        backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(254, 226, 226, 0.6)',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 202, 202, 0.8)',
        }}
      >
        <WarningIcon 
          color="error" 
          sx={{ mr: 1.5 }} 
        />
        <Typography 
          variant="subtitle1" 
          fontWeight="medium"
          color={isDarkMode ? 'error.light' : 'error.dark'}
        >
          {title}
        </Typography>
      </Box>
      <Divider sx={{ 
        borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.5)' : theme.palette.error.main 
      }} />
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default DangerZone;
