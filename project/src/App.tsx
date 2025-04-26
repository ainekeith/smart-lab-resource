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
import EquipmentList from './pages/equipment/EquipmentList';
import EquipmentDetails from './pages/equipment/EquipmentDetails';
import EquipmentForm from './pages/equipment/EquipmentForm';
import MaintenanceForm from './pages/equipment/MaintenanceForm';
import BookingList from './pages/bookings/BookingList';
import BookingForm from './pages/bookings/BookingForm';
import BookingDetails from './pages/bookings/BookingDetails';
import InventoryList from './pages/inventory/InventoryList';
import InventoryForm from './pages/inventory/InventoryForm';
import InventoryDetails from './pages/inventory/InventoryDetails';
import StockMovement from './pages/inventory/StockMovement';
import ReportDashboard from './pages/reports/ReportDashboard';
import Settings from './pages/settings/Settings';
import DepartmentList from './pages/admin/DepartmentList';
import RoleManagement from './pages/admin/RoleManagement';
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
                      <EquipmentList />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/equipment/:id" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <EquipmentDetails />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/equipment/new" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <EquipmentForm />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/equipment/:id/edit" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <EquipmentForm />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/equipment/:id/maintenance" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <MaintenanceForm />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BookingList />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings/new" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BookingForm />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings/:id" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BookingDetails />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <InventoryList />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/new" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <InventoryForm />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/:id" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <InventoryDetails />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/:id/edit" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <InventoryForm />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory/:id/movement" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <StockMovement />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute requiredRole="staff">
                    <MainLayout>
                      <ReportDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/departments" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <MainLayout>
                      <DepartmentList />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/roles" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <MainLayout>
                      <RoleManagement />
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