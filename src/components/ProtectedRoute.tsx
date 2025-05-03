
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthComponents';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
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
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
