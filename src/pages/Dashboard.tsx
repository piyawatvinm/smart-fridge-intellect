
import React, { useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { 
  initializeStores as generateMockStores, 
  initializeProducts as generateMockProducts, 
  initializeIngredients as generateMockIngredients 
} from '@/utils/seedData';
import { useAuth } from '@/components/AuthComponents';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { getUser } = useAuth();
  const user = getUser();

  // Generate mock data when the dashboard loads for the first time
  useEffect(() => {
    if (!user) return;
    
    const initializeMockData = async () => {
      try {
        // Generate stores first
        await generateMockStores(user.id);
        
        // Generate products with store associations
        await generateMockProducts(user.id);
        
        // Generate some initial ingredients
        await generateMockIngredients(user.id);
        
        toast.success('Welcome to Smart Fridge! Sample data has been generated for you.', {
          duration: 5000,
          id: 'mock-data-init'
        });
      } catch (error) {
        console.error('Error initializing mock data:', error);
      }
    };
    
    initializeMockData();
  }, [user]);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Welcome to Smart Fridge</h2>
            <p className="text-gray-600 mb-4">
              Your intelligent kitchen management system. Keep track of your ingredients,
              get recipe recommendations, and efficiently manage your grocery shopping.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Track ingredients and expiry dates</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm">Get personalized recipe recommendations</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-sm">Order missing ingredients quickly</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-sm">Reduce food waste and save money</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/ingredients"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src="/lovable-uploads/7bdceca8-ab1b-4b15-9380-3f882c3dcd0a.png"
                  alt="Ingredients"
                  className="w-12 h-12 object-contain mb-2"
                />
                <span className="text-sm font-medium">Manage Ingredients</span>
              </a>
              
              <a
                href="/recommendations"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src="/lovable-uploads/03b0a8ee-b8be-4393-9dfb-da609f65d624.png"
                  alt="Recommendations"
                  className="w-12 h-12 object-contain mb-2"
                />
                <span className="text-sm font-medium">Recipe Recommendations</span>
              </a>
              
              <a
                href="/products"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src="/lovable-uploads/9cadcb73-4e65-49e3-ac69-e45f3f42bc1f.png"
                  alt="Products"
                  className="w-12 h-12 object-contain mb-2"
                />
                <span className="text-sm font-medium">Browse Products</span>
              </a>
              
              <a
                href="/my-orders"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src="/lovable-uploads/20043334-4b13-492a-86ca-3d31d67ca0b3.png"
                  alt="Orders"
                  className="w-12 h-12 object-contain mb-2"
                />
                <span className="text-sm font-medium">My Orders</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
