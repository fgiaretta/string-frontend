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
  Typography 
} from '@mui/material';

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
    </Box>
  );
}
