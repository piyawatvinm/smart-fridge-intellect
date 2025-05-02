
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthComponents';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authed = await isAuthenticated();
      setIsAuthed(authed);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [isAuthenticated]);
  
  // Show loading state while checking authentication
  if (loading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-fridge-blue animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthed) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
