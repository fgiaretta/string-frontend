import api from './api';
import { Company, QueryParams, BusinessResponse, BusinessDetail } from '../types';

// Get the environment part of the URL
const getEnvPrefix = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.includes('api-dev')) return 'api-dev';
  if (apiUrl.includes('api.')) return 'api';
  return 'api-dev'; // Default to dev if not found
};

export const businessService = {
  // Get all companies
  getCompanies: async (params?: QueryParams): Promise<BusinessResponse> => {
    const response = await api.get('/business', { params });
    return response.data;
  },

  // Get a single company by ID
  getCompany: async (id: string): Promise<BusinessDetail> => {
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
  updateCompany: async (id: string, data: Partial<BusinessDetail>): Promise<BusinessDetail> => {
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

  // Delete a company
  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`/business/${id}`);
  }
};

export default businessService;

export default businessService;