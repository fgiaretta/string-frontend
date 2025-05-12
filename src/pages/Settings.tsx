import { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  FormGroup, 
  Grid, 
  Switch, 
  TextField, 
  Typography,
  Alert
} from '@mui/material';
import DangerZone from '../components/DangerZone';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Settings() {
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:3000/api',
    darkMode: false,
    notifications: true,
    autoRefresh: false,
    refreshInterval: 30,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all application data? This action cannot be undone.')) {
      // Reset application data
      console.log('Resetting application data...');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Delete account
      console.log('Deleting account...');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API URL"
                name="apiUrl"
                value={settings.apiUrl}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Interface Settings
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleChange}
                  name="darkMode"
                />
              }
              label="Dark Mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={handleChange}
                  name="notifications"
                />
              }
              label="Enable Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoRefresh}
                  onChange={handleChange}
                  name="autoRefresh"
                />
              }
              label="Auto Refresh Data"
            />
          </FormGroup>

          {settings.autoRefresh && (
            <Box mt={2}>
              <FormControl fullWidth>
                <TextField
                  label="Refresh Interval (seconds)"
                  type="number"
                  name="refreshInterval"
                  value={settings.refreshInterval}
                  onChange={handleChange}
                  inputProps={{ min: 5, max: 300 }}
                />
              </FormControl>
            </Box>
          )}

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Settings
            </Button>
          </Box>
        </CardContent>
      </Card>

      <DangerZone>
        <Alert severity="warning" sx={{ mb: 3 }}>
          The actions below can result in permanent data loss. Proceed with caution.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'error.main', 
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Reset Application Data
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                This will clear all cached data and reset the application to its default state.
                Your account will remain intact.
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleResetData}
                startIcon={<DeleteIcon />}
              >
                Reset Data
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'error.main', 
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Delete Account
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                This will permanently delete your account and all associated data.
                This action cannot be undone.
              </Typography>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteAccount}
                startIcon={<DeleteIcon />}
              >
                Delete Account
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DangerZone>
    </Box>
  );
}
