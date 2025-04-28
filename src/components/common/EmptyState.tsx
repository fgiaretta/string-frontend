import { ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  compact = false
}: EmptyStateProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: compact ? 3 : 6,
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px dashed rgba(0, 0, 0, 0.12)',
      }}
    >
      {icon && (
        <Box
          sx={{
            color: 'text.secondary',
            mb: 2,
            '& svg': {
              fontSize: compact ? 48 : 64,
            },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        variant={compact ? 'h6' : 'h5'}
        component="h2"
        fontWeight={600}
        gutterBottom
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 500, mb: actionLabel ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{ mt: description ? 0 : 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}
