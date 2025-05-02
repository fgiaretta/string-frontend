import React from 'react';
import { 
  Box, 
  FormControlLabel, 
  Switch, 
  Typography, 
  Tooltip, 
  Paper,
  useTheme
} from '@mui/material';
import { useApiEnvironment } from '../context/ApiEnvironmentContext';
import { CloudOutlined, CloudOff } from '@mui/icons-material';

const EnvironmentToggle: React.FC = () => {
  const { isProduction, toggleEnvironment } = useApiEnvironment();
  const theme = useTheme();

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 1, 
        display: 'flex', 
        alignItems: 'center', 
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Tooltip title={`Currently using ${isProduction ? 'Production' : 'Development'} API`}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          {isProduction ? (
            <CloudOutlined fontSize="small" color="primary" />
          ) : (
            <CloudOff fontSize="small" color="action" />
          )}
        </Box>
      </Tooltip>
      
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={isProduction}
            onChange={toggleEnvironment}
            color="primary"
          />
        }
        label={
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
            {isProduction ? 'PROD' : 'DEV'}
          </Typography>
        }
        sx={{ m: 0 }}
      />
    </Paper>
  );
};

export default EnvironmentToggle;
