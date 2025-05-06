import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import stateMachineService, { StateMachineConfig, State, Transition } from '../services/stateMachineServiceUpdated';
import PageHeader from '../components/PageHeader';

interface StateFormData {
  name: string;
  instructions: string; // Alterado de "description" para "instructions"
  actions: string[];
  criticality: 'low' | 'medium' | 'high';
}

interface TransitionFormData {
  fromState: string;
  toState: string;
  condition: string;
}

const StateMachineForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [initialState, setInitialState] = useState('');
  const [states, setStates] = useState<State[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);

  // State dialog
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [currentState, setCurrentState] = useState<StateFormData>({
    name: '',
    instructions: '', // Alterado de "description" para "instructions"
    actions: [],
    criticality: 'low'
  });
  const [editingStateIndex, setEditingStateIndex] = useState<number | null>(null);
  const [newAction, setNewAction] = useState('');

  // Transition dialog
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [currentTransition, setCurrentTransition] = useState<TransitionFormData>({
    fromState: '',
    toState: '',
    condition: ''
  });
  const [editingTransitionIndex, setEditingTransitionIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchConfiguration = async () => {
        try {
          const config = await stateMachineService.getConfiguration(id);
          setName(config.name);
          setInitialState(config.initialState);
          setStates(config.states);
          setTransitions(config.transitions);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching state machine configuration:', err);
          setError('Failed to load state machine configuration');
          setLoading(false);
        }
      };

      fetchConfiguration();
    }
  }, [id, isEditMode]);

  const handleSave = async () => {
    if (!name) {
      setError('Name is required');
      return;
    }

    if (!initialState) {
      setError('Initial state is required');
      return;
    }

    if (states.length === 0) {
      setError('At least one state is required');
      return;
    }

    // Check if initial state exists in states
    if (!states.some(state => state.name === initialState)) {
      setError('Initial state must be one of the defined states');
      return;
    }

    const config: StateMachineConfig = {
      name,
      initialState,
      states,
      transitions
    };

    setSaving(true);
    try {
      if (isEditMode && id) {
        // Modo de edição: usar updateConfiguration com ID válido
        await stateMachineService.updateConfiguration(id, config);
        setSuccess('State machine configuration updated successfully');
      } else {
        // Modo de criação: usar createConfiguration
        const newConfig = await stateMachineService.createConfiguration(config);
        setSuccess('State machine configuration created successfully');
        // Navigate to edit mode with the new ID
        setTimeout(() => {
          navigate(`/state-machines/edit/${newConfig.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving state machine configuration:', err);
      setError('Failed to save state machine configuration');
    } finally {
      setSaving(false);
    }
  };

  // State management
  const openAddStateDialog = () => {
    setCurrentState({
      name: '',
      instructions: '', // Alterado de "description" para "instructions"
      actions: [],
      criticality: 'low'
    });
    setEditingStateIndex(null);
    setStateDialogOpen(true);
  };

  const openEditStateDialog = (index: number) => {
    setCurrentState({ ...states[index] });
    setEditingStateIndex(index);
    setStateDialogOpen(true);
  };

  const handleStateDialogClose = () => {
    setStateDialogOpen(false);
    setNewAction('');
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setCurrentState({
        ...currentState,
        actions: [...currentState.actions, newAction.trim()]
      });
      setNewAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setCurrentState({
      ...currentState,
      actions: currentState.actions.filter((_, i) => i !== index)
    });
  };

  const handleSaveState = () => {
    if (!currentState.name) {
      setError('State name is required');
      return;
    }

    // Check for duplicate state names
    const isDuplicate = states.some(
      (state, index) => 
        state.name === currentState.name && 
        (editingStateIndex === null || index !== editingStateIndex)
    );

    if (isDuplicate) {
      setError('State name must be unique');
      return;
    }

    const newStates = [...states];
    
    if (editingStateIndex !== null) {
      newStates[editingStateIndex] = currentState;
    } else {
      newStates.push(currentState);
    }
    
    setStates(newStates);
    handleStateDialogClose();
  };

  const handleDeleteState = async (index: number) => {
    const stateToDelete = states[index];
    
    // Check if this state is used in any transitions
    const isUsedInTransitions = transitions.some(
      t => t.fromState === stateToDelete.name || t.toState === stateToDelete.name
    );
    
    if (isUsedInTransitions) {
      setError('Cannot delete state that is used in transitions');
      return;
    }
    
    // Check if this is the initial state
    if (stateToDelete.name === initialState) {
      setError('Cannot delete the initial state');
      return;
    }
    
    if (isEditMode && id) {
      try {
        // Use the API to remove the state if in edit mode
        await stateMachineService.removeState(id, stateToDelete.name);
        setStates(states.filter((_, i) => i !== index));
      } catch (err) {
        console.error('Error removing state:', err);
        setError('Failed to remove state');
      }
    } else {
      // Just update the local state if not in edit mode
      setStates(states.filter((_, i) => i !== index));
    }
  };

  // Transition management
  const openAddTransitionDialog = () => {
    setCurrentTransition({
      fromState: states.length > 0 ? states[0].name : '',
      toState: states.length > 0 ? states[0].name : '',
      condition: ''
    });
    setEditingTransitionIndex(null);
    setTransitionDialogOpen(true);
  };

  const openEditTransitionDialog = (index: number) => {
    setCurrentTransition({ ...transitions[index] });
    setEditingTransitionIndex(index);
    setTransitionDialogOpen(true);
  };

  const handleTransitionDialogClose = () => {
    setTransitionDialogOpen(false);
  };

  const handleSaveTransition = async () => {
    if (!currentTransition.fromState || !currentTransition.toState || !currentTransition.condition) {
      setError('All transition fields are required');
      return;
    }

    // Check for duplicate transitions
    const isDuplicate = transitions.some(
      (transition, index) => 
        transition.fromState === currentTransition.fromState && 
        transition.toState === currentTransition.toState && 
        transition.condition === currentTransition.condition &&
        (editingTransitionIndex === null || index !== editingTransitionIndex)
    );

    if (isDuplicate) {
      setError('Duplicate transition');
      return;
    }

    if (isEditMode && id && editingTransitionIndex === null) {
      try {
        // Use the API to add the transition if in edit mode and adding new transition
        await stateMachineService.addTransition(id, currentTransition);
        const newTransitions = [...transitions, currentTransition];
        setTransitions(newTransitions);
      } catch (err) {
        console.error('Error adding transition:', err);
        setError('Failed to add transition');
      }
    } else {
      const newTransitions = [...transitions];
      
      if (editingTransitionIndex !== null) {
        newTransitions[editingTransitionIndex] = currentTransition;
      } else {
        newTransitions.push(currentTransition);
      }
      
      setTransitions(newTransitions);
    }
    
    handleTransitionDialogClose();
  };

  const handleDeleteTransition = async (index: number) => {
    const transitionToDelete = transitions[index];
    
    if (isEditMode && id) {
      try {
        // Use the API to remove the transition if in edit mode
        await stateMachineService.removeTransition(id, {
          fromState: transitionToDelete.fromState,
          toState: transitionToDelete.toState
        });
        setTransitions(transitions.filter((_, i) => i !== index));
      } catch (err) {
        console.error('Error removing transition:', err);
        setError('Failed to remove transition');
      }
    } else {
      // Just update the local state if not in edit mode
      setTransitions(transitions.filter((_, i) => i !== index));
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
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
      <PageHeader title={isEditMode ? "Edit State Machine" : "Create State Machine"} />
      
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/state-machines')}
        sx={{ mb: 3 }}
      >
        Back to State Machines
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
        
        <Grid container spacing={3}>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="initial-state-label">Initial State</InputLabel>
              <Select
                labelId="initial-state-label"
                value={initialState}
                onChange={(e) => setInitialState(e.target.value)}
                label="Initial State"
                required
              >
                {states.map((state, index) => (
                  <MenuItem key={index} value={state.name}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* States Section */}
        <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">States</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={openAddStateDialog}
                variant="outlined"
                size="small"
              >
                Add State
              </Button>
            </Box>
            
            <List>
              {states.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No states defined yet. Add a state to get started.
                </Typography>
              ) : (
                states.map((state, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {state.name}
                            {state.name === initialState && (
                              <Chip 
                                label="Initial" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2">{state.instructions}</Typography>
                            <Typography variant="body2">
                              Criticality: {state.criticality}
                            </Typography>
                            <Typography variant="body2">
                              Actions: {state.actions.join(', ') || 'None'}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => openEditStateDialog(index)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteState(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < states.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Transitions Section */}
        <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Transitions</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={openAddTransitionDialog}
                variant="outlined"
                size="small"
                disabled={states.length < 2}
              >
                Add Transition
              </Button>
            </Box>
            
            <List>
              {transitions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transitions defined yet. Add a transition to connect states.
                </Typography>
              ) : (
                transitions.map((transition, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={`${transition.fromState} → ${transition.toState}`}
                        secondary={`Condition: ${transition.condition}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => openEditTransitionDialog(index)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteTransition(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < transitions.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Configuration'}
        </Button>
      </Box>

      {/* State Dialog */}
      <Dialog open={stateDialogOpen} onClose={handleStateDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingStateIndex !== null ? 'Edit State' : 'Add State'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={currentState.name}
            onChange={(e) => setCurrentState({ ...currentState, name: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            label="Instructions"
            fullWidth
            value={currentState.instructions}
            onChange={(e) => setCurrentState({ ...currentState, instructions: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            helperText="Detailed instructions about how the chatbot should behave in this state"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="criticality-label">Criticality</InputLabel>
            <Select
              labelId="criticality-label"
              value={currentState.criticality}
              onChange={(e) => setCurrentState({ 
                ...currentState, 
                criticality: e.target.value as 'low' | 'medium' | 'high' 
              })}
              label="Criticality"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Actions</Typography>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                label="New Action"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                fullWidth
              />
              <Button 
                onClick={handleAddAction}
                variant="contained"
                sx={{ ml: 1 }}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {currentState.actions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No actions defined for this state.
                </Typography>
              ) : (
                currentState.actions.map((action, index) => (
                  <Chip
                    key={index}
                    label={action}
                    onDelete={() => handleRemoveAction(index)}
                    sx={{ m: 0.5 }}
                  />
                ))
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStateDialogClose}>Cancel</Button>
          <Button onClick={handleSaveState} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transition Dialog */}
      <Dialog open={transitionDialogOpen} onClose={handleTransitionDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTransitionIndex !== null ? 'Edit Transition' : 'Add Transition'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="from-state-label">From State</InputLabel>
            <Select
              labelId="from-state-label"
              value={currentTransition.fromState}
              onChange={(e) => setCurrentTransition({ ...currentTransition, fromState: e.target.value })}
              label="From State"
              required
            >
              {states.map((state, index) => (
                <MenuItem key={index} value={state.name}>
                  {state.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="to-state-label">To State</InputLabel>
            <Select
              labelId="to-state-label"
              value={currentTransition.toState}
              onChange={(e) => setCurrentTransition({ ...currentTransition, toState: e.target.value })}
              label="To State"
              required
            >
              {states.map((state, index) => (
                <MenuItem key={index} value={state.name}>
                  {state.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Condition"
            fullWidth
            value={currentTransition.condition}
            onChange={(e) => setCurrentTransition({ ...currentTransition, condition: e.target.value })}
            margin="normal"
            required
            helperText="Condition that triggers this transition"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransitionDialogClose}>Cancel</Button>
          <Button onClick={handleSaveTransition} variant="contained" color="primary">
            Save
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

export default StateMachineForm;
