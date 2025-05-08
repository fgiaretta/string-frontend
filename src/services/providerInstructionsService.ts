import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

interface ProviderInstructionsPayload {
  providerId: string;
  instructions: string[];
}

export const providerInstructionsService = {
  getAll: async (businessId: string, headers: any) => {
    try {
      const response = await axios.get(
        `${apiUrl}/business/${businessId}/provider-instructions`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching provider instructions:', error);
      throw error;
    }
  },

  getByProviderId: async (businessId: string, providerId: string, headers: any) => {
    try {
      const response = await axios.get(
        `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching provider instructions:', error);
      throw error;
    }
  },

  create: async (businessId: string, payload: ProviderInstructionsPayload, headers: any) => {
    try {
      const response = await axios.post(
        `${apiUrl}/business/${businessId}/provider-instructions`,
        payload,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating provider instructions:', error);
      throw error;
    }
  },

  update: async (businessId: string, providerId: string, payload: ProviderInstructionsPayload, headers: any) => {
    try {
      const response = await axios.put(
        `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`,
        payload,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating provider instructions:', error);
      throw error;
    }
  },

  delete: async (businessId: string, providerId: string, headers: any) => {
    try {
      const response = await axios.delete(
        `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting provider instructions:', error);
      throw error;
    }
  }
};

export default providerInstructionsService;
