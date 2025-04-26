import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Plus, Search, Eye, Calendar, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import bookingService from '../../services/booking.service';
import BookingCalendar from '../../components/bookings/BookingCalendar';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
  completed: 'default',
  cancelled: 'default',
};

const BookingList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => bookingService.getAll(filters),
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'list' | 'calendar') => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading bookings. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Equipment Bookings
        </Typography>
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
          >
            <ToggleButton value="list" aria-label="list view">
              <List size={20} />
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="calendar view">
              <Calendar size={20} />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => navigate('/bookings/new')}
          >
            New Booking
          </Button>
        </Stack>
      </Box>

      {viewMode === 'calendar' ? (
        <BookingCalendar />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              placeholder="Search bookings..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
              }}
              sx={{ flexGrow: 1 }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : data?.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Calendar size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No bookings found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Start by creating a new equipment booking
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => navigate('/bookings/new')}
              >
                New Booking
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.items.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.equipment.name}</TableCell>
                      <TableCell>
                        {format(new Date(booking.start_time), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.end_time), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          size="small"
                          color={statusColors[booking.status]}
                        />
                      </TableCell>
                      <TableCell>
                        {booking.user.first_name} {booking.user.last_name}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                          size="small"
                        >
                          <Eye size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default BookingList;