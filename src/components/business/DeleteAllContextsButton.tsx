import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DeleteIcon from '@mui/icons-material/Delete';
import businessService from '../../services/businessService';

interface DeleteAllContextsButtonProps {
  businessId: string;
}

const DeleteAllContextsButton: React.FC<DeleteAllContextsButtonProps> = ({ businessId }) => {
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const queryClient = useQueryClient();

  const deleteContextsMutation = useMutation({
    mutationFn: async () => {
      return businessService.deleteAllContexts(businessId);
    },
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: `Successfully deleted ${data.count} contexts`,
        severity: 'success'
      });
      setOpen(false);
      
      // Invalidate any queries that might be affected by this deletion
      queryClient.invalidateQueries({ queryKey: ['company', businessId] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'An error occurred while deleting contexts';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      setOpen(false);
    }
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    deleteContextsMutation.mutate();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={handleClickOpen}
        sx={{ mt: 2 }}
      >
        Delete All Contexts
      </Button>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete All Contexts
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete all contexts for this business? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={deleteContextsMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleteContextsMutation.isPending}
            startIcon={deleteContextsMutation.isPending ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteContextsMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteAllContextsButton;
