import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  useTheme,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';
import bookingService from '../../services/booking.service';
import { useWebSocket } from '../../hooks/useWebSocket';

interface TimeSlot {
  time: Date;
  bookings: any[];
}

const EquipmentTimeline = ({ equipmentId }: { equipmentId: number }) => {
  const theme = useTheme();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['equipment-timeline', equipmentId],
    queryFn: () => bookingService.getAll({
      equipment_id: equipmentId,
      start_date: startOfDay(new Date()).toISOString(),
      end_date: endOfDay(addDays(new Date(), 7)).toISOString(),
    }),
  });

  // Subscribe to real-time booking updates
  useWebSocket('booking_update', (data) => {
    if (data.equipment_id === equipmentId) {
      // Refresh the timeline data
      queryClient.invalidateQueries(['equipment-timeline', equipmentId]);
    }
  });

  useEffect(() => {
    if (bookings) {
      // Generate time slots for the next 7 days
      const slots: TimeSlot[] = [];
      const startDate = startOfDay(new Date());
      
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(startDate, i);
        slots.push({
          time: currentDate,
          bookings: bookings.items.filter((booking: any) => {
            const bookingDate = new Date(booking.start_time);
            return bookingDate.getDate() === currentDate.getDate();
          }),
        });
      }
      
      setTimeSlots(slots);
    }
  }, [bookings]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Availability Timeline
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {timeSlots.map((slot) => (
          <Box
            key={slot.time.toISOString()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1,
              borderRadius: 1,
              bgcolor: 'background.default',
            }}
          >
            <Typography sx={{ minWidth: 100 }}>
              {format(slot.time, 'EEE, MMM d')}
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                height: 40,
                bgcolor: 'background.paper',
                borderRadius: 1,
                position: 'relative',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {slot.bookings.map((booking) => {
                const startTime = new Date(booking.start_time);
                const endTime = new Date(booking.end_time);
                const startPercent = ((startTime.getHours() - 8) / 12) * 100;
                const duration = (endTime.getTime() - startTime.getTime()) / (12 * 60 * 60 * 1000) * 100;

                return (
                  <Tooltip
                    key={booking.id}
                    title={`${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}
                    ${booking.user.first_name} ${booking.user.last_name}`}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${startPercent}%`,
                        width: `${duration}%`,
                        height: '100%',
                        bgcolor: theme.palette.primary.main,
                        opacity: 0.8,
                        borderRadius: 0.5,
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            bgcolor: theme.palette.primary.main,
            opacity: 0.8,
            borderRadius: 0.5,
          }}
        />
        <Typography variant="caption">Booked Time Slots</Typography>
      </Box>
    </Paper>
  );
};