import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import stateMachineService, { StateMachineConfig } from '../services/stateMachineServiceUpdated';
import businessService, { Business } from '../services/businessService';
import PageHeader from '../components/PageHeader';

const StateMachines: React.FC = () => {
  const navigate = useNavigate();
  const [stateMachines, setStateMachines] = useState<StateMachineConfig[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stateMachineToDelete, setStateMachineToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stateMachinesData, businessesData] = await Promise.all([
        stateMachineService.getConfigurations(),
        businessService.getBusinesses()
      ]);
      setStateMachines(stateMachinesData);
      setBusinesses(businessesData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/state-machines/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/state-machines/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/state-machines/view/${id}`);
  };

  const handleAssociate = () => {
    navigate('/state-machines/associate');
  };

  const handleDeleteConfirmation = (id: string) => {
    // Check if this state machine is associated with any business
    const associatedBusinesses = businesses.filter(b => b.stateMachineConfigId === id);
    
    if (associatedBusinesses.length > 0) {
      setError(`Cannot delete: This state machine is associated with ${associatedBusinesses.length} business(es). Remove the associations first.`);
      return;
    }
    
    setStateMachineToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStateMachineToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!stateMachineToDelete) return;
    
    setDeleting(true);
    try {
      await stateMachineService.deleteConfiguration(stateMachineToDelete);
      setStateMachines(stateMachines.filter(sm => sm.id !== stateMachineToDelete));
      setSuccess('State machine deleted successfully');
    } catch (err) {
      console.error('Error deleting state machine:', err);
      setError('Failed to delete state machine');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setStateMachineToDelete(null);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  const getAssociatedBusinesses = (stateMachineId: string) => {
    return businesses.filter(business => business.stateMachineConfigId === stateMachineId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="State Machines" />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LinkIcon />}
          onClick={handleAssociate}
          sx={{ mr: 2 }}
        >
          Associate to Business
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New State Machine
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : stateMachines.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No state machines found. Create your first one!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Initial State</TableCell>
                <TableCell>States</TableCell>
                <TableCell>Transitions</TableCell>
                <TableCell>Associated Businesses</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stateMachines.map((stateMachine) => (
                <TableRow key={stateMachine.id}>
                  <TableCell>{stateMachine.name}</TableCell>
                  <TableCell>{stateMachine.initialState}</TableCell>
                  <TableCell>{stateMachine.states.length}</TableCell>
                  <TableCell>{stateMachine.transitions.length}</TableCell>
                  <TableCell>
                    {(() => {
                      const associatedBusinesses = getAssociatedBusinesses(stateMachine.id!);
                      if (associatedBusinesses.length === 0) {
                        return <Typography variant="body2" color="text.secondary">None</Typography>;
                      }
                      return (
                        <Box>
                          {associatedBusinesses.map((business, idx) => (
                            <Chip 
                              key={business.id}
                              label={business.name}
                              size="small"
                              color="primary"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell>{formatDate(stateMachine.createdAt)}</TableCell>
                  <TableCell>{formatDate(stateMachine.updatedAt)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton onClick={() => handleView(stateMachine.id!)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(stateMachine.id!)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteConfirmation(stateMachine.id!)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this state machine? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StateMachines;
