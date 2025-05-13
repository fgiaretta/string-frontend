import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TemplateIcon from '@mui/icons-material/Description';
import DataIcon from '@mui/icons-material/TableChart';
import ResultIcon from '@mui/icons-material/Assessment';
import { useMutation } from '@tanstack/react-query';
import businessService from '../services/businessService';

// List of available templates
const TEMPLATES = [
  'appointment_confirmation_with_pix_payment'
];

interface MassiveMessageFormData {
  templateName: string;
  csvData: string;
}

interface MassiveMessageResponse {
  total: number;
  sent: number;
  failed: number;
  failedDetails: any[];
}

export default function MassiveMessage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MassiveMessageFormData>({
    templateName: 'appointment_confirmation_with_pix_payment',
    csvData: 'phone,1,2,3,4,5,6\n55996490737,1,2,3,4,5,6'
  });
  const [responseData, setResponseData] = useState<MassiveMessageResponse | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isUploading, setIsUploading] = useState(false);

  // Send massive message mutation
  const sendMassiveMessageMutation = useMutation({
    mutationFn: (data: MassiveMessageFormData) => {
      if (!businessId) throw new Error('Business ID is required');
      return businessService.sendMassiveMessage(businessId, data);
    },
    onSuccess: (response: MassiveMessageResponse) => {
      setResponseData(response);
      
      // Create a detailed success message
      const message = `Messages processed: ${response.total}. Successfully sent: ${response.sent}. Failed: ${response.failed}.`;
      setSnackbarMessage(message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      console.error('Error sending messages:', error);
      setResponseData(null);
      
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('token') || 
        error.message.includes('auth') || 
        error.message.includes('unauthorized')
      )) {
        setSnackbarMessage('Authentication error. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setSnackbarMessage(`Error sending messages: ${error.message || 'Unknown error'}`);
      }
      
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        csvData: csvContent
      }));
      setIsUploading(false);
      
      // Show success message
      setSnackbarMessage('CSV file uploaded successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      setSnackbarMessage('Error reading CSV file');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      templateName: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.templateName) {
      setSnackbarMessage('Please select a template');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    if (!formData.csvData) {
      setSnackbarMessage('CSV data is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    sendMassiveMessageMutation.mutate(formData);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth={false} sx={{ px: 2 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate(`/companies/${businessId}`)}
              variant="outlined"
            >
              Back to Company
            </Button>
            <Typography variant="h4">
              Send Massive Messages
            </Typography>
          </Box>
        </Box>

        {/* Stepper to show process */}
        <Stepper activeStep={responseData ? 2 : 1} sx={{ mb: 4 }}>
          <Step>
            <StepLabel icon={<TemplateIcon />}>Template</StepLabel>
          </Step>
          <Step>
            <StepLabel icon={<DataIcon />}>Provide Data</StepLabel>
          </Step>
          <Step>
            <StepLabel icon={<ResultIcon />}>View Results</StepLabel>
          </Step>
        </Stepper>

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, mb: 3, width: '100%' }}>
          <Grid container spacing={4}>
            {/* Template Selection */}
            <Grid item xs={12}>
              <Card elevation={2} sx={{ width: '100%' }}>
                <CardHeader 
                  title="1. Template" 
                  titleTypographyProps={{ variant: 'h6' }}
                  sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
                />
                <Divider />
                <CardContent>
                  <FormControl fullWidth required>
                    <InputLabel id="template-select-label">Template</InputLabel>
                    <Select
                      labelId="template-select-label"
                      id="template-select"
                      value={formData.templateName || 'appointment_confirmation_with_pix_payment'}
                      label="Template"
                      onChange={handleSelectChange}
                      sx={{ maxWidth: '100%' }}
                    >
                      {TEMPLATES.map((template) => (
                        <MenuItem key={template} value={template}>
                          {template.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    This template is used for appointment confirmations that include PIX payment information.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* CSV Data */}
            <Grid item xs={12}>
              <Card elevation={2} sx={{ width: '100%' }}>
                <CardHeader 
                  title="2. Provide CSV Data" 
                  titleTypographyProps={{ variant: 'h6' }}
                  sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
                  action={
                    <Tooltip title="Upload CSV file">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={triggerFileUpload}
                        startIcon={<UploadFileIcon />}
                        disabled={isUploading}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        {isUploading ? 'Uploading...' : 'Upload CSV'}
                      </Button>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <TextField
                    name="csvData"
                    label="CSV Data"
                    value={formData.csvData}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    multiline
                    rows={10}
                    placeholder="phone,1,2,3,4,5,6
55996490737,1,2,3,4,5,6
55996490737,1,2,3,4,5,6"
                    helperText="First row should be headers. First column must be 'phone' with numbers in international format."
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              startIcon={<SendIcon />}
              disabled={sendMassiveMessageMutation.isPending}
              size="large"
            >
              {sendMassiveMessageMutation.isPending ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Sending...
                </>
              ) : 'Send Messages'}
            </Button>
          </Box>
        </Paper>
          
        {/* Results Section */}
        {responseData && (
          <Card elevation={3} sx={{ mb: 3, width: '100%' }}>
            <CardHeader 
              title="3. Message Sending Results" 
              titleTypographyProps={{ variant: 'h6' }}
              sx={{ 
                bgcolor: responseData.failed > 0 ? 'warning.main' : 'success.main',
                color: '#fff'
              }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Total Messages</Typography>
                    <Typography variant="h3">{responseData.total}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="success.dark">Successfully Sent</Typography>
                    <Typography variant="h3" color="success.dark">{responseData.sent}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2, bgcolor: responseData.failed > 0 ? 'error.light' : undefined }}>
                    <Typography variant="subtitle1" fontWeight="bold" color={responseData.failed > 0 ? 'error.dark' : 'text.secondary'}>Failed</Typography>
                    <Typography variant="h3" color={responseData.failed > 0 ? 'error.dark' : 'text.secondary'}>{responseData.failed}</Typography>
                  </Card>
                </Grid>
                
                {responseData.failed > 0 && responseData.failedDetails.length > 0 && (
                  <Grid item xs={12} mt={2}>
                    <Typography variant="subtitle1" fontWeight="bold">Failed Details:</Typography>
                    <Box sx={{ 
                      maxHeight: '200px', 
                      overflow: 'auto', 
                      mt: 1, 
                      p: 2, 
                      bgcolor: 'background.paper', 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 1 
                    }}>
                      <pre>{JSON.stringify(responseData.failedDetails, null, 2)}</pre>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>

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
    </Container>
  );
}
