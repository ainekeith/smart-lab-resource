import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  CircularProgress,
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import bookingService from '../../services/booking.service';
import equipmentService from '../../services/equipment.service';
import { Booking, Equipment } from '../../types';

const statusColors = {
  pending: '#ff9800',
  approved: '#4caf50',
  rejected: '#f44336',
  completed: '#9e9e9e',
  cancelled: '#9e9e9e',
};

const BookingCalendar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings', { view: 'calendar', equipment: selectedEquipment }],
    queryFn: () => bookingService.getAll({
      equipment_id: selectedEquipment !== 'all' ? selectedEquipment : undefined,
    }),
  });

  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentService.getAll(),
  });

  const handleDateSelect = async (selectInfo: any) => {
    const startTime = selectInfo.start;
    const endTime = selectInfo.end;

    // If no specific equipment is selected, navigate to booking form with just the times
    if (selectedEquipment === 'all') {
      navigate(`/bookings/new?start=${startTime.toISOString()}&end=${endTime.toISOString()}`);
      return;
    }

    // Check availability before creating booking
    try {
      const isAvailable = await bookingService.checkAvailability(
        Number(selectedEquipment),
        startTime.toISOString(),
        endTime.toISOString()
      );

      if (isAvailable) {
        navigate(`/bookings/new?equipment=${selectedEquipment}&start=${startTime.toISOString()}&end=${endTime.toISOString()}`);
      } else {
        enqueueSnackbar('Selected time slot is not available', { variant: 'warning' });
      }
    } catch (error) {
      enqueueSnackbar('Error checking availability', { variant: 'error' });
    }
  };

  const handleEventClick = (clickInfo: any) => {
    navigate(`/bookings/${clickInfo.event.id}`);
  };

  const getEventColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || theme.palette.primary.main;
  };

  const events = bookings?.results?.map((booking: Booking) => ({
    id: booking.id,
    title: `${booking.equipment.name} - ${booking.user.first_name} ${booking.user.last_name}`,
    start: booking.start_time,
    end: booking.end_time,
    backgroundColor: getEventColor(booking.status),
    borderColor: getEventColor(booking.status),
    extendedProps: {
      status: booking.status,
      equipment: booking.equipment,
      user: booking.user,
    },
  })) || [];

  if (isLoadingBookings || isLoadingEquipment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Equipment Bookings Calendar</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Equipment</InputLabel>
          <Select
            value={selectedEquipment}
            label="Equipment"
            onChange={(e) => setSelectedEquipment(e.target.value)}
          >
            <MenuItem value="all">All Equipment</MenuItem>
            {equipment?.results?.map((item: Equipment) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ '.fc': { fontFamily: theme.typography.fontFamily } }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="timeGridWeek"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          eventContent={(eventInfo) => (
            <Box sx={{ p: 1, fontSize: '0.85em' }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                {eventInfo.event.extendedProps.equipment.name}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                {eventInfo.event.extendedProps.user.first_name} {eventInfo.event.extendedProps.user.last_name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'inline-block',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  px: 0.5,
                  borderRadius: 0.5,
                  mt: 0.5,
                }}
              >
                {eventInfo.event.extendedProps.status}
              </Typography>
            </Box>
          )}
        />
      </Box>
    </Paper>
  );
};

export default BookingCalendar;