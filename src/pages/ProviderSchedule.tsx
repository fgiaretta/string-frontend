import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TodayIcon from '@mui/icons-material/Today';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Appointment } from '../types';
import scheduleService from '../services/scheduleService';
import providerService from '../services/providerService';

export default function ProviderSchedule() {
  const { businessId, providerId } = useParams<{ businessId: string, providerId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Format date for API call (YYYY-MM-DD)
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

  // Fetch provider data
  const { 
    data: provider,
    isLoading: isLoadingProvider,
    isError: isErrorProvider,
    error: errorProvider
  } = useQuery({
    queryKey: ['provider', businessId, providerId],
    queryFn: () => businessId && providerId 
      ? providerService.getProvider(businessId, providerId) 
      : Promise.reject('Missing business ID or provider ID'),
    enabled: !!businessId && !!providerId
  });

  // Fetch schedule data
  const { 
    data: schedule, 
    isLoading: isLoadingSchedule, 
    isError: isErrorSchedule, 
    error: errorSchedule,
    refetch: refetchSchedule
  } = useQuery({
    queryKey: ['schedule', businessId, providerId, formattedDate],
    queryFn: () => businessId && providerId 
      ? scheduleService.getProviderSchedule(businessId, providerId, formattedDate) 
      : Promise.reject('Missing business ID or provider ID'),
    enabled: !!businessId && !!providerId
  });

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const formatAppointmentTime = (appointment: Appointment) => {
    if (appointment.isAllDay) {
      return 'All day';
    }
    
    if (!appointment.start || !appointment.end) {
      return 'Time not specified';
    }
    
    try {
      const startTime = format(parseISO(appointment.start), 'h:mm a');
      const endTime = format(parseISO(appointment.end), 'h:mm a');
      return `${startTime} - ${endTime}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return 'Invalid time format';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'tentative':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const isLoading = isLoadingProvider || isLoadingSchedule;
  const isError = isErrorProvider || isErrorSchedule;
  const error = errorProvider || errorSchedule;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(`/companies/${businessId}/providers`)}
          sx={{ mb: 2 }}
        >
          Back to Providers
        </Button>
        <Paper sx={{ p: 3, bgcolor: '#fff4f4' }}>
          <Typography color="error">
            Error: {(error as Error)?.message || 'An unknown error occurred'}
          </Typography>
          <Button variant="contained" onClick={() => refetchSchedule()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(`/companies/${businessId}/providers`)}
          >
            Back to Providers
          </Button>
          <Typography variant="h4">
            Schedule for {provider?.name} {provider?.surname}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Provider Information" />
            <Divider />
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={3}>
                {provider?.profileImageUrl && (
                  <Avatar 
                    src={provider.profileImageUrl} 
                    alt={`${provider.name} ${provider.surname}`}
                    sx={{ width: 100, height: 100 }}
                  />
                )}
                <Typography variant="h6">
                  {provider?.name} {provider?.surname}
                </Typography>
                <Chip 
                  label={provider?.state} 
                  color={provider?.state === 'active' ? 'success' : 'default'} 
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Appointment Settings
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography>
                    Duration: {provider?.appointmentDuration} minutes
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography>
                    Interval: {provider?.appointmentInterval} minutes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardHeader title="Select Date" />
            <Divider />
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Schedule Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title={`Appointments for ${format(selectedDate || new Date(), 'MMMM d, yyyy')}`}
              subheader={`${schedule?.length || 0} appointments found`}
            />
            <Divider />
            <CardContent>
              {schedule && schedule.length > 0 ? (
                <List>
                  {schedule.map((appointment: Appointment) => (
                    <Paper key={appointment.id} elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
                      <ListItem
                        secondaryAction={
                          <Chip 
                            label={appointment.status} 
                            color={getStatusColor(appointment.status) as any}
                            size="small"
                          />
                        }
                      >
                        <ListItemIcon>
                          {appointment.isAllDay ? <TodayIcon color="primary" /> : <EventIcon color="primary" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={appointment.summary}
                          secondary={
                            <Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <AccessTimeIcon fontSize="small" />
                                <Typography variant="body2">
                                  {formatAppointmentTime(appointment)}
                                </Typography>
                              </Box>
                              {appointment.location && (
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  <LocationOnIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {appointment.location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <EventBusyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No appointments scheduled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    There are no appointments scheduled for this date.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
