import { Navigate } from 'react-router-dom';
import { getAuthUser } from '../../utils/authStorage.js';

export default function RoleGuard({ allowed = [], children }) {
  const user = getAuthUser();

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}