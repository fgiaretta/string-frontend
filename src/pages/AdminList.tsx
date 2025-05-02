import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RevokeIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { PanelAdmin } from '../services/authService';

const AdminList = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const isSuperAdmin = hasPermission('super');

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof PanelAdmin>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<PanelAdmin | null>(null);

  // Fetch admins
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

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: (adminId: string) => adminService.deleteAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setDeleteDialogOpen(false);
    },
  });

  // Approve admin mutation
  const approveMutation = useMutation({
    mutationFn: (adminId: string) => adminService.approveAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });

  // Revoke admin mutation
  const revokeMutation = useMutation({
    mutationFn: (adminId: string) => adminService.revokeAdmin(adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });

  // Handle delete confirmation
  const handleDeleteClick = (admin: PanelAdmin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (adminToDelete) {
      deleteMutation.mutate(adminToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAdminToDelete(null);
  };

  // Handle approve/revoke
  const handleApprove = (adminId: string) => {
    approveMutation.mutate(adminId);
  };

  const handleRevoke = (adminId: string) => {
    revokeMutation.mutate(adminId);
  };

  // Filter and sort admins
  const filteredAdmins = admins
    ? admins.filter((admin) => {
        // Don't show current user in the list
        if (user && admin.id === user.id) return false;

        // Apply search term filter
        const searchMatch =
          searchTerm === '' ||
          admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchTerm.toLowerCase());

        // Apply role filter
        const roleMatch = roleFilter === 'all' || admin.role === roleFilter;

        // Apply status filter
        const statusMatch = statusFilter === 'all' || admin.status === statusFilter;

        // Apply approval filter
        const approvalMatch =
          approvalFilter === 'all' ||
          (approvalFilter === 'approved' && admin.isApproved) ||
          (approvalFilter === 'not-approved' && !admin.isApproved);

        return searchMatch && roleMatch && statusMatch && approvalMatch;
      })
    : [];

  // Sort admins
  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    if (a[sortField] === undefined || b[sortField] === undefined) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // For dates or other values
    if (aValue && bValue) {
      return sortDirection === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    }

    return 0;
  });

  // Handle sort change
  const handleSortChange = (field: keyof PanelAdmin) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
          Error loading admins: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Button variant="contained" color="primary" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Panel Administrators
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admins/new')}
          >
            Add Admin
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="super">Super Admin</MenuItem>
              <MenuItem value="standard">Standard Admin</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Approval</InputLabel>
            <Select
              value={approvalFilter}
              label="Approval"
              onChange={(e) => setApprovalFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="not-approved">Not Approved</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Admin Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSortChange('username')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Username
                {sortField === 'username' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange('email')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Email
                {sortField === 'email' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange('role')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Role
                {sortField === 'role' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange('status')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Status
                {sortField === 'status' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange('isApproved')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Approval
                {sortField === 'isApproved' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableCell>
              <TableCell
                onClick={() => handleSortChange('createdAt')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Created At
                {sortField === 'createdAt' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAdmins.length > 0 ? (
              sortedAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={admin.role === 'super' ? 'Super Admin' : 'Standard Admin'}
                      color={admin.role === 'super' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.status === 'active' ? 'Active' : 'Inactive'}
                      color={admin.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.isApproved ? 'Approved' : 'Not Approved'}
                      color={admin.isApproved ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {admin.createdAt
                      ? format(new Date(admin.createdAt), 'MMM d, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/admins/${admin.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      {isSuperAdmin && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/admins/${admin.id}/edit`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          {admin.isApproved ? (
                            <Tooltip title="Revoke Approval">
                              <IconButton
                                color="warning"
                                onClick={() => handleRevoke(admin.id)}
                                disabled={revokeMutation.isPending}
                              >
                                <RevokeIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                onClick={() => handleApprove(admin.id)}
                                disabled={approveMutation.isPending}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(admin)}
                              disabled={deleteMutation.isPending}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No administrators found matching the filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete administrator{' '}
            <strong>{adminToDelete?.username}</strong>? This action cannot be undone.
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

export default AdminList;
