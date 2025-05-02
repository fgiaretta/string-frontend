import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define API environment constants
const API_ENVIRONMENTS = {
  DEVELOPMENT: 'https://api-dev.string.tec.br',
  PRODUCTION: 'https://api.string.tec.br',
};

// Define the context type
interface ApiEnvironmentContextType {
  apiUrl: string;
  isProduction: boolean;
  toggleEnvironment: () => void;
}

// Create the context with default values
const ApiEnvironmentContext = createContext<ApiEnvironmentContextType>({
  apiUrl: API_ENVIRONMENTS.DEVELOPMENT,
  isProduction: false,
  toggleEnvironment: () => {},
});

// Custom hook to use the API environment context
export const useApiEnvironment = () => useContext(ApiEnvironmentContext);

// Provider component
interface ApiEnvironmentProviderProps {
  children: ReactNode;
}

export const ApiEnvironmentProvider: React.FC<ApiEnvironmentProviderProps> = ({ children }) => {
  // Get the stored environment from localStorage or use development as default
  const getInitialEnvironment = (): boolean => {
    const storedEnv = localStorage.getItem('apiEnvironment');
    return storedEnv === 'production';
  };

  const [isProduction, setIsProduction] = useState<boolean>(getInitialEnvironment);
  const [apiUrl, setApiUrl] = useState<string>(
    isProduction ? API_ENVIRONMENTS.PRODUCTION : API_ENVIRONMENTS.DEVELOPMENT
  );

  // Toggle between production and development environments
  const toggleEnvironment = () => {
    const newIsProduction = !isProduction;
    setIsProduction(newIsProduction);
    localStorage.setItem('apiEnvironment', newIsProduction ? 'production' : 'development');
    
    // Update the API URL
    setApiUrl(newIsProduction ? API_ENVIRONMENTS.PRODUCTION : API_ENVIRONMENTS.DEVELOPMENT);
    
    // Force reload to apply the new API URL
    window.location.reload();
  };

  // Update API URL when environment changes
  useEffect(() => {
    setApiUrl(isProduction ? API_ENVIRONMENTS.PRODUCTION : API_ENVIRONMENTS.DEVELOPMENT);
  }, [isProduction]);

  return (
    <ApiEnvironmentContext.Provider value={{ apiUrl, isProduction, toggleEnvironment }}>
      {children}
    </ApiEnvironmentContext.Provider>
  );
};
