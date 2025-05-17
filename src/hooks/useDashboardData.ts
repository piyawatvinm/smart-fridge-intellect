
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  initializeStores as generateMockStores, 
  initializeProducts as generateMockProducts, 
  initializeIngredients as generateMockIngredients 
} from '@/utils/seedData';
import { toast } from 'sonner';

export const useDashboardData = (userId: string | undefined) => {
  const [dataInitialized, setDataInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!userId || dataInitialized || isInitializing) return;
    
    const checkAndInitializeMockData = async () => {
      setIsInitializing(true);
      try {
        // Check if user already has ingredients
        const { data: existingIngredients, error: ingredientsError } = await supabase
          .from('ingredients')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
          
        if (ingredientsError) {
          console.error('Error checking for existing ingredients:', ingredientsError);
          setIsInitializing(false);
          return;
        }
        
        // Check if user already has products
        const { data: existingProducts, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
          
        if (productsError) {
          console.error('Error checking for existing products:', productsError);
          setIsInitializing(false);
          return;
        }
        
        // Check if there are already stores
        const { data: existingStores, error: storesError } = await supabase
          .from('stores')
          .select('id')
          .limit(1);
          
        if (storesError) {
          console.error('Error checking for existing stores:', storesError);
          setIsInitializing(false);
          return;
        }

        // If any data already exists, don't initialize
        if (
          (existingIngredients && existingIngredients.length > 0) ||
          (existingProducts && existingProducts.length > 0) ||
          (existingStores && existingStores.length > 0)
        ) {
          console.log('Data already exists, skipping initialization');
          setDataInitialized(true);
          setIsInitializing(false);
          return;
        }
        
        // If no data exists, initialize mock data
        console.log('No existing data found, generating mock data');
        
        // Generate stores first
        await generateMockStores(userId);
        
        // Generate products with store associations
        await generateMockProducts(userId);
        
        // Generate some initial ingredients
        await generateMockIngredients(userId);
        
        // Show toast only once per session
        toast.success('Welcome to Smart Fridge! Sample data has been generated for you.', {
          duration: 5000,
          id: 'mock-data-init'
        });

        setDataInitialized(true);
      } catch (error) {
        console.error('Error checking and initializing mock data:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    checkAndInitializeMockData();
  }, [userId, dataInitialized, isInitializing]);

  return {
    dataInitialized
  };
};
