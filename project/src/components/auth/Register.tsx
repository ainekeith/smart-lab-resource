import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
} from '@mui/material';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';

const registerSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  first_name: Yup.string()
    .required('First name is required'),
  last_name: Yup.string()
    .required('Last name is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  user_type: Yup.string()
    .oneOf(['student', 'staff'], 'Invalid user type')
    .required('User type is required'),
  department: Yup.string()
    .when('user_type', {
      is: (val: string) => val === 'student' || val === 'staff',
      then: () => Yup.string().required('Department is required'),
    }),
  phone_number: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Phone number is not valid')
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password2: '',
      user_type: 'student',
      department: '',
      phone_number: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setRegisterError(null);
      try {
        const resultAction = await dispatch(register(values));
        if (register.fulfilled.match(resultAction)) {
          setRegistrationSuccess(true);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (register.rejected.match(resultAction)) {
          // Handle structured errors from backend
          if (resultAction.payload?.errors) {
            const errorMessages = Object.entries(resultAction.payload.errors)
              .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
              .join('\n');
            setRegisterError(errorMessages);
          } else {
            setRegisterError(resultAction.payload?.detail || 'Registration failed');
          }
        }
      } catch (error) {
        setRegisterError('An unexpected error occurred');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  if (registrationSuccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: '400px',
            width: '100%',
            mx: 2,
            borderRadius: 2,
          }}
        >
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! Redirecting to login page...
          </Alert>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: '600px',
          width: '100%',
          mx: 2,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Smart Lab Management
        </Typography>
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Create an Account
        </Typography>
        
        {registerError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {registerError}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="First Name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Last Name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            margin="normal"
          />
          
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.user_type && Boolean(formik.errors.user_type)}
              >
                <InputLabel id="user-type-label">User Type</InputLabel>
                <Select
                  labelId="user-type-label"
                  id="user_type"
                  name="user_type"
                  value={formik.values.user_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="User Type"
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
                {formik.touched.user_type && formik.errors.user_type && (
                  <FormHelperText>{formik.errors.user_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="department"
                name="department"
                label="Department"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.department && Boolean(formik.errors.department)}
                helperText={formik.touched.department && formik.errors.department}
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <TextField
            fullWidth
            id="phone_number"
            name="phone_number"
            label="Phone Number (optional)"
            value={formik.values.phone_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
            helperText={formik.touched.phone_number && formik.errors.phone_number}
            margin="normal"
          />
          
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            id="password2"
            name="password2"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formik.values.password2}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password2 && Boolean(formik.errors.password2)}
            helperText={formik.touched.password2 && formik.errors.password2}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={toggleShowConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={formik.isSubmitting}
            sx={{ mt: 2, py: 1.5 }}
            startIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <UserPlus size={20} />}
          >
            {formik.isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in instead
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;