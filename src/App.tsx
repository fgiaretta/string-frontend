import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/ItemList';
import Settings from './pages/Settings';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import BusinessProviders from './pages/BusinessProviders';
import DefaultProviders from './pages/DefaultProviders';
import ProviderSchedule from './pages/ProviderSchedule';
import Reports from './pages/Reports';
import Contracts from './pages/Contracts';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/items" element={<ItemList />} />
              <Route path="/settings" element={<Settings />} />
              {/* Business Routes */}
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/companies/:businessId/providers" element={<BusinessProviders />} />
              <Route path="/companies/:businessId/providers/:providerId/schedule" element={<ProviderSchedule />} />
              <Route path="/providers/unassigned" element={<DefaultProviders />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/contracts" element={<Contracts />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;