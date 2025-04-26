import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import bookingService from '../../services/booking.service';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
  completed: 'default',
  cancelled: 'default',
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getById(Number(id)),
  });

  const approveMutation = useMutation({
    mutationFn: () => bookingService.approve(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      enqueueSnackbar('Booking approved successfully', { variant: 'success' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => bookingService.reject(Number(id), 'Rejected by staff'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      enqueueSnackbar('Booking rejected', { variant: 'info' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingService.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      enqueueSnackbar('Booking cancelled', { variant: 'info' });
      setCancelDialogOpen(false);
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading booking details. Please try again later.
        </Alert>
      </Box>
    );
  }

  const canApprove = user?.user_type === 'staff' && booking.status === 'pending';
  const canCancel = booking.status === 'pending' || booking.status === 'approved';
  const isOwner = user?.id === booking.user.id;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/bookings')}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Booking Details
        </Typography>
        {canApprove && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<XCircle size={20} />}
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle size={20} />}
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
            >
              Approve
            </Button>
          </Stack>
        )}
        {canCancel && isOwner && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<AlertTriangle size={20} />}
            onClick={() => setCancelDialogOpen(true)}
          >
            Cancel Booking
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="h6">Equipment Details</Typography>
              <Chip
                label={booking.status}
                color={statusColors[booking.status]}
                size="small"
              />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box
                  component="img"
                  src={booking.equipment.image_url || 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg'}
                  alt={booking.equipment.name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" gutterBottom>
                  {booking.equipment.name}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {booking.equipment.description}
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapPin size={18} />
                    <Typography>{booking.equipment.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={18} />
                    <Typography>Model: {booking.equipment.model_number}</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Time
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Calendar size={18} />
                      <Typography>
                        {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                      </Typography>
                      <Clock size={18} sx={{ ml: 2 }} />
                      <Typography>
                        {format(new Date(booking.start_time), 'HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Time
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Calendar size={18} />
                      <Typography>
                        {format(new Date(booking.end_time), 'MMM dd, yyyy')}
                      </Typography>
                      <Clock size={18} sx={{ ml: 2 }} />
                      <Typography>
                        {format(new Date(booking.end_time), 'HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Booked By
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <User size={18} />
                      <Typography>
                        {booking.user.first_name} {booking.user.last_name}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {booking.approved_by && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Approved By
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <User size={18} />
                        <Typography>
                          {booking.approved_by.first_name} {booking.approved_by.last_name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Purpose
                </Typography>
                <Typography>{booking.purpose}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Timeline
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography>
                  {format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Box>
              
              {booking.status === 'approved' && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Approved
                  </Typography>
                  <Typography>
                    {format(new Date(booking.updated_at), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              )}
              
              {booking.status === 'rejected' && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rejected
                  </Typography>
                  <Typography>
                    {format(new Date(booking.updated_at), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                  {booking.rejection_reason && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {booking.rejection_reason}
                    </Alert>
                  )}
                </Box>
              )}
              
              {booking.status === 'cancelled' && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cancelled
                  </Typography>
                  <Typography>
                    {format(new Date(booking.updated_at), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this booking? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
          <Button
            color="error"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingDetails;