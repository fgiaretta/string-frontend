import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; path?: string }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs }) => {
  const location = useLocation();
  
  // Generate breadcrumbs automatically if not provided
  const autoBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;
    
    const paths = location.pathname.split('/').filter(Boolean);
    return [
      { label: 'Home', path: '/' },
      ...paths.map((path, index) => {
        // Create a path up to this point
        const fullPath = `/${paths.slice(0, index + 1).join('/')}`;
        // Format the label (capitalize, replace hyphens with spaces)
        const label = path
          .replace(/-/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
        
        return { label, path: fullPath };
      }),
    ];
  }, [location.pathname, breadcrumbs]);
  
  return (
    <Box sx={{ mb: 4 }}>
      {autoBreadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          {autoBreadcrumbs.map((crumb, index) => {
            const isLast = index === autoBreadcrumbs.length - 1;
            
            return isLast ? (
              <Typography key={index} color="text.primary" variant="body2">
                {crumb.label}
              </Typography>
            ) : (
              <Link 
                key={index} 
                component={RouterLink} 
                to={crumb.path || '#'} 
                underline="hover" 
                color="inherit"
                variant="body2"
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      
      {subtitle && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
