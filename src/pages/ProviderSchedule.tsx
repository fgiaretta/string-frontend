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
  Avatar,
  Tabs,
  Tab,
  Stack
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Appointment, TimeSlot } from '../types';
import scheduleService from '../services/scheduleService';
import providerService from '../services/providerService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProviderSchedule() {
  const { businessId, providerId } = useParams<{ businessId: string, providerId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tabValue, setTabValue] = useState(0);

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

  // Fetch available time slots
  const {
    data: availableSlots,
    isLoading: isLoadingSlots,
    isError: isErrorSlots,
    error: errorSlots,
    refetch: refetchSlots
  } = useQuery({
    queryKey: ['timeslots', businessId, providerId, formattedDate],
    queryFn: () => businessId && providerId
      ? scheduleService.getAvailableTimeSlots(businessId, providerId, formattedDate)
      : Promise.reject('Missing business ID or provider ID'),
    enabled: !!businessId && !!providerId
  });

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  const formatTimeSlot = (slot: TimeSlot) => {
    try {
      const startTime = format(parseISO(slot.start), 'h:mm a');
      const endTime = format(parseISO(slot.end), 'h:mm a');
      return `${startTime} - ${endTime}`;
    } catch (e) {
      console.error('Error formatting time slot:', e);
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

  const isLoading = isLoadingProvider || isLoadingSchedule || isLoadingSlots;
  const isError = isErrorProvider || isErrorSchedule || isErrorSlots;
  const error = errorProvider || errorSchedule || errorSlots;

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
          <Button variant="contained" onClick={() => {
            refetchSchedule();
            refetchSlots();
          }} sx={{ mt: 2 }}>
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="schedule tabs"
                variant="fullWidth"
              >
                <Tab label="Combined View" />
                <Tab label="Appointments" />
                <Tab label="Available Slots" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Schedule for {format(selectedDate || new Date(), 'MMMM d, yyyy')}
              </Typography>
              
              {(schedule && schedule.length > 0) || (availableSlots && availableSlots.length > 0) ? (
                <Stack spacing={2}>
                  {/* All-day events first */}
                  {schedule && schedule.filter(appt => appt.isAllDay).map((appointment) => (
                    <Paper key={appointment.id} elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <TodayIcon color="primary" />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {appointment.summary} (All day)
                          </Typography>
                        </Box>
                        <Chip 
                          label={appointment.status} 
                          color={getStatusColor(appointment.status) as any}
                          size="small"
                        />
                      </Box>
                    </Paper>
                  ))}
                  
                  {/* Time-based events and slots in chronological order */}
                  {[
                    ...(schedule?.filter(appt => !appt.isAllDay).map(appt => ({
                      ...appt,
                      type: 'appointment',
                      startTime: appt.start ? new Date(appt.start).getTime() : 0
                    })) || []),
                    ...(availableSlots?.map(slot => ({
                      ...slot,
                      type: 'available',
                      startTime: new Date(slot.start).getTime()
                    })) || [])
                  ]
                    .sort((a, b) => a.startTime - b.startTime)
                    .map((item, index) => (
                      item.type === 'appointment' ? (
                        <Paper key={`appt-${(item as any).id}`} elevation={1} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <EventIcon color="primary" />
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {(item as Appointment).summary}
                                </Typography>
                                <Chip 
                                  label={(item as Appointment).status} 
                                  color={getStatusColor((item as Appointment).status) as any}
                                  size="small"
                                />
                              </Box>
                              <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <AccessTimeIcon fontSize="small" />
                                <Typography variant="body2">
                                  {formatAppointmentTime(item as Appointment)}
                                </Typography>
                              </Box>
                              {(item as Appointment).location && (
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  <LocationOnIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {(item as Appointment).location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      ) : (
                        <Paper key={`slot-${index}`} elevation={1} sx={{ p: 2, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <CheckCircleIcon color="success" />
                              <Typography variant="subtitle1">
                                Available: {formatTimeSlot(item as TimeSlot)}
                              </Typography>
                            </Box>
                            <Chip 
                              label="Available" 
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Paper>
                      )
                    ))
                  }
                </Stack>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <EventBusyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No schedule information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    There are no appointments or available slots for this date.
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Appointments for {format(selectedDate || new Date(), 'MMMM d, yyyy')}
              </Typography>
              
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
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Available Slots for {format(selectedDate || new Date(), 'MMMM d, yyyy')}
              </Typography>
              
              {availableSlots && availableSlots.length > 0 ? (
                <Grid container spacing={2}>
                  {availableSlots.map((slot: TimeSlot, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          bgcolor: '#e8f5e9',
                          border: '1px solid #c8e6c9',
                          '&:hover': {
                            bgcolor: '#c8e6c9',
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <AccessTimeIcon color="success" />
                          <Typography>
                            {formatTimeSlot(slot)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                  <EventBusyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No available slots
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    There are no available appointment slots for this date.
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
