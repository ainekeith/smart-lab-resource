import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAccess = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const hasRole = (roles: ('admin' | 'staff' | 'student')[]) => {
    if (!user) return false;
    return roles.includes(user.user_type);
  };

  const isAdmin = () => user?.user_type === 'admin';
  const isStaff = () => user?.user_type === 'staff';
  const isStudent = () => user?.user_type === 'student';

  return {
    hasRole,
    isAdmin,
    isStaff,
    isStudent,
  };
};