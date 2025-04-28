import { ReactNode } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: number;
  isLoading?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  isLoading = false,
  color = 'primary'
}: StatsCardProps) {
  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;
  
  return (
    <Card 
      className="hover-card" 
      sx={{ 
        height: '100%',
        borderTop: 3,
        borderColor: `${color}.main`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            
            {isLoading ? (
              <Box display="flex" alignItems="center" height={42}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h4" component="div" fontWeight={600}>
                {value}
              </Typography>
            )}
            
            {change !== undefined && !isLoading && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositiveChange && (
                  <TrendingUpIcon 
                    fontSize="small" 
                    color="success" 
                    sx={{ mr: 0.5 }} 
                  />
                )}
                {isNegativeChange && (
                  <TrendingDownIcon 
                    fontSize="small" 
                    color="error" 
                    sx={{ mr: 0.5 }} 
                  />
                )}
                <Typography 
                  variant="body2" 
                  color={isPositiveChange ? 'success.main' : isNegativeChange ? 'error.main' : 'text.secondary'}
                >
                  {isPositiveChange ? '+' : ''}{change}% from last period
                </Typography>
              </Box>
            )}
          </Box>
          
          {icon && (
            <Box 
              sx={{ 
                bgcolor: `${color}.main`,
                color: 'white',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
