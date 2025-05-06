import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';

import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/ItemList';
import Settings from './pages/Settings';
import Companies from './pages/Companies';
import AddCompany from './pages/AddCompany';
import CompanyDetail from './pages/CompanyDetail';
import BusinessProviders from './pages/BusinessProviders';
import DefaultProviders from './pages/DefaultProviders';
import ProviderSchedule from './pages/ProviderSchedule';
import Reports from './pages/Reports';
import Contracts from './pages/Contracts';
import AccountSettings from './pages/AccountSettings';

// State Machine Pages
import StateMachines from './pages/StateMachinesUpdated';
import StateMachineForm from './pages/StateMachineFormUpdated';
import StateMachineTest from './pages/StateMachineTest';
import StateMachineMonitor from './pages/StateMachineMonitor';
import BusinessStateMachineAssociation from './pages/BusinessStateMachineAssociation';

// Admin Panel Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/AdminDashboard';
import AdminList from './pages/AdminList';
import AdminForm from './pages/AdminForm';
import AdminDetail from './pages/AdminDetail';

// Import context providers and global styles
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/globalStyles.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CssBaseline />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin Panel Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admins" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminList />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admins/new" element={
                <ProtectedRoute requiredRole="super">
                  <MainLayout>
                    <AdminForm />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admins/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AdminDetail />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/admins/:id/edit" element={
                <ProtectedRoute requiredRole="super">
                  <MainLayout>
                    <AdminForm />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* Business Routes */}
              <Route path="/items" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ItemList />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/companies" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Companies />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/companies/new" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AddCompany />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/companies/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <CompanyDetail />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/companies/:businessId/providers" element={
                <ProtectedRoute>
                  <MainLayout>
                    <BusinessProviders />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/companies/:businessId/providers/:providerId/schedule" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProviderSchedule />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/providers/unassigned" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DefaultProviders />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/account-settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AccountSettings />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/contracts" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Contracts />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* State Machine Routes */}
              <Route path="/state-machines" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StateMachines />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/state-machines/new" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StateMachineForm />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/state-machines/edit/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StateMachineForm />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/state-machines/test/:id" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StateMachineTest />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/state-machines/monitor" element={
                <ProtectedRoute>
                  <MainLayout>
                    <StateMachineMonitor />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/state-machines/associate" element={
                <ProtectedRoute>
                  <MainLayout>
                    <BusinessStateMachineAssociation />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
