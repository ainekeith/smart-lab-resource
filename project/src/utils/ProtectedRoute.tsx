import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AccessDeniedDialog from '../components/common/AccessDeniedDialog';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff' | 'student';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If a specific role is required, check the user's role
  if (requiredRole && user?.user_type !== requiredRole) {
    return <AccessDeniedDialog 
      open={true}
      onClose={() => {}}
      message={`This section requires ${requiredRole} access.`}
      redirectPath="/dashboard"
    />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;