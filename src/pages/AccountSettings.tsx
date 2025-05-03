import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ProfileFormData {
  username: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountSettings() {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    }
  });

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user?.id) throw new Error('User ID not found');
      return api.put(`/panel-admin/${user.id}/profile`, data);
    },
    onSuccess: () => {
      setProfileSuccess('Profile updated successfully');
      setTimeout(() => setProfileSuccess(null), 5000);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      if (!user?.id) throw new Error('User ID not found');
      return api.put(`/panel-admin/${user.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      setPasswordSuccess('Password updated successfully');
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordSuccess(null), 5000);
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={500}>
        Account Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your account information and security settings
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{ width: 100, height: 100, mb: 2 }}
                  alt={user?.username || "User"}
                  src="/avatar.jpg"
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    width: 36,
                    height: 36,
                  }}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === 'super' ? 'Super Admin' : 'Standard Admin'}
              </Typography>
            </CardContent>
          </Card>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1">
                {user?.status === 'active' ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="account settings tabs"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2,
              }}
            >
              <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
              <Tab icon={<LockIcon />} iconPosition="start" label="Password" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  {profileSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      {profileSuccess}
                    </Alert>
                  )}
                  {updateProfileMutation.isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {(updateProfileMutation.error as Error).message || 'An error occurred while updating your profile'}
                    </Alert>
                  )}

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="username"
                        control={profileForm.control}
                        rules={{ required: 'Username is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            label="Username"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="email"
                        control={profileForm.control}
                        rules={{
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            label="Email"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={updateProfileMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                          disabled={updateProfileMutation.isPending}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                  {passwordSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                      {passwordSuccess}
                    </Alert>
                  )}
                  {updatePasswordMutation.isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {(updatePasswordMutation.error as Error).message || 'An error occurred while updating your password'}
                    </Alert>
                  )}

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Controller
                        name="currentPassword"
                        control={passwordForm.control}
                        rules={{ required: 'Current password is required' }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            type="password"
                            label="Current Password"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="newPassword"
                        control={passwordForm.control}
                        rules={{
                          required: 'New password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            type="password"
                            label="New Password"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="confirmPassword"
                        control={passwordForm.control}
                        rules={{
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === passwordForm.getValues('newPassword') || 'Passwords do not match',
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            type="password"
                            label="Confirm New Password"
                            fullWidth
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={updatePasswordMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                          disabled={updatePasswordMutation.isPending}
                        >
                          Update Password
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
