import { ReactNode } from 'react';
import { Box, Typography, Breadcrumbs, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  icon?: ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions,
  icon 
}: PageHeaderProps) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        background: 'linear-gradient(to right, #f5f7fa, #ffffff)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography key={item.label} color="text.primary" fontWeight={500}>
                {item.label}
              </Typography>
            ) : (
              <Link 
                key={item.label} 
                component={RouterLink} 
                to={item.href || '#'} 
                underline="hover" 
                color="inherit"
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          {icon && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                width: 48,
                height: 48,
                p: 1
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h4" component="h1" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
