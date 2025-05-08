import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface ProviderInstruction {
  id: string;
  providerId: string;
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateProviderInstructionPayload {
  providerId: string;
  instructions: string[];
}

interface UpdateProviderInstructionPayload {
  providerId: string;
  instructions: string[];
}

export const useProviderInstructions = (businessId: string) => {
  const [providerInstructions, setProviderInstructions] = useState<ProviderInstruction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchProviderInstructions = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${apiUrl}/business/${businessId}/provider-instructions`,
        { headers: getAuthHeaders() }
      );
      setProviderInstructions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch provider instructions');
      console.error('Error fetching provider instructions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderInstruction = async (providerId: string) => {
    if (!businessId || !providerId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${apiUrl}/business/${businessId}/provider-instructions/${providerId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch provider instruction');
      console.error('Error fetching provider instruction:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createProviderInstruction = async (payload: CreateProviderInstructionPayload) => {
    if (!businessId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${apiUrl}/business/${businessId}/provider-instructions`,
        payload,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider instruction');
      console.error('Error creating provider instruction:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProviderInstruction = async (
    instructionId: string,
    payload: UpdateProviderInstructionPayload
  ) => {
    if (!businessId || !instructionId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(
        `${apiUrl}/business/${businessId}/provider-instructions/${instructionId}`,
        payload,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider instruction');
      console.error('Error updating provider instruction:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProviderInstruction = async (instructionId: string) => {
    if (!businessId || !instructionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(
        `${apiUrl}/business/${businessId}/provider-instructions/${instructionId}`,
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider instruction');
      console.error('Error deleting provider instruction:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    providerInstructions,
    isLoading,
    error,
    fetchProviderInstructions,
    fetchProviderInstruction,
    createProviderInstruction,
    updateProviderInstruction,
    deleteProviderInstruction,
  };
};
