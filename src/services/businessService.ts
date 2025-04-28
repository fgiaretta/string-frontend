import api from './api';
import { Company, QueryParams, BusinessResponse } from '../types';

export const businessService = {
  // Get all companies
  getCompanies: async (params?: QueryParams): Promise<BusinessResponse> => {
    const response = await api.get('/business', { params });
    return response.data;
  },

  // Get a single company by ID
  getCompany: async (id: string): Promise<Company> => {
    const response = await api.get(`/business/${id}`);
    return response.data;
  },

  // Create a new company
  createCompany: async (data: Omit<Company, 'id'>): Promise<Company> => {
    const response = await api.post('/business', data);
    return response.data;
  },

  // Update an existing company
  updateCompany: async (id: string, data: Partial<Company>): Promise<Company> => {
    const response = await api.put(`/business/${id}`, data);
    return response.data;
  },

  // Delete a company
  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`/business/${id}`);
  }
};

export default businessService;

export default businessService;
