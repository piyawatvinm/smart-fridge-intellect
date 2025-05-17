
import { Navigate } from 'react-router-dom';
import { initializeAppData } from '@/utils/seedData';
import { useEffect } from 'react';

const Index = () => {
  // Initialize app data when the application starts
  useEffect(() => {
    const initData = async () => {
      try {
        await initializeAppData(null);
      } catch (error) {
        console.error('Error initializing app data:', error);
      }
    };
    
    initData();
  }, []);
  
  // Changed from /products to /ai-recipes to showcase our new feature
  return <Navigate to="/ai-recipes" replace />;
};

export default Index;
