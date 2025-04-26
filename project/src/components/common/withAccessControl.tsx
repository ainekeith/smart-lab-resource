import { ComponentType, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AccessDeniedDialog from './AccessDeniedDialog';

interface AccessControlProps {
  requiredRoles?: ('admin' | 'staff' | 'student')[];
  requiredPermissions?: string[];
}

export const withAccessControl = <P extends object>(
  WrappedComponent: ComponentType<P>,
  { requiredRoles, requiredPermissions }: AccessControlProps
) => {
  return (props: P) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [showAccessDenied, setShowAccessDenied] = useState(false);

    useEffect(() => {
      if (!user) return;

      const hasRequiredRole = requiredRoles 
        ? requiredRoles.includes(user.user_type)
        : true;

      // Here you can add more complex permission checks if needed
      const hasRequiredPermissions = true; // Implement based on your permission system

      if (!hasRequiredRole || !hasRequiredPermissions) {
        setShowAccessDenied(true);
      }
    }, [user]);

    if (!user) return null;

    return (
      <>
        {!showAccessDenied && <WrappedComponent {...props} />}
        <AccessDeniedDialog
          open={showAccessDenied}
          onClose={() => setShowAccessDenied(false)}
          message={
            requiredRoles
              ? `This section requires ${requiredRoles.join(' or ')} access.`
              : "You don't have permission to access this section."
          }
        />
      </>
    );
  };
};