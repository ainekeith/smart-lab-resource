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
} from '@mui/material';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';

const loginSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null);
      try {
        const resultAction = await dispatch(login(values));
        if (login.fulfilled.match(resultAction)) {
          navigate('/dashboard');
        } else if (login.rejected.match(resultAction)) {
          setLoginError(resultAction.payload?.detail || 'Login failed');
        }
      } catch (error) {
        setLoginError('An unexpected error occurred');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Smart Lab Management
        </Typography>
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Sign In
        </Typography>
        
        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginError}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
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
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={formik.isSubmitting}
            sx={{ mt: 2, py: 1.5 }}
            startIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <LogIn size={20} />}
          >
            {formik.isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Register here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;