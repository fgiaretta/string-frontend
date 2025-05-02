import api from './api';
import { PanelAdmin } from './authService';

interface CreateAdminData {
  username: string;
  email: string;
  password: string;
  role: 'super' | 'standard';
}

interface UpdateAdminData {
  username?: string;
  email?: string;
  password?: string;
  role?: 'super' | 'standard';
  status?: 'active' | 'inactive';
}

const adminService = {
  // Get all panel admins
  getAllAdmins: async (): Promise<PanelAdmin[]> => {
    try {
      const response = await api.get('/panel-admin');
      return response.data;
    } catch (error) {
      console.error('Error in getAllAdmins:', error);
      throw error;
    }
  },

  // Get a specific panel admin
  getAdmin: async (adminId: string): Promise<PanelAdmin> => {
    try {
      const response = await api.get(`/panel-admin/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getAdmin:', error);
      throw error;
    }
  },

  // Create a new panel admin
  createAdmin: async (adminData: CreateAdminData): Promise<PanelAdmin> => {
    try {
      const response = await api.post('/panel-admin', adminData);
      return response.data;
    } catch (error) {
      console.error('Error in createAdmin:', error);
      throw error;
    }
  },

  // Update a panel admin
  updateAdmin: async (adminId: string, adminData: UpdateAdminData): Promise<PanelAdmin> => {
    try {
      const response = await api.put(`/panel-admin/${adminId}`, adminData);
      return response.data;
    } catch (error) {
      console.error('Error in updateAdmin:', error);
      throw error;
    }
  },

  // Delete a panel admin
  deleteAdmin: async (adminId: string): Promise<void> => {
    try {
      await api.delete(`/panel-admin/${adminId}`);
    } catch (error) {
      console.error('Error in deleteAdmin:', error);
      throw error;
    }
  },

  // Approve a panel admin
  approveAdmin: async (adminId: string): Promise<PanelAdmin> => {
    try {
      const response = await api.post(`/panel-admin/${adminId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error in approveAdmin:', error);
      throw error;
    }
  },

  // Revoke a panel admin's approval
  revokeAdmin: async (adminId: string): Promise<PanelAdmin> => {
    try {
      const response = await api.post(`/panel-admin/${adminId}/revoke`);
      return response.data;
    } catch (error) {
      console.error('Error in revokeAdmin:', error);
      throw error;
    }
  },
};

export default adminService;
