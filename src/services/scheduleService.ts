import { Appointment, TimeSlot } from '../types';

// Get the environment part of the URL
const getEnvPrefix = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.includes('api-dev')) return 'api-dev';
  if (apiUrl.includes('api.')) return 'api';
  return 'api-dev'; // Default to dev if not found
};

export const scheduleService = {
  // Get provider's schedule for a specific date
  getProviderSchedule: async (
    businessId: string, 
    providerId: string, 
    date: string
  ): Promise<Appointment[]> => {
    const env = getEnvPrefix();
    const url = `https://${env}.string.tec.br/business/${businessId}/agenda/${providerId}/${date}`;
    
    console.log(`Fetching schedule from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Schedule API response:', data);
    
    // Process the data to identify all-day events
    return data.map((appointment: Appointment) => ({
      ...appointment,
      isAllDay: appointment.start === null && appointment.end === null
    }));
  },

  // Get available time slots for a specific date
  getAvailableTimeSlots: async (
    businessId: string,
    providerId: string,
    date: string
  ): Promise<TimeSlot[]> => {
    const env = getEnvPrefix();
    const url = `https://${env}.string.tec.br/business/${businessId}/appointment/${providerId}/timeslots/${date}`;
    
    console.log(`Fetching available time slots from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch available time slots: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Available time slots API response:', data);
    
    return data;
  }
};

export default scheduleService;
