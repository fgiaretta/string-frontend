import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Provider, Company } from '../types';
import providerService from '../services/providerService';
import businessService from '../services/businessService';
import { format } from 'date-fns';

const DEFAULT_BUSINESS_ID = 'default';

export default function DefaultProviders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch providers data
  const { 
    data: providersData, 
    isLoading: isLoadingProviders, 
    isError: isErrorProviders, 
    error: errorProviders,
    refetch: refetchProviders
  } = useQuery({
    queryKey: ['providers', DEFAULT_BUSINESS_ID],
    queryFn: () => providerService.getProviders(DEFAULT_BUSINESS_ID),
  });

  // Fetch all businesses for the dropdown
  const {
    data: businessesData,
    isLoading: isLoadingBusinesses,
    isError: isErrorBusinesses,
    error: errorBusinesses
  } = useQuery({
    queryKey: ['companies'],
    queryFn: () => businessService.getCompanies(),
  });

  // Delete provider mutation
  const deleteMutation = useMutation({
    mutationFn: (providerId: string) => 
      providerService.deleteProvider(DEFAULT_BUSINESS_ID, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', DEFAULT_BUSINESS_ID] });
      setDeleteDialogOpen(false);
      showSnackbar('Provider deleted successfully', 'success');
    },
    onError: (error) => {
      showSnackbar(`Error deleting provider: ${(error as Error).message}`, 'error');
    }
  });

  // Update provider's business mutation
  const updateBusinessMutation = useMutation({
    mutationFn: ({ providerId, newBusinessId }: { providerId: string, newBusinessId: string }) => 
      providerService.updateProviderBusiness(DEFAULT_BUSINESS_ID, providerId, newBusinessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', DEFAULT_BUSINESS_ID] });
      setAssignDialogOpen(false);
      showSnackbar('Provider assigned to business successfully', 'success');
    },
    onError: (error) => {
      showSnackbar(`Error assigning provider: ${(error as Error).message}`, 'error');
    }
  });

  const handleDeleteClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProvider) {
      deleteMutation.mutate(selectedProvider.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProvider(null);
  };

  const handleAssignClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setSelectedBusinessId('');
    setAssignDialogOpen(true);
  };

  const handleBusinessChange = (event: SelectChangeEvent) => {
    setSelectedBusinessId(event.target.value);
  };

  const handleAssignConfirm = () => {
    if (selectedProvider && selectedBusinessId) {
      updateBusinessMutation.mutate({
        providerId: selectedProvider.id,
        newBusinessId: selectedBusinessId
      });
    }
  };

  const handleAssignCancel = () => {
    setAssignDialogOpen(false);
    setSelectedProvider(null);
    setSelectedBusinessId('');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const isLoading = isLoadingProviders || isLoadingBusinesses;
  const isError = isErrorProviders || isErrorBusinesses;
  const error = errorProviders || errorBusinesses;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/companies')}
          sx={{ mb: 2 }}
        >
          Back to Companies
        </Button>
        <Paper sx={{ p: 3, bgcolor: '#fff4f4' }}>
          <Typography color="error">
            Error: {(error as Error)?.message || 'An unknown error occurred'}
          </Typography>
          <Button variant="contained" onClick={() => refetchProviders()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/companies')}
          >
            Back to Companies
          </Button>
          <Typography variant="h4">
            Unassigned Providers
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="providers table">
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Calendar</TableCell>
              <TableCell>Appointment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providersData?.providers && providersData.providers.length > 0 ? (
              providersData.providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      {provider.profileImageUrl && (
                        <Avatar src={provider.profileImageUrl} alt={provider.name} />
                      )}
                      <Box>
                        <Typography variant="body1">{provider.name} {provider.surname}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {provider.email && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{provider.email}</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {provider.googleCalendarId && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarMonthIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {provider.googleCalendarId === 'primary' ? 'Primary Calendar' : provider.googleCalendarId}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {(provider.appointmentDuration || provider.appointmentInterval) && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {provider.appointmentDuration}min + {provider.appointmentInterval}min
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={provider.state} 
                      color={provider.state === 'active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {provider.createdAt && formatDate(provider.createdAt)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      aria-label="assign"
                      color="primary"
                      onClick={() => handleAssignClick(provider)}
                      title="Assign to Business"
                    >
                      <BusinessIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="edit"
                      // onClick={() => navigate(`/providers/${provider.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
                      onClick={() => handleDeleteClick(provider)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No unassigned providers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the provider "{selectedProvider?.name} {selectedProvider?.surname}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign to Business Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleAssignCancel}
        aria-labelledby="assign-dialog-title"
        aria-describedby="assign-dialog-description"
      >
        <DialogTitle id="assign-dialog-title">
          Assign Provider to Business
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="assign-dialog-description" sx={{ mb: 2 }}>
            Select a business to assign provider "{selectedProvider?.name} {selectedProvider?.surname}".
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="business-select-label">Business</InputLabel>
            <Select
              labelId="business-select-label"
              id="business-select"
              value={selectedBusinessId}
              label="Business"
              onChange={handleBusinessChange}
            >
              {businessesData?.businesses.map((business: Company) => (
                <MenuItem key={business.id} value={business.id}>
                  {business.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignCancel}>Cancel</Button>
          <Button 
            onClick={handleAssignConfirm} 
            color="primary" 
            disabled={!selectedBusinessId || updateBusinessMutation.isPending}
          >
            {updateBusinessMutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
