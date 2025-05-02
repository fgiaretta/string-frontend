import { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Create light and dark theme palettes
import { lightTheme, darkTheme } from '../theme/themes';

type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

// Create context
export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get saved theme preference from localStorage or default to light
  const savedTheme = localStorage.getItem('themeMode') as PaletteMode || 'light';
  const [mode, setMode] = useState<PaletteMode>(savedTheme);

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Create the theme based on the current mode
  const theme = useMemo(
    () => createTheme(mode === 'light' ? lightTheme : darkTheme),
    [mode]
  );

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
