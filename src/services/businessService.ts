import api from './api';
import { Company, QueryParams, BusinessResponse } from '../types';

// Get the environment part of the URL
const getEnvPrefix = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.includes('api-dev')) return 'api-dev';
  if (apiUrl.includes('api.')) return 'api';
  return 'api-dev'; // Default to dev if not found
};

interface DeleteContextsResponse {
  message: string;
  count: number;
}

export const businessService = {
  // Get all companies
  getCompanies: async (params?: QueryParams): Promise<BusinessResponse> => {
    const response = await api.get('/business', { params });
    return response.data;
  },

  // Get a single company by ID
  getCompany: async (id: string): Promise<Company> => {
    const env = getEnvPrefix();
    // Use a direct fetch to the specific URL format
    const response = await fetch(`https://${env}.string.tec.br/business/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch business: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new company
  createCompany: async (data: Omit<Company, 'id'>): Promise<Company> => {
    const response = await api.post('/business', data);
    return response.data;
  },

  // Update an existing company
  updateCompany: async (id: string, data: Partial<Company>): Promise<Company> => {
    const env = getEnvPrefix();
    const response = await fetch(`https://${env}.string.tec.br/business/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update business: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Add an admin to a company
  addCompanyAdmin: async (businessId: string, adminData: {
    name: string;
    email: string;
    whatsappId: string;
    whatsappName: string;
    whatsappDisplayNumber: string;
  }): Promise<void> => {
    try {
      // Use the api instance which already has the token handling
      await api.post(`/business/${businessId}/admin`, adminData);
      
      console.log('Admin added successfully');
    } catch (error) {
      console.error('Error in addCompanyAdmin:', error);
      throw error;
    }
  },

  // Delete a company
  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`/business/${id}`);
  },

  // Delete all contexts for a business
  deleteAllContexts: async (businessId: string): Promise<DeleteContextsResponse> => {
    const env = getEnvPrefix();
    const response = await fetch(`https://${env}.string.tec.br/business/${businessId}/contexts`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete contexts: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get all admins of a company
  getCompanyAdmins: async (businessId: string): Promise<any> => {
    try {
      const response = await api.get(`/business/${businessId}/admin`);
      return response.data;
    } catch (error) {
      console.error('Error in getCompanyAdmins:', error);
      throw error;
    }
  },
  
  // Delete an admin from a company
  deleteCompanyAdmin: async (businessId: string, adminId: string): Promise<any> => {
    try {
      const response = await api.delete(`/business/${businessId}/admin/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteCompanyAdmin:', error);
      throw error;
    }
  },
};

export default businessService;
