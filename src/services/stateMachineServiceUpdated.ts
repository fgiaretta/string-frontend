import api from './api';

export interface State {
  name: string;
  instructions: string; // Alterado de "description" para "instructions"
  actions: string[];
  criticality: 'low' | 'medium' | 'high';
}

export interface Transition {
  fromState: string;
  toState: string;
  condition: string;
}

export interface StateMachineConfig {
  id?: string;
  name: string;
  initialState: string;
  states: State[];
  transitions: Transition[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationSession {
  id: string;
  stateMachineId: string;
  currentState: string;
  context: Record<string, any>;
  history: {
    state: string;
    timestamp: string;
    transition?: string;
  }[];
  startedAt: string;
  lastUpdatedAt: string;
}

const stateMachineService = {
  // Get all available state machine configurations
  getConfigurations: async (): Promise<StateMachineConfig[]> => {
    try {
      const response = await api.get('/state-machine-config');
      return response.data;
    } catch (error) {
      console.error('Error fetching state machine configurations', error);
      throw error;
    }
  },

  // Get a specific state machine configuration
  getConfiguration: async (id: string): Promise<StateMachineConfig> => {
    try {
      const response = await api.get(`/state-machine-config/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching state machine configuration ${id}`, error);
      throw error;
    }
  },

  // Create a new state machine configuration
  createConfiguration: async (config: StateMachineConfig): Promise<StateMachineConfig> => {
    try {
      // Certifique-se de que não há ID no objeto config para criação
      const { id, ...configWithoutId } = config;
      const response = await api.post('/state-machine-config', configWithoutId);
      return response.data;
    } catch (error) {
      console.error('Error creating state machine configuration', error);
      throw error;
    }
  },

  // Update an existing state machine configuration
  updateConfiguration: async (id: string, config: StateMachineConfig): Promise<StateMachineConfig> => {
    if (!id) {
      throw new Error('Invalid ID for update operation');
    }
    
    try {
      // Certifique-se de que o ID não está no corpo da requisição
      const { id: configId, ...configWithoutId } = config;
      const response = await api.put(`/state-machine-config/${id}`, configWithoutId);
      return response.data;
    } catch (error) {
      console.error(`Error updating state machine configuration ${id}`, error);
      throw error;
    }
  },

  // Delete a state machine configuration
  deleteConfiguration: async (id: string): Promise<void> => {
    try {
      await api.delete(`/state-machine-config/${id}`);
    } catch (error) {
      console.error(`Error deleting state machine configuration ${id}`, error);
      throw error;
    }
  },

  // Add a state to a state machine configuration
  addState: async (configId: string, state: State): Promise<StateMachineConfig> => {
    try {
      const response = await api.post(`/state-machine-config/${configId}/state`, state);
      return response.data;
    } catch (error) {
      console.error(`Error adding state to configuration ${configId}`, error);
      throw error;
    }
  },

  // Update a specific state in a state machine configuration
  updateState: async (configId: string, stateName: string, state: State): Promise<StateMachineConfig> => {
    try {
      const response = await api.put(`/state-machine-config/${configId}/state/${stateName}`, state);
      return response.data;
    } catch (error) {
      console.error(`Error updating state ${stateName} in configuration ${configId}`, error);
      throw error;
    }
  },

  // Remove a state from a state machine configuration
  removeState: async (configId: string, stateName: string): Promise<StateMachineConfig> => {
    try {
      const response = await api.delete(`/state-machine-config/${configId}/state/${stateName}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing state ${stateName} from configuration ${configId}`, error);
      throw error;
    }
  },

  // Add a transition to a state machine configuration
  addTransition: async (configId: string, transition: Transition): Promise<StateMachineConfig> => {
    try {
      const response = await api.post(`/state-machine-config/${configId}/transition`, transition);
      return response.data;
    } catch (error) {
      console.error(`Error adding transition to configuration ${configId}`, error);
      throw error;
    }
  },

  // Remove a transition from a state machine configuration
  removeTransition: async (configId: string, transition: { fromState: string, toState: string }): Promise<StateMachineConfig> => {
    try {
      const response = await api.delete(`/state-machine-config/${configId}/transition`, { data: transition });
      return response.data;
    } catch (error) {
      console.error(`Error removing transition from configuration ${configId}`, error);
      throw error;
    }
  }
};

export default stateMachineService;
