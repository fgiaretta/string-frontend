import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Collapse,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import ThemeToggle from '../ThemeToggle';

const drawerWidth = 260;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(!isMobile);
  const [businessSubmenuOpen, setBusinessSubmenuOpen] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleBusinessSubmenuToggle = () => {
    setBusinessSubmenuOpen(!businessSubmenuOpen);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    {
      text: 'Business',
      icon: <BusinessIcon />,
      submenu: [
        { text: 'Companies', path: '/companies' },
      ],
    },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: [2],
        py: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <Box display="flex" alignItems="center">
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-0.5px'
            }}
          >
            <Box 
              component="img" 
              src="/logo.svg" 
              alt="Logo" 
              sx={{ height: 36, mr: 1.5 }} 
            />
            Control Panel
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} className="drawer-toggle">
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto', flexGrow: 1, py: 2.5 }}>
        <List component="nav" sx={{ px: 2.5 }}>
          {menuItems.map((item) => 
            item.submenu ? (
              <Box key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleBusinessSubmenuToggle}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      bgcolor: businessSubmenuOpen ? `${theme.palette.primary.main}14` : 'transparent',
                      '&:hover': {
                        bgcolor: businessSubmenuOpen ? `${theme.palette.primary.main}20` : `rgba(0, 0, 0, 0.04)`,
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {businessSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={businessSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          onClick={() => navigate(subItem.path)}
                          selected={isActive(subItem.path)}
                          sx={{
                            borderRadius: 1.5,
                            mb: 0.5,
                            pl: 2,
                            '&.Mui-selected': {
                              bgcolor: `${theme.palette.primary.main}14`,
                              '&:hover': {
                                bgcolor: `${theme.palette.primary.main}20`,
                              }
                            },
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                            },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ) : (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: `${theme.palette.primary.main}14`,
                      '&:hover': {
                        bgcolor: `${theme.palette.primary.main}20`,
                      }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      </Box>
      <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
          © 2025 String Technologies
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
          v1.0.0
        </Typography>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#ffffff',
          color: 'text.primary',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: open ? 'none' : 'flex' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600
            }}
          >
            {/* Page title could go here */}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ mr: 1.5 }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <ThemeToggle sx={{ mr: 1.5 }} />
            <Tooltip title="Help">
              <IconButton sx={{ mr: 2.5 }}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Admin User" src="/avatar.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Account Settings</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            boxShadow: '1px 0 5px rgba(0,0,0,0.05)',
            border: 'none'
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4, px: { xs: 2, sm: 3, md: 4 } }} className="fade-in">
          {children}
        </Container>
      </Box>
    </Box>
  );
}
