import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Provider {
  id: string;
  name: string;
  // Add other provider properties as needed
}

export const useProviders = (businessId: string) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchProviders = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${apiUrl}/business/${businessId}/providers`,
        { headers: getAuthHeaders() }
      );
      setProviders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
      console.error('Error fetching providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchProviders();
    }
  }, [businessId]);

  return {
    providers,
    isLoading,
    error,
    fetchProviders,
  };
};
