import api from './api';
import { Company, PaginatedResponse, QueryParams } from '../types';

export const businessService = {
  // Get all companies
  getCompanies: async (params?: QueryParams): Promise<PaginatedResponse<Company>> => {
    const response = await api.get('/business', { params });
    return response.data;
  },

  // Get a single company by ID
  getCompany: async (id: string | number): Promise<Company> => {
    const response = await api.get(`/business/${id}`);
    return response.data;
  },

  // Create a new company
  createCompany: async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> => {
    const response = await api.post('/business', data);
    return response.data;
  },

  // Update an existing company
  updateCompany: async (id: string | number, data: Partial<Company>): Promise<Company> => {
    const response = await api.put(`/business/${id}`, data);
    return response.data;
  },

  // Delete a company
  deleteCompany: async (id: string | number): Promise<void> => {
    await api.delete(`/business/${id}`);
  }
};

export default businessService;
