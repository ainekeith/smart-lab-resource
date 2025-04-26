import { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import StaffDashboard from '../components/dashboard/StaffDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading for dashboard data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render dashboard based on user type
  switch (user?.user_type) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;