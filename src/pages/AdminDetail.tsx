import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RevokeIcon,
  ArrowBack,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

const AdminDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const isSuperAdmin = hasPermission('super');

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch admin data
  const {
    data: admin,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', id],
    queryFn: () => (id ? adminService.getAdmin(id) : null),
    enabled: !!id,
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: (adminId: string) => adminService.deleteAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      navigate('/admins');
    },
  });

  // Approve admin mutation
  const approveMutation = useMutation({
    mutationFn: (adminId: string) => adminService.approveAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', id] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });

  // Revoke admin mutation
  const revokeMutation = useMutation({
    mutationFn: (adminId: string) => adminService.revokeAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', id] });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Handle approve/revoke
  const handleApprove = () => {
    if (id) {
      approveMutation.mutate(id);
    }
  };

  const handleRevoke = () => {
    if (id) {
      revokeMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !admin) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading admin: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/admins')}>
          Back to Admin List
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admins')}
        sx={{ mb: 3 }}
      >
        Back to Admin List
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            Administrator Details
          </Typography>

          {isSuperAdmin && (
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/admins/${id}/edit`)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>

              {admin.isApproved ? (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<RevokeIcon />}
                  onClick={handleRevoke}
                  disabled={revokeMutation.isPending}
                >
                  Revoke Approval
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  Approve
                </Button>
              )}

              <IconButton
                color="error"
                onClick={handleDeleteClick}
                disabled={deleteMutation.isPending}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Basic Information
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Username"
                    secondary={admin.username}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Email"
                    secondary={admin.email}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Role"
                    secondary={
                      <Chip
                        label={admin.role === 'super' ? 'Super Admin' : 'Standard Admin'}
                        color={admin.role === 'super' ? 'primary' : 'default'}
                        size="small"
                      />
                    }
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={admin.status === 'active' ? 'Active' : 'Inactive'}
                        color={admin.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    }
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Approval Information
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Approval Status"
                    secondary={
                      <Chip
                        label={admin.isApproved ? 'Approved' : 'Not Approved'}
                        color={admin.isApproved ? 'success' : 'warning'}
                        size="small"
                      />
                    }
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  />
                </ListItem>
                {admin.isApproved && (
                  <>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="Approved By"
                        secondary={admin.approvedBy || 'N/A'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="Approved At"
                        secondary={
                          admin.approvedAt
                            ? format(new Date(admin.approvedAt), 'MMM d, yyyy HH:mm')
                            : 'N/A'
                        }
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                System Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Last Login"
                      secondary={
                        admin.lastLogin
                          ? format(new Date(admin.lastLogin), 'MMM d, yyyy HH:mm')
                          : 'Never'
                      }
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Created At"
                      secondary={
                        admin.createdAt
                          ? format(new Date(admin.createdAt), 'MMM d, yyyy HH:mm')
                          : 'N/A'
                      }
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="Last Updated"
                      secondary={
                        admin.updatedAt
                          ? format(new Date(admin.updatedAt), 'MMM d, yyyy HH:mm')
                          : 'N/A'
                      }
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete administrator <strong>{admin.username}</strong>? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDetail;
