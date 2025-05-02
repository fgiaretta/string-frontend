import { useThemeContext } from '../context/ThemeContext';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface ThemeToggleProps {
  sx?: object;
}

const ThemeToggle = ({ sx = {} }: ThemeToggleProps) => {
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggleColorMode} color="inherit" sx={sx}>
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
