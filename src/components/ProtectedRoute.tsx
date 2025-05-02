
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthComponents';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Make sure we check authentication status correctly
  if (!isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
