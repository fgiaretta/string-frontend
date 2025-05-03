import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import {
  SupervisorAccount as AdminIcon,
  CheckCircle as ApprovedIcon,
  Cancel as UnapprovedIcon,
  PersonAdd as NewAdminIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, isAfter } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { PanelAdmin } from '../services/authService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const theme = useTheme();
  const isSuperAdmin = hasPermission('super');

  // Fetch all admins
  const {
    data: admins,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admins'],
    queryFn: adminService.getAllAdmins,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading dashboard data: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Button variant="contained" color="primary" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  // Calculate dashboard metrics
  const totalAdmins = admins ? admins.length : 0;
  const approvedAdmins = admins ? admins.filter((admin) => admin.isApproved).length : 0;
  const unapprovedAdmins = totalAdmins - approvedAdmins;
  const superAdmins = admins ? admins.filter((admin) => admin.role === 'super').length : 0;
  const standardAdmins = totalAdmins - superAdmins;

  // Get recent admins (created in the last 7 days)
  const recentAdmins = admins
    ? admins
        .filter((admin) => {
          const createdDate = new Date(admin.createdAt);
          const sevenDaysAgo = subDays(new Date(), 7);
          return isAfter(createdDate, sevenDaysAgo);
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  // Get admins pending approval
  const pendingApprovalAdmins = admins
    ? admins
        .filter((admin) => !admin.isApproved)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  // Get recently logged in admins
  const recentlyLoggedInAdmins = admins
    ? admins
        .filter((admin) => admin.lastLogin)
        .sort((a, b) => {
          const dateA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const dateB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
    : [];

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {user && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Welcome, {user.username}!
              </Typography>
              <Typography variant="body1">
                You are logged in as a{' '}
                <Chip
                  label={user.role === 'super' ? 'Super Admin' : 'Standard Admin'}
                  color={user.role === 'super' ? 'primary' : 'default'}
                  size="small"
                />
              </Typography>
            </Box>
            <Box 
              component="img" 
              src={theme.palette.mode === 'dark' ? '/assets/s-white.png' : '/assets/s-black.png'} 
              alt="String Logo"
              sx={{ height: 24, opacity: 0.8 }}
            />
          </Box>
        </Paper>
      )}

      {/* Dashboard Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Administrators
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
              {totalAdmins}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Approved Admins
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
              {approvedAdmins}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Pending Approval
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
              {unapprovedAdmins}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'info.light',
              color: 'white',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Super Admins
            </Typography>
            <Typography variant="h3" component="div" sx={{ mt: 'auto' }}>
              {superAdmins}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Dashboard Content */}
      <Grid container spacing={3}>
        {/* Recently Added Admins */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recently Added Administrators"
              subheader="Administrators added in the last 7 days"
              action={
                <Button size="small" onClick={() => navigate('/admins')}>
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {recentAdmins.length > 0 ? (
                  recentAdmins.map((admin) => (
                    <ListItem
                      key={admin.id}
                      button
                      onClick={() => navigate(`/admins/${admin.id}`)}
                      divider
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <NewAdminIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={admin.username}
                        secondary={`Added on ${format(
                          new Date(admin.createdAt),
                          'MMM d, yyyy'
                        )}`}
                      />
                      <Chip
                        label={admin.role === 'super' ? 'Super Admin' : 'Standard Admin'}
                        color={admin.role === 'super' ? 'primary' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={admin.isApproved ? 'Approved' : 'Not Approved'}
                        color={admin.isApproved ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No administrators added recently" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Admins Pending Approval */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Pending Approval"
              subheader="Administrators waiting for approval"
              action={
                <Button
                  size="small"
                  onClick={() => navigate('/admins?filter=not-approved')}
                  disabled={!isSuperAdmin}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {pendingApprovalAdmins.length > 0 ? (
                  pendingApprovalAdmins.map((admin) => (
                    <ListItem
                      key={admin.id}
                      button
                      onClick={() => navigate(`/admins/${admin.id}`)}
                      divider
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <UnapprovedIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={admin.username}
                        secondary={`Added on ${format(
                          new Date(admin.createdAt),
                          'MMM d, yyyy'
                        )}`}
                      />
                      {isSuperAdmin && (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admins/${admin.id}`);
                          }}
                        >
                          Review
                        </Button>
                      )}
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No administrators pending approval" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Logins */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Recent Login Activity"
              subheader="Administrators who recently logged in"
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {recentlyLoggedInAdmins.length > 0 ? (
                  recentlyLoggedInAdmins.map((admin) => (
                    <ListItem
                      key={admin.id}
                      button
                      onClick={() => navigate(`/admins/${admin.id}`)}
                      divider
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <LoginIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={admin.username}
                        secondary={`Last login: ${
                          admin.lastLogin
                            ? format(new Date(admin.lastLogin), 'MMM d, yyyy HH:mm')
                            : 'Never'
                        }`}
                      />
                      <Chip
                        label={admin.role === 'super' ? 'Super Admin' : 'Standard Admin'}
                        color={admin.role === 'super' ? 'primary' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={admin.status === 'active' ? 'Active' : 'Inactive'}
                        color={admin.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent login activity" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
