import api from './api';

export interface State {
  id?: string;
  name: string;
  instructions: string;
  actions: string[];
  criticality: 'low' | 'medium' | 'high';
}

export interface Transition {
  id?: string;
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

// Implementação temporária usando localStorage enquanto o backend não está pronto
const LOCAL_STORAGE_KEY = 'stateMachineConfigurations';

const getLocalConfigurations = (): StateMachineConfig[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveLocalConfigurations = (configs: StateMachineConfig[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configs));
};

const stateMachineService = {
  // Get all available state machine configurations
  getConfigurations: async (): Promise<StateMachineConfig[]> => {
    try {
      const response = await api.get('/state-machine/configurations');
      return response.data;
    } catch (error) {
      console.warn('Falling back to localStorage for configurations', error);
      return getLocalConfigurations();
    }
  },

  // Get a specific state machine configuration
  getConfiguration: async (id: string): Promise<StateMachineConfig> => {
    try {
      const response = await api.get(`/state-machine/configurations/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Falling back to localStorage for configuration ${id}`, error);
      const configs = getLocalConfigurations();
      const config = configs.find(c => c.id === id);
      if (!config) throw new Error('Configuration not found');
      return config;
    }
  },

  // Create a new state machine configuration
  createConfiguration: async (config: StateMachineConfig): Promise<StateMachineConfig> => {
    try {
      // Certifique-se de que não há ID no objeto config para criação
      const { id, ...configWithoutId } = config;
      const response = await api.post('/state-machine/configurations', configWithoutId);
      return response.data;
    } catch (error) {
      console.warn('Falling back to localStorage for creating configuration', error);
      const configs = getLocalConfigurations();
      const newConfig = {
        ...config,
        id: `local-${Date.now()}` // Generate a simple ID with local- prefix
      };
      saveLocalConfigurations([...configs, newConfig]);
      return newConfig;
    }
  },

  // Update an existing state machine configuration
  updateConfiguration: async (id: string, config: StateMachineConfig): Promise<StateMachineConfig> => {
    if (!id || id === 'new' || id === 'undefined') {
      throw new Error('Invalid ID for update operation');
    }
    
    try {
      // Certifique-se de que o ID não está no corpo da requisição
      const { id: configId, ...configWithoutId } = config;
      const response = await api.put(`/state-machine/configurations/${id}`, configWithoutId);
      return response.data;
    } catch (error) {
      console.warn(`Falling back to localStorage for updating configuration ${id}`, error);
      const configs = getLocalConfigurations();
      const index = configs.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Configuration not found');
      
      const updatedConfigs = [...configs];
      updatedConfigs[index] = { ...config, id };
      saveLocalConfigurations(updatedConfigs);
      return updatedConfigs[index];
    }
  },

  // Delete a state machine configuration
  deleteConfiguration: async (id: string): Promise<void> => {
    try {
      await api.delete(`/state-machine/configurations/${id}`);
    } catch (error) {
      console.warn(`Falling back to localStorage for deleting configuration ${id}`, error);
      const configs = getLocalConfigurations();
      const filteredConfigs = configs.filter(c => c.id !== id);
      saveLocalConfigurations(filteredConfigs);
    }
  },

  // Start a new conversation with a state machine
  startConversation: async (stateMachineId: string, initialContext?: Record<string, any>): Promise<ConversationSession> => {
    const response = await api.post('/state-machine/start', { stateMachineId, context: initialContext || {} });
    return response.data;
  },

  // Process a message in a conversation
  processMessage: async (conversationId: string, message: string): Promise<ConversationSession> => {
    const response = await api.post('/state-machine/process', { conversationId, message });
    return response.data;
  },

  // End a conversation
  endConversation: async (conversationId: string): Promise<void> => {
    await api.post('/state-machine/end', { conversationId });
  },

  // Get the current state of a conversation
  getConversationState: async (conversationId: string): Promise<ConversationSession> => {
    const response = await api.get(`/state-machine/state/${conversationId}`);
    return response.data;
  },

  // Get all active conversations
  getActiveConversations: async (): Promise<ConversationSession[]> => {
    try {
      const response = await api.get('/state-machine/active');
      return response.data;
    } catch (error) {
      console.warn('Error fetching active conversations, returning empty array', error);
      return [];
    }
  }
};

export default stateMachineService;
