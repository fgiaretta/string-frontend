import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: PanelAdmin;
}

export interface PanelAdmin {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'super' | 'standard';
  status: 'active' | 'inactive';
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/panel-admin/auth', credentials);
      return response.data;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: (): PanelAdmin | null => {
    const adminUser = localStorage.getItem('admin_user');
    return adminUser ? JSON.parse(adminUser) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  setAuthData: (token: string, admin: PanelAdmin): void => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('admin_user', JSON.stringify(admin));
  },

  hasPermission: (requiredRole: 'super' | 'standard'): boolean => {
    const admin = authService.getCurrentUser();
    if (!admin) return false;
    
    // Super admins have all permissions
    if (admin.role === 'super') return true;
    
    // Standard admins can only access if the required role is also standard
    return admin.role === requiredRole;
  },
};

export default authService;
