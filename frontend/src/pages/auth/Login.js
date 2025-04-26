import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { login } from "../../redux/slices/authSlice";
import authService from "../../services/authService";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear any local errors when user starts typing
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      dispatch(login(response));
    } catch (error) {
      console.error("Login error:", error);
      setLocalError(error.message || "Failed to login. Please try again.");
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 2, sm: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 1,
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            Sign in
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            Welcome back to Smart Lab Resource
          </Typography>

          {(error || localError) && (
            <Alert severity="error" sx={{ mt: 2, width: "100%", mb: 2 }}>
              {error || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 1,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
