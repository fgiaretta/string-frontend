import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import businessService, { Business } from '../services/businessService';
import stateMachineService, { StateMachineConfig } from '../services/stateMachineServiceUpdated';
import PageHeader from '../components/PageHeader';

const BusinessStateMachineAssociation: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stateMachines, setStateMachines] = useState<StateMachineConfig[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [selectedStateMachineId, setSelectedStateMachineId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [associating, setAssociating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // Removido o mecanismo de retry automático que estava causando recarregamentos frequentes
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados separadamente para melhor tratamento de erros
      try {
        const businessesData = await businessService.getBusinesses();
        console.log('Businesses data:', businessesData);
        setBusinesses(Array.isArray(businessesData) ? businessesData : []);
      } catch (businessErr) {
        console.error('Error fetching businesses:', businessErr);
        setError('Failed to load businesses. Please try again.');
        setBusinesses([]);
      }
      
      try {
        const stateMachinesData = await stateMachineService.getConfigurations();
        console.log('State machines data:', stateMachinesData);
        setStateMachines(Array.isArray(stateMachinesData) ? stateMachinesData : []);
      } catch (stateMachineErr) {
        console.error('Error fetching state machines:', stateMachineErr);
        setError((prev) => prev ? `${prev} Also failed to load state machines.` : 'Failed to load state machines. Please try again.');
        setStateMachines([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  const handleAssociate = async () => {
    if (!selectedBusinessId || !selectedStateMachineId) {
      setError('Please select both a business and a state machine');
      return;
    }

    try {
      setAssociating(true);
      await businessService.associateStateMachine(selectedBusinessId, selectedStateMachineId);
      
      // Update the local state to reflect the change
      setBusinesses(businesses.map(business => 
        business.id === selectedBusinessId 
          ? { ...business, stateMachineConfigId: selectedStateMachineId } 
          : business
      ));
      
      setSuccess('State machine associated successfully');
      setSelectedBusinessId('');
      setSelectedStateMachineId('');
    } catch (err) {
      console.error('Error associating state machine:', err);
      setError('Failed to associate state machine');
    } finally {
      setAssociating(false);
    }
  };

  const handleRemoveAssociation = async (businessId: string) => {
    try {
      await businessService.removeStateMachineAssociation(businessId);
      
      // Update the local state to reflect the change
      setBusinesses(businesses.map(business => 
        business.id === businessId 
          ? { ...business, stateMachineConfigId: undefined } 
          : business
      ));
      
      setSuccess('State machine association removed successfully');
    } catch (err) {
      console.error('Error removing state machine association:', err);
      setError('Failed to remove state machine association');
    }
  };

  const getStateMachineName = (stateMachineId?: string) => {
    if (!stateMachineId) return 'None';
    const stateMachine = stateMachines.find(sm => sm.id === stateMachineId);
    return stateMachine ? stateMachine.name : 'Unknown';
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };
  
  const handleRefresh = () => {
    setError(null);
    fetchData();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Associate State Machines to Businesses" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="Associate State Machines to Businesses" />
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Create Association</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="business-select-label">Business</InputLabel>
            <Select
              labelId="business-select-label"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value as string)}
              label="Business"
            >
              <MenuItem value="">
                <em>Select a business</em>
              </MenuItem>
              {businesses.map((business) => (
                <MenuItem key={business.id} value={business.id}>
                  {business.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel id="state-machine-select-label">State Machine</InputLabel>
            <Select
              labelId="state-machine-select-label"
              value={selectedStateMachineId}
              onChange={(e) => setSelectedStateMachineId(e.target.value as string)}
              label="State Machine"
            >
              <MenuItem value="">
                <em>Select a state machine</em>
              </MenuItem>
              {stateMachines.map((stateMachine) => (
                <MenuItem key={stateMachine.id} value={stateMachine.id}>
                  {stateMachine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssociate}
            disabled={associating || !selectedBusinessId || !selectedStateMachineId}
            sx={{ height: { md: '56px' }, minWidth: { md: '200px' } }}
          >
            {associating ? <CircularProgress size={24} /> : 'Associate'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRefresh} 
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Current Associations</Typography>
        
        {businesses.length === 0 && !loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No businesses found
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleRefresh} 
              sx={{ mt: 2 }}
            >
              Refresh Data
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Business Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Associated State Machine</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {businesses.length === 0 && loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} sx={{ my: 1 }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>{business.name}</TableCell>
                      <TableCell>{business.email}</TableCell>
                      <TableCell>{business.category}</TableCell>
                      <TableCell>
                        <Chip 
                          label={business.state} 
                          color={
                            business.state === 'active' ? 'success' : 
                            business.state === 'inactive' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {business.stateMachineConfigId ? (
                          getStateMachineName(business.stateMachineConfigId)
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No state machine associated
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {business.stateMachineConfigId ? (
                          <IconButton 
                            color="error" 
                            onClick={() => handleRemoveAssociation(business.id)}
                            title="Remove association"
                          >
                            <DeleteIcon />
                          </IconButton>
                        ) : (
                          <IconButton 
                            color="primary" 
                            onClick={() => {
                              setSelectedBusinessId(business.id);
                              setSelectedStateMachineId('');
                            }}
                            title="Create association"
                          >
                            <LinkIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
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

export default BusinessStateMachineAssociation;
