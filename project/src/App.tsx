import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import MainLayout from './components/layout/MainLayout';
import Landing from './pages/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import ProtectedRoute from './utils/ProtectedRoute';
import { setCredentials } from './store/slices/authSlice';
import authService from './services/auth.service';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Initialize auth state from localStorage
  useEffect(() => {
    const user = authService.getCurrentUser();
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (user && accessToken && refreshToken) {
      store.dispatch(
        setCredentials({
          user,
          accessToken,
          refreshToken,
        })
      );
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SnackbarProvider 
          maxSnack={3} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={5000}
        >
          <Router>
            <CssBaseline />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/equipment" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Equipment />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;