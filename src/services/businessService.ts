import api from './api';

export interface Business {
  id: string;
  name: string;
  email: string;
  slackChannel: string;
  profileImageUrl?: string;
  whatsappId: string;
  whatsappName: string;
  whatsappDisplayNumber: string;
  timezone: string;
  category: string;
  stateMachineConfigId?: string;
  state: 'active' | 'inactive' | 'deleted';
  createdAt: string;
}

const businessService = {
  // Get all businesses
  getBusinesses: async () => {
    try {
      const response = await api.get('/business');
      // Verificar a estrutura da resposta e retornar o array de businesses
      return Array.isArray(response.data) ? response.data : 
             (response.data && response.data.businesses ? response.data.businesses : []);
    } catch (error) {
      console.error('Error fetching businesses', error);
      throw error;
    }
  },

  // Get companies (alias for getBusinesses for backward compatibility)
  getCompanies: async () => {
    try {
      const response = await api.get('/business');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies', error);
      throw error;
    }
  },

  // Get a specific business
  getBusiness: async (id: string) => {
    try {
      const response = await api.get(`/business/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching business ${id}`, error);
      throw error;
    }
  },

  // Associate a state machine to a business
  associateStateMachine: async (businessId: string, stateMachineConfigId: string) => {
    try {
      const response = await api.post(`/business/${businessId}/state-machine`, {
        stateMachineConfigId
      });
      return response.data;
    } catch (error) {
      console.error(`Error associating state machine to business ${businessId}`, error);
      throw error;
    }
  },

  // Remove state machine association from a business
  removeStateMachineAssociation: async (businessId: string) => {
    try {
      const response = await api.delete(`/business/${businessId}/state-machine`);
      return response.data;
    } catch (error) {
      console.error(`Error removing state machine association from business ${businessId}`, error);
      throw error;
    }
  },

  // Delete a company
  deleteCompany: async (id: string) => {
    try {
      const response = await api.delete(`/business/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting company ${id}`, error);
      throw error;
    }
  },

  // Get company admins
  getCompanyAdmins: async (businessId: string) => {
    try {
      const response = await api.get(`/business/${businessId}/admins`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching admins for business ${businessId}`, error);
      throw error;
    }
  },

  // Add company admin
  addCompanyAdmin: async (businessId: string, adminData: any) => {
    try {
      const response = await api.post(`/business/${businessId}/admins`, adminData);
      return response.data;
    } catch (error) {
      console.error(`Error adding admin to business ${businessId}`, error);
      throw error;
    }
  },

  // Delete company admin
  deleteCompanyAdmin: async (businessId: string, adminId: string) => {
    try {
      const response = await api.delete(`/business/${businessId}/admins/${adminId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting admin ${adminId} from business ${businessId}`, error);
      throw error;
    }
  }
};

export default businessService;
