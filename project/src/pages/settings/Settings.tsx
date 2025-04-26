import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stack,
  Avatar,
  IconButton,
} from '@mui/material';
import { Save, Upload, Bell, Moon, Sun, User } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FileUpload from '../../components/common/FileUpload';
import api from '../../services/api';

const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone_number: Yup.string().matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  department: Yup.string(),
  current_password: Yup.string().min(8, 'Password must be at least 8 characters'),
  new_password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords must match'),
});

interface ProfileFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  department: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const Settings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const { themeMode } = useSelector((state: RootState) => state.ui);
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    booking_reminders: true,
    maintenance_alerts: true,
    system_updates: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (values: Partial<ProfileFormValues>) => api.put('/users/profile/', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to update profile', { variant: 'error' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: { current_password: string; new_password: string }) => 
      api.post('/users/change-password/', values),
    onSuccess: () => {
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      formik.setFieldValue('current_password', '');
      formik.setFieldValue('new_password', '');
      formik.setFieldValue('confirm_password', '');
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to change password', { variant: 'error' });
    },
  });

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      department: '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (values.current_password) {
        await changePasswordMutation.mutateAsync({
          current_password: values.current_password,
          new_password: values.new_password,
        });
      } else {
        await updateProfileMutation.mutateAsync({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: values.phone_number,
          department: values.department,
        });
      }
    },
  });

  // Update form with user data when available
  useEffect(() => {
    if (user) {
      formik.setValues({
        ...formik.values,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleThemeToggle = () => {
    dispatch(setTheme(themeMode === 'light' ? 'dark' : 'light'));
  };

  const handleNotificationChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked,
    }));
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Unable to load user profile</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} display="flex" justifyContent="center">
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        fontSize: 40,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {user.first_name?.[0] || user.username?.[0]}
                    </Avatar>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Upload size={20} />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="first_name"
                    label="First Name"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                    helperText={formik.touched.first_name && formik.errors.first_name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="last_name"
                    label="Last Name"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                    helperText={formik.touched.last_name && formik.errors.last_name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone_number"
                    label="Phone Number"
                    value={formik.values.phone_number}
                    onChange={formik.handleChange}
                    error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                    helperText={formik.touched.phone_number && formik.errors.phone_number}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="department"
                    label="Department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                    helperText={formik.touched.department && formik.errors.department}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save size={20} />}
                      disabled={updateProfileMutation.isPending}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    name="current_password"
                    label="Current Password"
                    value={formik.values.current_password}
                    onChange={formik.handleChange}
                    error={formik.touched.current_password && Boolean(formik.errors.current_password)}
                    helperText={formik.touched.current_password && formik.errors.current_password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    name="new_password"
                    label="New Password"
                    value={formik.values.new_password}
                    onChange={formik.handleChange}
                    error={formik.touched.new_password && Boolean(formik.errors.new_password)}
                    helperText={formik.touched.new_password && formik.errors.new_password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    name="confirm_password"
                    label="Confirm New Password"
                    value={formik.values.confirm_password}
                    onChange={formik.handleChange}
                    error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
                    helperText={formik.touched.confirm_password && formik.errors.confirm_password}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={changePasswordMutation.isPending || !formik.values.current_password}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {themeMode === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                  <Typography>Dark Mode</Typography>
                </Box>
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={handleThemeToggle}
                />
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bell size={20} />
              Notification Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onChange={handleNotificationChange('email_notifications')}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.booking_reminders}
                    onChange={handleNotificationChange('booking_reminders')}
                  />
                }
                label="Booking Reminders"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.maintenance_alerts}
                    onChange={handleNotificationChange('maintenance_alerts')}
                  />
                }
                label="Maintenance Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.system_updates}
                    onChange={handleNotificationChange('system_updates')}
                  />
                }
                label="System Updates"
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;