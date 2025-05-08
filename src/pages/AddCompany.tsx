import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation } from '@tanstack/react-query';
import businessService from '../services/businessService';

interface CompanyFormData {
  name: string;
  email: string;
  whatsappId: string;
  whatsappName: string;
  whatsappDisplayNumber: string;
  slackChannel: string;
  category: string;
}

export default function AddCompany() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    email: '',
    whatsappId: '',
    whatsappName: '',
    whatsappDisplayNumber: '',
    slackChannel: '',
    category: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: CompanyFormData) => businessService.createCompany(data),
    onSuccess: () => {
      setSnackbarMessage('Company created successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Navigate back to companies list after a short delay
      setTimeout(() => {
        navigate('/companies');
      }, 1500);
    },
    onError: (error: any) => {
      setSnackbarMessage(`Error creating company: ${error.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof CompanyFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CompanyFormData, string>> = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Optional fields with validation if provided
    if (formData.whatsappDisplayNumber && !/^\d+$/.test(formData.whatsappDisplayNumber)) {
      newErrors.whatsappDisplayNumber = 'WhatsApp number should contain only digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      createCompanyMutation.mutate(formData);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/companies')}
          >
            Back to Companies
          </Button>
          <Typography variant="h4">
            Add New Company
          </Typography>
        </Box>
      </Box>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Company Information" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Company Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="category"
                      label="Category"
                      value={formData.category}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="e.g. Healthcare, Education, Retail"
                      error={!!errors.category}
                      helperText={errors.category}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="slackChannel"
                      label="Slack Channel ID"
                      value={formData.slackChannel}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="e.g. C08AQ13MUCR"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="WhatsApp Integration" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="whatsappName"
                      label="WhatsApp Business Name"
                      value={formData.whatsappName}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="whatsappId"
                      label="WhatsApp Business ID"
                      value={formData.whatsappId}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="e.g. 446062275257295"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="whatsappDisplayNumber"
                      label="WhatsApp Display Number"
                      value={formData.whatsappDisplayNumber}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="e.g. 5548920004713"
                      error={!!errors.whatsappDisplayNumber}
                      helperText={errors.whatsappDisplayNumber}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
            startIcon={<SaveIcon />}
            disabled={createCompanyMutation.isPending}
          >
            {createCompanyMutation.isPending ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : 'Save Company'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
