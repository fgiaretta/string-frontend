import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import stateMachineService, { ConversationSession } from '../services/stateMachineService';
import PageHeader from '../components/PageHeader';

const StateMachineMonitor: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  
  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
  
  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSessions = async () => {
    try {
      const data = await stateMachineService.getActiveConversations();
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching active conversations:', err);
      setError('Failed to load active conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchSessions();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const handleViewDetails = (session: ConversationSession) => {
    setSelectedSession(session);
    setDetailDialogOpen(true);
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await stateMachineService.endConversation(sessionId);
      // Refresh the list after ending a session
      fetchSessions();
    } catch (err) {
      console.error('Error ending conversation:', err);
      setError('Failed to end conversation');
    }
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedSession(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session => 
    session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.stateMachineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.currentState.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate criticality based on state
  const getStateCriticality = (session: ConversationSession): 'low' | 'medium' | 'high' => {
    // This is a placeholder - in a real implementation, you would get this from the state machine config
    // For now, we'll just return a random criticality
    const randomValue = Math.random();
    if (randomValue < 0.33) return 'low';
    if (randomValue < 0.66) return 'medium';
    return 'high';
  };

  // Get color for criticality chip
  const getCriticalityColor = (criticality: 'low' | 'medium' | 'high') => {
    switch (criticality) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  // Format duration
  const formatDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diffMs = now - start;
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
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
      <PageHeader title="Active Conversations Monitor" />
      
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/state-machines')}
        sx={{ mb: 3 }}
      >
        Back to State Machines
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Active Sessions</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {filteredSessions.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No active conversations found.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Session ID</TableCell>
                  <TableCell>State Machine</TableCell>
                  <TableCell>Current State</TableCell>
                  <TableCell>Criticality</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSessions.map((session) => {
                  const criticality = getStateCriticality(session);
                  return (
                    <TableRow key={session.id}>
                      <TableCell>{session.id.substring(0, 8)}...</TableCell>
                      <TableCell>{session.stateMachineId}</TableCell>
                      <TableCell>{session.currentState}</TableCell>
                      <TableCell>
                        <Chip 
                          label={criticality} 
                          color={getCriticalityColor(criticality) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDuration(session.startedAt)}</TableCell>
                      <TableCell>{new Date(session.lastUpdatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(session)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="End Conversation">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleEndSession(session.id)}
                          >
                            <StopIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Session Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedSession && (
          <>
            <DialogTitle>
              Session Details: {selectedSession.id}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Basic Information
                </Typography>
                <Typography variant="body2">
                  <strong>State Machine:</strong> {selectedSession.stateMachineId}
                </Typography>
                <Typography variant="body2">
                  <strong>Current State:</strong> {selectedSession.currentState}
                </Typography>
                <Typography variant="body2">
                  <strong>Started:</strong> {new Date(selectedSession.startedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {new Date(selectedSession.lastUpdatedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {formatDuration(selectedSession.startedAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  State History
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>State</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Transition</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSession.history.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.state}</TableCell>
                          <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{entry.transition || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Context Data
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    backgroundColor: '#f5f5f5', 
                    p: 2, 
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}
                >
                  {JSON.stringify(selectedSession.context, null, 2)}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                color="error" 
                onClick={() => {
                  handleEndSession(selectedSession.id);
                  handleCloseDetailDialog();
                }}
              >
                End Conversation
              </Button>
              <Button onClick={handleCloseDetailDialog}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StateMachineMonitor;
