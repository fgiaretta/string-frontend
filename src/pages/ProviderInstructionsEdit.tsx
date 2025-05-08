import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Alert,
  TextField,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Stack,
  Divider,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

interface Provider {
  id: string;
  name: string;
  surname?: string;
  email?: string;
  profileImageUrl?: string;
  instructions: string[];
  state?: string;
  appointmentDuration?: number;
  appointmentInterval?: number;
  googleCalendarId?: string;
  createdAt?: string;
}

const ProviderInstructionsEdit: React.FC = () => {
  console.log('ProviderInstructionsEdit component rendering');
  
  const { businessId, providerId } = useParams<{ businessId: string; providerId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  
  console.log('Route params:', { businessId, providerId });
  
  // States
  const [provider, setProvider] = useState<Provider | null>(null);
  const [instructionsList, setInstructionsList] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('API URL:', apiUrl);

  // Fetch provider with instructions
  const fetchProvider = async () => {
    if (!businessId || !providerId) {
      console.error('Missing businessId or providerId');
      setError('Missing business ID or provider ID');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token from multiple sources
      const token = authService.getToken() || 
                    auth?.user?.token || 
                    localStorage.getItem('auth_token') ||
                    localStorage.getItem('token');
      
      console.log('Token available:', !!token);
      
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      console.log('Making API request to:', `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`);
      
      // First, try to get the provider details
      let providerData;
      try {
        const providerResponse = await axios.get(
          `${apiUrl}/business/${businessId}/providers/${providerId}`,
          { headers }
        );
        providerData = providerResponse.data;
        console.log('Provider data:', providerData);
      } catch (err) {
        console.warn('Could not fetch provider details, continuing with instructions only');
      }
      
      // Then get the instructions
      const response = await axios.get(
        `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`,
        { headers }
      );
      
      console.log('Instructions response:', response.data);
      
      // Combine provider data with instructions
      const combinedData = {
        ...(providerData || {}),
        instructions: response.data.instructions || []
      };
      
      setProvider(combinedData);
      
      // Initialize instructions list
      if (response.data.instructions && response.data.instructions.length > 0) {
        // Remove duplicates
        const uniqueInstructions = Array.from(new Set(response.data.instructions));
        setInstructionsList(uniqueInstructions);
      } else {
        setInstructionsList(['']);
      }
    } catch (err) {
      console.error('Error fetching provider:', err);
      
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to fetch provider instructions: ${err.message}`);
        }
      } else {
        setError('Failed to fetch provider instructions');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update provider instructions
  const updateProviderInstructions = async () => {
    if (!businessId || !providerId) {
      console.error('Missing businessId or providerId for update');
      setError('Missing business ID or provider ID');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const token = authService.getToken() || 
                    auth?.user?.token || 
                    localStorage.getItem('auth_token') ||
                    localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setIsSaving(false);
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      // Remove duplicates and empty instructions
      const uniqueInstructions = Array.from(new Set(
        instructionsList.filter(instruction => instruction.trim() !== '')
      ));
      
      console.log('Updating instructions for provider:', providerId);
      console.log('Instructions to save:', uniqueInstructions);
      
      await axios({
        method: 'put',
        url: `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`,
        data: { instructions: uniqueInstructions },
        headers: headers
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Instructions updated successfully',
        severity: 'success',
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/companies/${businessId}/providers`);
      }, 1500);
    } catch (err) {
      console.error('Error updating provider instructions:', err);
      
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(`Failed to update instructions: ${err.message}`);
        }
      } else {
        setError('Failed to update provider instructions');
      }
      
      setSnackbar({
        open: true,
        message: 'Failed to update instructions',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Effects
  useEffect(() => {
    console.log('useEffect triggered with:', { businessId, providerId });
    if (businessId && providerId) {
      console.log('Attempting to fetch provider data');
      fetchProvider();
    } else {
      console.error('Missing businessId or providerId in useEffect');
      setIsLoading(false);
    }
  }, [businessId, providerId]);

  // Handlers
  const handleAddInstruction = () => {
    setInstructionsList([...instructionsList, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...instructionsList];
    newInstructions.splice(index, 1);
    setInstructionsList(newInstructions);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructionsList];
    newInstructions[index] = value;
    setInstructionsList(newInstructions);
  };

  const handleSave = () => {
    updateProviderInstructions();
  };

  const handleCancel = () => {
    navigate(`/companies/${businessId}/providers`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Render loading state
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Loading provider instructions...
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error && !provider) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          }
        >
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/companies/${businessId}/providers`)}
        >
          Back to Providers
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/companies/${businessId}/providers`)}
        >
          Back to Providers
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      <Card>
        <CardHeader
          avatar={
            provider?.profileImageUrl ? (
              <Avatar src={provider.profileImageUrl} alt={`${provider?.name || 'Provider'}`} />
            ) : (
              <Avatar>{provider?.name?.charAt(0) || 'P'}</Avatar>
            )
          }
          title={`Edit Instructions for ${provider?.name || 'Provider'} ${provider?.surname || ''}`}
          subheader={provider?.email || 'No email available'}
        />
        <Divider />
        <CardContent>
          <Box>
            {instructionsList.map((instruction, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
                mb={2}
              >
                <TextField
                  fullWidth
                  label={`Instruction ${index + 1}`}
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  multiline
                  minRows={4}
                  maxRows={12}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 'auto',
                      resize: 'vertical',
                      minHeight: '120px'
                    }
                  }}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveInstruction(index)}
                  disabled={instructionsList.length <= 1}
                >
                  <RemoveIcon />
                </IconButton>
              </Stack>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddInstruction}
              variant="outlined"
              sx={{ mt: 1, mb: 3 }}
            >
              Add Instruction
            </Button>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              {instructionsList.filter(i => i.trim() !== '').length > 0 ? (
                instructionsList
                  .filter(i => i.trim() !== '')
                  .map((instruction, index) => (
                    <Typography key={index} paragraph>
                      {index + 1}. {instruction}
                    </Typography>
                  ))
              ) : (
                <Typography color="text.secondary">
                  No instructions added yet.
                </Typography>
              )}
            </Paper>
            
            <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
              <Button 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ProviderInstructionsEdit;
