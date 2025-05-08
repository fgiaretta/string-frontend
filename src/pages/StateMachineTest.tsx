import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import stateMachineService, { StateMachineConfig, ConversationSession } from '../services/stateMachineService';
import PageHeader from '../components/PageHeader';

const StateMachineTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<StateMachineConfig | null>(null);
  
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [messages, setMessages] = useState<{ text: string; timestamp: string }[]>([]);

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const configData = await stateMachineService.getConfiguration(id!);
        setConfig(configData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching state machine configuration:', err);
        setError('Failed to load state machine configuration');
        setLoading(false);
      }
    };

    fetchConfiguration();
  }, [id]);

  const startNewConversation = async () => {
    setProcessing(true);
    try {
      const newSession = await stateMachineService.startConversation(id!);
      setSession(newSession);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session) return;

    const messageText = message.trim();
    setMessage('');
    setProcessing(true);

    // Add user message to the list
    setMessages(prev => [...prev, { text: messageText, timestamp: new Date().toISOString() }]);

    try {
      const updatedSession = await stateMachineService.processMessage(session.id, messageText);
      setSession(updatedSession);
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Failed to process message');
    } finally {
      setProcessing(false);
    }
  };

  const handleEndConversation = async () => {
    if (!session) return;

    setProcessing(true);
    try {
      await stateMachineService.endConversation(session.id);
      setSession(null);
      setError(null);
    } catch (err) {
      console.error('Error ending conversation:', err);
      setError('Failed to end conversation');
    } finally {
      setProcessing(false);
    }
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

  if (!config) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          State machine configuration not found
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/state-machines')}
          sx={{ mt: 2 }}
        >
          Back to State Machines
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title={`Test State Machine: ${config.name}`} />
      
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/state-machines')}
        sx={{ mb: 3 }}
      >
        Back to State Machines
      </Button>

      <Grid container spacing={3}>
        {/* Left side - Configuration Info */}
        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuration Details
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {config.name}
              </Typography>
              <Typography variant="body2">
                <strong>Initial State:</strong> {config.initialState}
              </Typography>
              <Typography variant="body2">
                <strong>States:</strong> {config.states.length}
              </Typography>
              <Typography variant="body2">
                <strong>Transitions:</strong> {config.transitions.length}
              </Typography>
            </CardContent>
          </Card>

          {session && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Session
                </Typography>
                <Typography variant="body2">
                  <strong>Session ID:</strong> {session.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Current State:</strong> {session.currentState}
                </Typography>
                <Typography variant="body2">
                  <strong>Started:</strong> {new Date(session.startedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {new Date(session.lastUpdatedAt).toLocaleString()}
                </Typography>
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  State History
                </Typography>
                <List dense>
                  {session.history.map((entry, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText
                        primary={entry.state}
                        secondary={new Date(entry.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Context Data
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    backgroundColor: '#f5f5f5', 
                    p: 1, 
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '200px',
                    fontSize: '0.75rem'
                  }}
                >
                  {JSON.stringify(session.context, null, 2)}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right side - Conversation */}
        <Grid sx={{ width: { xs: '100%', md: '66.67%' } }}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Test Conversation</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={startNewConversation}
                  disabled={processing}
                  sx={{ mr: 1 }}
                >
                  {session ? 'Restart' : 'Start'} Conversation
                </Button>
                
                {session && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleEndConversation}
                    disabled={processing}
                  >
                    End Conversation
                  </Button>
                )}
              </Box>
            </Box>

            {!session ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  Click "Start Conversation" to begin testing this state machine
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, minHeight: '300px', maxHeight: '400px' }}>
                  <List>
                    {/* Initial state message */}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label="System" 
                              size="small" 
                              color="primary" 
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body1">
                              Conversation started in state: <strong>{config.initialState}</strong>
                            </Typography>
                          </Box>
                        }
                        secondary={new Date(session.startedAt).toLocaleString()}
                      />
                    </ListItem>
                    <Divider />

                    {/* User messages */}
                    {messages.map((msg, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label="User" 
                                  size="small" 
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="body1">
                                  {msg.text}
                                </Typography>
                              </Box>
                            }
                            secondary={new Date(msg.timestamp).toLocaleString()}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}

                    {/* State transitions */}
                    {session.history.slice(1).map((entry, index) => (
                      <React.Fragment key={`state-${index}`}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label="State Change" 
                                  size="small" 
                                  color="secondary" 
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="body1">
                                  Transitioned to state: <strong>{entry.state}</strong>
                                  {entry.transition && ` (via ${entry.transition})`}
                                </Typography>
                              </Box>
                            }
                            secondary={new Date(entry.timestamp).toLocaleString()}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <TextField
                    fullWidth
                    label="Enter message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={processing}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={processing || !message.trim()}
                    sx={{ ml: 1 }}
                  >
                    Send
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StateMachineTest;
