import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
  const { auth, isAuthenticated } = useContext(AuthContext);

  if (!auth || !isAuthenticated) {
    return <Navigate to="/l/home" replace />;
  }

  // If a specific role is required, validate it
  if (role && auth.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
