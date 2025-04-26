import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  CheckCircle,
  Clock,
  BookOpen,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import DashboardCard from './DashboardCard';
import bookingService from '../../services/booking.service';
import { Booking } from '../../types';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all bookings for the student
        const bookingsResponse = await bookingService.getAll();
        setBookings(bookingsResponse.data);
        
        // Fetch upcoming bookings
        const now = new Date().toISOString();
        const upcomingResponse = await bookingService.getAll({
          start_date: now,
          status: 'approved',
        });
        setUpcomingBookings(upcomingResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const rejectedBookings = bookings.filter(b => b.status === 'rejected').length;
  
  const successRate = totalBookings > 0 
    ? Math.round((approvedBookings / totalBookings) * 100) 
    : 0;
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Student Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CalendarClock size={20} />}
          onClick={() => navigate('/bookings/create')}
        >
          Book Equipment
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Bookings"
            value={totalBookings}
            icon={<BookOpen size={24} />}
            description="All time bookings"
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Upcoming Bookings"
            value={upcomingBookings.length}
            icon={<Clock size={24} />}
            description="Scheduled sessions"
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Approvals"
            value={pendingBookings}
            icon={<AlertCircle size={24} />}
            description="Awaiting confirmation"
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={<CheckCircle size={24} />}
            description="Approved bookings"
            color={theme.palette.success.main}
            trend={successRate - 50} // Example trend
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  Upcoming Bookings
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ArrowUpRight size={16} />}
                  onClick={() => navigate('/bookings')}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {upcomingBookings.length === 0 ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    bgcolor: 'background.default'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No upcoming bookings found
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/bookings/create')}
                  >
                    Book Now
                  </Button>
                </Paper>
              ) : (
                <List>
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <ListItem
                      key={booking.id}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'background.default',
                        },
                      }}
                      secondaryAction={
                        <Chip
                          label={booking.status}
                          size="small"
                          color={
                            booking.status === 'approved' ? 'success' :
                            booking.status === 'pending' ? 'warning' :
                            booking.status === 'rejected' ? 'error' : 'default'
                          }
                        />
                      }
                    >
                      <ListItemText
                        primary={booking.equipment.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                            </Typography>
                            {' — '}
                            {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  Available Equipment
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ArrowUpRight size={16} />}
                  onClick={() => navigate('/equipment')}
                >
                  Browse
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Discover and book lab equipment for your experiments and projects.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/equipment')}
                >
                  Browse Equipment
                </Button>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;