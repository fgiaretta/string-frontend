import { useState } from 'react';
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
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Provider } from '../types';
import providerService from '../services/providerService';
import businessService from '../services/businessService';

export default function BusinessProviders() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

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
            onClick={() => navigate(`/companies/${businessId}`)}
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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Specialty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providersData?.providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell component="th" scope="row">
                  {provider.name}
                </TableCell>
                <TableCell>
                  {provider.email ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      {provider.email}
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {provider.phone ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="primary" />
                      {provider.phone}
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell>{provider.specialty || '-'}</TableCell>
                <TableCell>
                  {provider.status && (
                    <Chip 
                      label={provider.status} 
                      color={provider.status === 'active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  )}
                </TableCell>
                <TableCell align="right">
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
            ))}
            {(!providersData?.providers || providersData.providers.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
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
            Are you sure you want to delete the provider "{selectedProvider?.name}"? 
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
    </Box>
  );
}
