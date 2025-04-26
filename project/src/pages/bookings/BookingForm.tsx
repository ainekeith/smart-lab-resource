import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ArrowLeft, Save } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import equipmentService from '../../services/equipment.service';
import bookingService from '../../services/booking.service';

const validationSchema = Yup.object({
  equipment_id: Yup.number().required('Equipment is required'),
  start_time: Yup.date().required('Start time is required'),
  end_time: Yup.date()
    .required('End time is required')
    .min(
      Yup.ref('start_time'),
      'End time must be later than start time'
    ),
  purpose: Yup.string().required('Purpose is required'),
});

const BookingForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selectedEquipment, setSelectedEquipment] = useState<number | ''>('');

  const { data: equipment, isLoading: isLoadingEquipment, error } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentService.getAll({ status: 'available' }),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => bookingService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      enqueueSnackbar('Booking created successfully', { variant: 'success' });
      navigate('/bookings');
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || 'Failed to create booking',
        { variant: 'error' }
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      equipment_id: '',
      start_time: new Date(),
      end_time: new Date(),
      purpose: '',
    },
    validationSchema,
    onSubmit: (values) => {
      mutation.mutate({
        ...values,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
      });
    },
  });

  useEffect(() => {
    const equipmentId = searchParams.get('equipment');
    if (equipmentId) {
      formik.setFieldValue('equipment_id', Number(equipmentId));
      setSelectedEquipment(Number(equipmentId));
    }

    const startTime = searchParams.get('start');
    const endTime = searchParams.get('end');
    if (startTime) {
      formik.setFieldValue('start_time', new Date(startTime));
    }
    if (endTime) {
      formik.setFieldValue('end_time', new Date(endTime));
    }
  }, [searchParams]);

  if (isLoadingEquipment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading equipment. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/bookings')}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            New Booking
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.equipment_id && Boolean(formik.errors.equipment_id)}
                >
                  <InputLabel>Equipment</InputLabel>
                  <Select
                    name="equipment_id"
                    value={formik.values.equipment_id}
                    onChange={formik.handleChange}
                    label="Equipment"
                  >
                    {equipment?.results?.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.equipment_id && formik.errors.equipment_id && (
                    <FormHelperText>{formik.errors.equipment_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Time"
                  value={formik.values.start_time}
                  onChange={(value) => formik.setFieldValue('start_time', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.start_time && Boolean(formik.errors.start_time),
                      helperText: formik.touched.start_time && formik.errors.start_time,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Time"
                  value={formik.values.end_time}
                  onChange={(value) => formik.setFieldValue('end_time', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.end_time && Boolean(formik.errors.end_time),
                      helperText: formik.touched.end_time && formik.errors.end_time,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="purpose"
                  label="Purpose"
                  value={formik.values.purpose}
                  onChange={formik.handleChange}
                  error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                  helperText={formik.touched.purpose && formik.errors.purpose}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/bookings')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save size={20} />}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? 'Creating...' : 'Create Booking'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default BookingForm;