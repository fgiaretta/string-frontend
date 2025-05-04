import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Provider } from '../types';
import providerService from '../services/providerService';
import businessService from '../services/businessService';
import { format } from 'date-fns';

export default function BusinessProviders() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [instructionsDialogOpen, setInstructionsDialogOpen] = useState(false);

  // Fetch business data
  const { 
    data: business,
    isLoading: isLoadingBusiness,
    isError: isErrorBusiness,
    error: errorBusiness
  } = useQuery({
    queryKey: ['company', businessId],
    queryFn: () => businessId ? businessService.getCompany(businessId) : Promise.reject('No business ID provided'),
    enabled: !!businessId
  });

  // Fetch providers data
  const { 
    data: providersData, 
    isLoading: isLoadingProviders, 
    isError: isErrorProviders, 
    error: errorProviders,
    refetch
  } = useQuery({
    queryKey: ['providers', businessId],
    queryFn: () => businessId ? providerService.getProviders(businessId) : Promise.reject('No business ID provided'),
    enabled: !!businessId
  });

  // Update providers state when data is fetched
  useEffect(() => {
    console.log('Providers data received:', providersData);
    if (providersData && Array.isArray(providersData)) {
      console.log('Setting providers from array:', providersData);
      setProviders(providersData);
    } else if (providersData && providersData.providers && Array.isArray(providersData.providers)) {
      console.log('Setting providers from object.providers:', providersData.providers);
      setProviders(providersData.providers);
    } else {
      console.log('No valid providers data found, setting empty array');
      setProviders([]);
    }
  }, [providersData]);

  // Delete provider mutation
  const deleteMutation = useMutation({
    mutationFn: ({ businessId, providerId }: { businessId: string, providerId: string }) => 
      providerService.deleteProvider(businessId, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', businessId] });
      setDeleteDialogOpen(false);
    }
  });

  const handleDeleteClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProvider && businessId) {
      deleteMutation.mutate({ 
        businessId, 
        providerId: selectedProvider.id 
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedProvider(null);
  };

  const handleInstructionsClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setInstructionsDialogOpen(true);
  };

  const handleInstructionsClose = () => {
    setInstructionsDialogOpen(false);
    setSelectedProvider(null);
  };

  const navigateToSchedule = (providerId: string) => {
    if (businessId) {
      navigate(`/companies/${businessId}/providers/${providerId}/schedule`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const isLoading = isLoadingBusiness || isLoadingProviders;
  const isError = isErrorBusiness || isErrorProviders;
  const error = errorBusiness || errorProviders;

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
          <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
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
            onClick={() => navigate(`/companies`)}
          >
            Back to Business
          </Button>
          <Typography variant="h4">
            Providers for {business?.name}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          // onClick={() => navigate(`/companies/${businessId}/providers/new`)}
        >
          Add Provider
        </Button>
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
            {providers && providers.length > 0 ? (
              providers.map((provider) => (
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
                    <Tooltip title="View Schedule">
                      <IconButton 
                        aria-label="schedule"
                        color="primary"
                        onClick={() => navigateToSchedule(provider.id)}
                      >
                        <EventIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Instructions">
                      <IconButton 
                        aria-label="instructions"
                        color="primary"
                        onClick={() => handleInstructionsClick(provider)}
                        disabled={!provider.instructions || provider.instructions.length === 0}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton 
                      aria-label="edit"
                      // onClick={() => navigate(`/companies/${businessId}/providers/${provider.id}`)}
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
                    No providers found for this business
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
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

      {/* Provider Instructions Dialog */}
      <Dialog
        open={instructionsDialogOpen}
        onClose={handleInstructionsClose}
        aria-labelledby="instructions-dialog-title"
        aria-describedby="instructions-dialog-description"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="instructions-dialog-title">
          Instructions for {selectedProvider?.name} {selectedProvider?.surname}
        </DialogTitle>
        <DialogContent>
          {selectedProvider?.instructions && selectedProvider.instructions.length > 0 ? (
            <List>
              {selectedProvider.instructions.map((instruction, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={instruction} />
                  </ListItem>
                  {index < selectedProvider.instructions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <DialogContentText id="instructions-dialog-description">
              No instructions available for this provider.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInstructionsClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
