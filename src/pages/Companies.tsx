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
  Snackbar,
  Alert,
  Tooltip,
  TextField,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GoogleIcon from '@mui/icons-material/Google';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useQuery } from '@tanstack/react-query';
import { Company } from '../types';
import businessService from '../services/businessService';

export default function Companies() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
  const [listAdminsDialogOpen, setListAdminsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyAdmins, setCompanyAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    whatsappId: '',
    whatsappName: '',
    whatsappDisplayNumber: ''
  });

  const { data: companiesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: businessService.getCompanies
  });

  const handleAddClick = () => {
    navigate('/companies/new');
  };

  const handleEditClick = (id: string) => {
    navigate(`/companies/${id}`);
  };

  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCompany(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return;
    
    try {
      await businessService.deleteCompany(selectedCompany.id);
      setSnackbarMessage(`Company ${selectedCompany.name} deleted successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      refetch();
    } catch (error) {
      console.error('Error deleting company:', error);
      setSnackbarMessage(`Failed to delete company: ${(error as Error).message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  const handleCopyGoogleAuthUrl = () => {
    const getEnvPrefix = () => {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      if (apiUrl.includes('api-dev')) return 'api-dev';
      if (apiUrl.includes('api.')) return 'api';
      return 'api-dev'; // Default to dev if not found
    };

    const env = getEnvPrefix();
    const url = `https://${env}.string.tec.br/auth/google/authorize`;
    
    navigator.clipboard.writeText(url)
      .then(() => {
        setSnackbarMessage('Google Auth URL copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        setSnackbarMessage('Failed to copy URL to clipboard');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleListAdminsClick = async (company: Company) => {
    setSelectedCompany(company);
    setLoadingAdmins(true);
    setListAdminsDialogOpen(true);
    
    try {
      const admins = await businessService.getCompanyAdmins(company.id);
      setCompanyAdmins(admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setSnackbarMessage(`Failed to fetch admins: ${(error as Error).message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setCompanyAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleListAdminsClose = () => {
    setListAdminsDialogOpen(false);
    setSelectedCompany(null);
    setCompanyAdmins([]);
  };

  const handleAddAdminClick = (company: Company) => {
    setSelectedCompany(company);
    setAdminData({
      name: '',
      email: '',
      whatsappId: '',
      whatsappName: '',
      whatsappDisplayNumber: ''
    });
    setAddAdminDialogOpen(true);
  };

  const handleAddAdminCancel = () => {
    setAddAdminDialogOpen(false);
    setSelectedCompany(null);
  };

  const handleAddAdminSubmit = async () => {
    if (!selectedCompany) return;
    
    try {
      console.log('Adding admin for company:', selectedCompany.id, selectedCompany.name);
      console.log('Admin data:', adminData);
      
      await businessService.addCompanyAdmin(selectedCompany.id, adminData);
      
      setSnackbarMessage(`Admin added successfully to ${selectedCompany.name}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setAddAdminDialogOpen(false);
    } catch (error) {
      console.error('Error adding admin:', error);
      setSnackbarMessage(`Failed to add admin: ${(error as Error).message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAdminDataChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdminData({
      ...adminData,
      [field]: event.target.value
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading companies: {(error as Error).message}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Companies
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<GoogleIcon />}
            onClick={handleCopyGoogleAuthUrl}
            sx={{ mr: 2 }}
          >
            Copy Google Auth URL
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Company
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>WhatsApp</TableCell>
              <TableCell>Users</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companiesResponse && Array.isArray(companiesResponse.businesses) && companiesResponse.businesses.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon fontSize="small" color="action" />
                    {company.email || '-'}
                  </Box>
                </TableCell>
                <TableCell>
                  {company.whatsappDisplayNumber ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <WhatsAppIcon fontSize="small" color="success" />
                      {company.whatsappDisplayNumber}
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PeopleIcon fontSize="small" color="primary" />
                    {company.userCount || 0}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="List Admins">
                    <IconButton 
                      aria-label="list-admins"
                      onClick={() => handleListAdminsClick(company)}
                      color="primary"
                    >
                      <SupervisorAccountIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add Admin">
                    <IconButton 
                      aria-label="add-admin"
                      onClick={() => handleAddAdminClick(company)}
                      color="primary"
                    >
                      <AdminPanelSettingsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <IconButton 
                      aria-label="view"
                      onClick={() => handleEditClick(company.id)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      aria-label="edit"
                      onClick={() => handleEditClick(company.id)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      aria-label="delete"
                      onClick={() => handleDeleteClick(company)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {companiesResponse && (!Array.isArray(companiesResponse.businesses) || companiesResponse.businesses.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" py={2}>
                    No companies found
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
      >
        <DialogTitle id="delete-dialog-title">
          Delete Company
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedCompany?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* List Admins Dialog */}
      <Dialog
        open={listAdminsDialogOpen}
        onClose={handleListAdminsClose}
        aria-labelledby="list-admins-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="list-admins-dialog-title">
          Admins for {selectedCompany?.name}
        </DialogTitle>
        <DialogContent>
          {loadingAdmins ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : companyAdmins.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>WhatsApp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companyAdmins.map((admin, index) => (
                    <TableRow key={index}>
                      <TableCell>{admin.name || '-'}</TableCell>
                      <TableCell>{admin.email || '-'}</TableCell>
                      <TableCell>
                        {admin.whatsappDisplayNumber ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <WhatsAppIcon fontSize="small" color="success" />
                            {admin.whatsappDisplayNumber}
                          </Box>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box p={3} textAlign="center">
              <Typography variant="body1">No admins found for this company.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleListAdminsClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog
        open={addAdminDialogOpen}
        onClose={handleAddAdminCancel}
        aria-labelledby="add-admin-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="add-admin-dialog-title">
          Add Admin to {selectedCompany?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={adminData.name}
                onChange={handleAdminDataChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={adminData.email}
                onChange={handleAdminDataChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="WhatsApp ID"
                fullWidth
                value={adminData.whatsappId}
                onChange={handleAdminDataChange('whatsappId')}
                required
                helperText="Format: country code + number (e.g., 5555996490737)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="WhatsApp Name"
                fullWidth
                value={adminData.whatsappName}
                onChange={handleAdminDataChange('whatsappName')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="WhatsApp Display Number"
                fullWidth
                value={adminData.whatsappDisplayNumber}
                onChange={handleAdminDataChange('whatsappDisplayNumber')}
                required
                helperText="Format: country code + number without '+' (e.g., 55996490737)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddAdminCancel}>Cancel</Button>
          <Button 
            onClick={handleAddAdminSubmit} 
            color="primary" 
            variant="contained"
            disabled={!adminData.name || !adminData.email || !adminData.whatsappId || !adminData.whatsappName || !adminData.whatsappDisplayNumber}
          >
            Add Admin
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
