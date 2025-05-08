import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Companies',
      description: 'Manage all registered companies',
      icon: <BusinessIcon fontSize="large" color="primary" />,
      action: () => navigate('/companies'),
      color: '#e3f2fd',
    },
    {
      title: 'Default Providers',
      description: 'Manage providers without a company',
      icon: <PeopleIcon fontSize="large" color="secondary" />,
      action: () => navigate('/providers/unassigned'),
      color: '#f3e5f5',
    },
    {
      title: 'Settings',
      description: 'Configure application settings',
      icon: <SettingsIcon fontSize="large" color="action" />,
      action: () => navigate('/settings'),
      color: '#e8f5e9',
    },
    {
      title: 'Schedule',
      description: 'View provider schedules',
      icon: <CalendarMonthIcon fontSize="large" color="error" />,
      action: () => navigate('/companies'),
      color: '#fff3e0',
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  bgcolor: action.color,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    cursor: 'pointer'
                  }
                }}
                onClick={action.action}
              >
                <Box display="flex" justifyContent="center" mb={1}>
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" align="center" fontWeight="bold">
                  {action.title}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  {action.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
