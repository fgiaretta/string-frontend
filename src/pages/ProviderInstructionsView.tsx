import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardHeader,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

const ProviderInstructionsView: React.FC = () => {
  const { businessId, providerId } = useParams<{ businessId: string; providerId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  
  // States
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch provider instructions
  const fetchProviderInstructions = async () => {
    if (!businessId || !providerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = auth.user?.token || localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      console.log('Fetching provider instructions from:', `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`);
      
      const response = await axios.get(
        `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`,
        { headers }
      );
      
      console.log('API Response:', response.data);
      
      setProvider(response.data);
    } catch (err) {
      console.error('Error fetching provider instructions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch provider instructions');
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (businessId && providerId) {
      fetchProviderInstructions();
    }
  }, [businessId, providerId]);

  // Navigate to edit provider instructions
  const navigateToEditInstructions = () => {
    navigate(`/companies/${businessId}/provider-instructions/${providerId}/edit`);
  };

  // Navigate back to provider instructions list
  const navigateBack = () => {
    navigate(`/companies/${businessId}/provider-instructions`);
  };

  if (isLoading && !provider) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/companies');
          }}
        >
          Companies
        </Link>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate(`/companies/${businessId}`);
          }}
        >
          Company Details
        </Link>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate(`/companies/${businessId}/provider-instructions`);
          }}
        >
          Provider Instructions
        </Link>
        <Typography color="text.primary">View Instructions</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={navigateBack}
            sx={{ mr: 2 }}
          >
            Back to List
          </Button>
          <Typography variant="h4" component="h1">
            Provider Instructions
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={navigateToEditInstructions}
        >
          Edit Instructions
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {provider ? (
        <Card>
          <CardHeader
            avatar={
              provider.profileImageUrl ? (
                <Avatar src={provider.profileImageUrl} alt={`${provider.name} ${provider.surname}`} />
              ) : (
                <Avatar>{provider.name.charAt(0)}</Avatar>
              )
            }
            title={`${provider.name} ${provider.surname || ''}`}
            subheader={provider.email}
          />
          <Divider />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Instructions ({provider.instructions?.length || 0})
            </Typography>
            
            {provider.instructions && provider.instructions.length > 0 ? (
              <List>
                {provider.instructions.map((instruction, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText primary={instruction} />
                    </ListItem>
                    {index < provider.instructions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography color="text.secondary">
                  No instructions available for this provider.
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      ) : !isLoading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Provider not found</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ProviderInstructionsView;
