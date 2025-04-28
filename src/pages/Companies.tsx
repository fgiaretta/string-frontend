import { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { Company } from '../types';
import businessService from '../services/businessService';

export default function Companies() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fetch companies data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: () => businessService.getCompanies(),
  });

  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCompany) {
      try {
        await businessService.deleteCompany(selectedCompany.id);
        refetch(); // Refresh the data after deletion
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCompany(null);
  };

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
        <Typography variant="h4" gutterBottom>
          Companies
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#fff4f4' }}>
          <Typography color="error">
            Error loading companies: {(error as Error).message || 'Unknown error'}
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
        <Typography variant="h4">
          Companies
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          // onClick={() => navigate('/companies/new')}
        >
          Add Company
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="companies table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.map((company) => (
              <TableRow key={company.id}>
                <TableCell component="th" scope="row">
                  {company.name}
                </TableCell>
                <TableCell>{company.description || '-'}</TableCell>
                <TableCell>{company.email || '-'}</TableCell>
                <TableCell>{company.phone || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={company.status} 
                    color={company.status === 'active' ? 'success' : 'default'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    aria-label="edit"
                    // onClick={() => navigate(`/companies/edit/${company.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="delete"
                    onClick={() => handleDeleteClick(company)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the company "{selectedCompany?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
