import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress, 
  Divider,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import SlackIcon from '@mui/icons-material/AlternateEmail';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import businessService from '../services/businessService';
import { Company } from '../types';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch company data
  const { 
    data: company, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['company', id],
    queryFn: () => id ? businessService.getCompany(id) : Promise.reject('No ID provided'),
    enabled: !!id,
    onSuccess: (data) => {
      setFormData(data);
    }
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Company>) => {
      if (!id) return Promise.reject('No ID provided');
      return businessService.updateCompany(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsEditing(false);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (JSON.stringify(formData) !== JSON.stringify(company)) {
      setConfirmDialogOpen(true);
    } else {
      setIsEditing(false);
      setFormData(company || {});
    }
  };

  const confirmCancel = () => {
    setIsEditing(false);
    setFormData(company || {});
    setConfirmDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !company) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/companies')}
          sx={{ mb: 2 }}
        >
          Back to Companies
        </Button>
        <Paper sx={{ p: 3, bgcolor: '#fff4f4' }}>
          <Typography color="error">
            Error loading company: {((error as Error)?.message) || 'Company not found'}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/companies')}
        >
          Back to Companies
        </Button>
        <Box display="flex" gap={2}>
          {!isEditing ? (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                Save
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom>
        {company.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Basic Information" />
            <Divider />
            <CardContent>
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight="bold">Name:</Typography>
                      <Typography>{company.name}</Typography>
                    </Box>
                  </Grid>
                  {company.email && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon color="action" />
                        <Typography variant="subtitle1" fontWeight="bold">Email:</Typography>
                        <Typography>{company.email}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Communication Channels" />
            <Divider />
            <CardContent>
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Slack Channel"
                      name="slackChannel"
                      value={formData.slackChannel || ''}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="WhatsApp ID"
                      name="whatsappId"
                      value={formData.whatsappId || ''}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="WhatsApp Name"
                      name="whatsappName"
                      value={formData.whatsappName || ''}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="WhatsApp Display Number"
                      name="whatsappDisplayNumber"
                      value={formData.whatsappDisplayNumber || ''}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {company.slackChannel && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SlackIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">Slack Channel:</Typography>
                        <Typography>{company.slackChannel}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {company.whatsappDisplayNumber && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <WhatsAppIcon color="success" />
                        <Typography variant="subtitle1" fontWeight="bold">WhatsApp:</Typography>
                        <Typography>{company.whatsappDisplayNumber}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {company.whatsappName && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold">WhatsApp Name:</Typography>
                        <Typography>{company.whatsappName}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {company.whatsappId && (
                    <Grid item xs={12}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold">WhatsApp ID:</Typography>
                        <Typography>{company.whatsappId}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmCancel} color="error">Discard</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
