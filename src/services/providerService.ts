import { Provider, ProviderListResponse, QueryParams } from '../types';

// Get the environment part of the URL
const getEnvPrefix = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.includes('api-dev')) return 'api-dev';
  if (apiUrl.includes('api.')) return 'api';
  return 'api-dev'; // Default to dev if not found
};

export const providerService = {
  // Get all providers for a business
  getProviders: async (businessId: string, params?: QueryParams): Promise<Provider[] | ProviderListResponse> => {
    const env = getEnvPrefix();
    const url = new URL(`https://${env}.string.tec.br/business/${businessId}/provider`);
    
    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    console.log(`Fetching providers from: ${url.toString()}`);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Provider API response:', data);
    return data;
  },

  // Get a single provider
  getProvider: async (businessId: string, providerId: string): Promise<Provider> => {
    const env = getEnvPrefix();
    const response = await fetch(`https://${env}.string.tec.br/business/${businessId}/provider/${providerId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch provider: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new provider
  createProvider: async (businessId: string, data: Omit<Provider, 'id' | 'businessId'>): Promise<Provider> => {
    const env = getEnvPrefix();
    const response = await fetch(`https://${env}.string.tec.br/business/${businessId}/provider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create provider: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Update a provider
  updateProvider: async (businessId: string, providerId: string, data: Partial<Provider>): Promise<Provider> => {
    const env = getEnvPrefix();
    const response = await fetch(`https://${env}.string.tec.br/business/${businessId}/provider/${providerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update provider: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Delete a provider
  deleteProvider: async (businessId: string, providerId: string): Promise<void> => {
    const env = getEnvPrefix();
    const response = await fetch(`https://${env}.string.tec.br/business/${businessId}/provider/${providerId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete provider: ${response.statusText}`);
    }
  },

  // Update provider's business
  updateProviderBusiness: async (
    defaultBusinessId: string, 
    providerId: string, 
    newBusinessId: string
  ): Promise<Provider> => {
    const env = getEnvPrefix();
    const response = await fetch(
      `https://${env}.string.tec.br/business/${defaultBusinessId}/provider/${providerId}/update-business`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newBusinessId }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to update provider's business: ${response.statusText}`);
    }
    
    return response.json();
  }
};

export default providerService;
