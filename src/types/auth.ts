import { PanelAdmin, LoginCredentials } from '../services/authService';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: PanelAdmin | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: 'super' | 'standard') => boolean;
}
