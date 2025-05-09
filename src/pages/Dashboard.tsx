
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { 
  initializeStores as generateMockStores, 
  initializeProducts as generateMockProducts, 
  initializeIngredients as generateMockIngredients 
} from '@/utils/seedData';
import { useAuth } from '@/components/AuthComponents';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, Check } from 'lucide-react';
import { fetchUserIngredients } from '@/lib/supabaseHelpers';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  const [fridgeStats, setFridgeStats] = useState({
    totalIngredients: 0,
    expiringSoon: 0,
    expired: 0,
    categories: {}
  });
  const [loading, setLoading] = useState(true);

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

  // Load fridge data
  useEffect(() => {
    if (!user) return;

    const loadFridgeStats = async () => {
      setLoading(true);
      try {
        const ingredients = await fetchUserIngredients(user.id);
        
        // Calculate stats
        const now = new Date();
        const categoryCounts = {};
        let expiringSoonCount = 0;
        let expiredCount = 0;

        ingredients.forEach(ingredient => {
          // Count by category
          if (ingredient.category) {
            categoryCounts[ingredient.category] = (categoryCounts[ingredient.category] || 0) + 1;
          }

          // Check expiration
          if (ingredient.expiry_date) {
            const expiryDate = new Date(ingredient.expiry_date);
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
              expiredCount++;
            } else if (daysUntilExpiry <= 3) {
              expiringSoonCount++;
            }
          }
        });

        setFridgeStats({
          totalIngredients: ingredients.length,
          expiringSoon: expiringSoonCount,
          expired: expiredCount,
          categories: categoryCounts
        });

      } catch (error) {
        console.error('Error loading fridge stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFridgeStats();
  }, [user]);

  // Calculate fridge fullness (example calculation)
  const fridgeFullnessPercentage = Math.min(100, Math.max(0, 
    fridgeStats.totalIngredients > 0 ? Math.round((fridgeStats.totalIngredients / 50) * 100) : 0
  ));

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Fridge Status Card */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Fridge Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Fridge Fullness</span>
                    <span className="text-sm text-gray-500">{fridgeFullnessPercentage}%</span>
                  </div>
                  <Progress value={fridgeFullnessPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <Card className="bg-gray-50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Total Items</p>
                        <p className="text-xl font-bold">{fridgeStats.totalIngredients}</p>
                      </div>
                      <Check className="h-5 w-5 text-green-500" />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Expiring Soon</p>
                        <p className="text-xl font-bold">{fridgeStats.expiringSoon}</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Expired</p>
                        <p className="text-xl font-bold">{fridgeStats.expired}</p>
                      </div>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </CardContent>
                  </Card>
                </div>

                {fridgeStats.expired > 0 && (
                  <div className="bg-red-50 p-3 mt-3 rounded-md border border-red-200">
                    <p className="text-sm text-red-700 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      You have {fridgeStats.expired} expired ingredients that should be removed
                    </p>
                    <button 
                      className="text-xs text-red-700 underline mt-1"
                      onClick={() => navigate('/ingredients')}
                    >
                      Go to ingredients
                    </button>
                  </div>
                )}

                {fridgeStats.expiringSoon > 0 && fridgeStats.expired === 0 && (
                  <div className="bg-amber-50 p-3 mt-3 rounded-md border border-amber-200">
                    <p className="text-sm text-amber-700 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {fridgeStats.expiringSoon} ingredients are expiring in the next 3 days
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
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
        </div>

        <div className="mt-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
