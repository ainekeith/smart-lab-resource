import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ArrowLeft, Save } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import equipmentService from '../../services/equipment.service';

const validationSchema = Yup.object({
  maintenance_type: Yup.string().required('Maintenance type is required'),
  description: Yup.string().required('Description is required'),
  maintenance_date: Yup.date().required('Maintenance date is required'),
  next_maintenance_date: Yup.date().min(
    Yup.ref('maintenance_date'),
    'Next maintenance date must be after maintenance date'
  ),
  cost: Yup.number().min(0, 'Cost must be positive'),
  performed_by: Yup.string().required('Performed by is required'),
});

const MaintenanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentService.getById(Number(id)),
  });

  const mutation = useMutation({
    mutationFn: (values: any) => equipmentService.addMaintenanceRecord(Number(id), values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
      enqueueSnackbar('Maintenance record added successfully', { variant: 'success' });
      navigate(`/equipment/${id}`);
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || 'Failed to add maintenance record',
        { variant: 'error' }
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      maintenance_type: '',
      description: '',
      maintenance_date: new Date(),
      next_maintenance_date: null,
      cost: '',
      performed_by: '',
    },
    validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  if (isLoadingEquipment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!equipment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Equipment not found</Alert>
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
            onClick={() => navigate(`/equipment/${id}`)}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Add Maintenance Record
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Equipment: {equipment.name}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Maintenance Type</InputLabel>
                  <Select
                    name="maintenance_type"
                    value={formik.values.maintenance_type}
                    onChange={formik.handleChange}
                    label="Maintenance Type"
                    error={formik.touched.maintenance_type && Boolean(formik.errors.maintenance_type)}
                  >
                    <MenuItem value="routine">Routine Maintenance</MenuItem>
                    <MenuItem value="repair">Repair</MenuItem>
                    <MenuItem value="inspection">Inspection</MenuItem>
                    <MenuItem value="calibration">Calibration</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="performed_by"
                  label="Performed By"
                  value={formik.values.performed_by}
                  onChange={formik.handleChange}
                  error={formik.touched.performed_by && Boolean(formik.errors.performed_by)}
                  helperText={formik.touched.performed_by && formik.errors.performed_by}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Maintenance Date"
                  value={formik.values.maintenance_date}
                  onChange={(value) => formik.setFieldValue('maintenance_date', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.maintenance_date && Boolean(formik.errors.maintenance_date),
                      helperText: formik.touched.maintenance_date && formik.errors.maintenance_date,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Next Maintenance Date"
                  value={formik.values.next_maintenance_date}
                  onChange={(value) => formik.setFieldValue('next_maintenance_date', value)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.next_maintenance_date && Boolean(formik.errors.next_maintenance_date),
                      helperText: formik.touched.next_maintenance_date && formik.errors.next_maintenance_date,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="cost"
                  label="Cost"
                  type="number"
                  value={formik.values.cost}
                  onChange={formik.handleChange}
                  error={formik.touched.cost && Boolean(formik.errors.cost)}
                  helperText={formik.touched.cost && formik.errors.cost}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/equipment/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save size={20} />}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? 'Saving...' : 'Save Record'}
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

export default MaintenanceForm;