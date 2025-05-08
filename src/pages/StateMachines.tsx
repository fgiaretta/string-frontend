import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import stateMachineService, { StateMachineConfig } from '../services/stateMachineService';
import PageHeader from '../components/PageHeader';

const StateMachines: React.FC = () => {
  const [configurations, setConfigurations] = useState<StateMachineConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const data = await stateMachineService.getConfigurations();
        setConfigurations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching state machine configurations:', err);
        setError('Failed to load state machine configurations');
        setLoading(false);
      }
    };

    fetchConfigurations();
  }, []);

  const handleCreateNew = () => {
    navigate('/state-machines/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/state-machines/edit/${id}`);
  };

  const handleTest = (id: string) => {
    navigate(`/state-machines/test/${id}`);
  };

  const handleMonitor = () => {
    navigate('/state-machines/monitor');
  };

  const handleCloseError = () => {
    setError(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="State Machines" />
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Available Configurations</Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ mr: 2 }}
          >
            Create New
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleMonitor}
          >
            Monitor Active Conversations
          </Button>
        </Box>
      </Box>

      {configurations.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No state machine configurations found. Create a new one to get started.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {configurations.map((config) => (
            <Grid key={config.id} sx={{ width: { xs: '100%', md: '33.33%' } }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {config.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Initial State: {config.initialState}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    States: {config.states.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transitions: {config.transitions.length}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleEdit(config.id!)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => handleTest(config.id!)}
                  >
                    Test
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StateMachines;
