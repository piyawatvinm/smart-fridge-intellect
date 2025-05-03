import { Layout } from "@/components/LayoutComponents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, ShoppingCart, BarChart, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthComponents";

interface FoodItem {
  id: string;
  name: string;
  daysLeft: number;
  category: string;
  status: 'expired' | 'warning' | 'ok';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expiringItems, setExpiringItems] = useState<FoodItem[]>([]);
  const { getUser } = useAuth();
  const user = getUser();
  
  // Fetch user's ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('ingredients')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching ingredients:', error);
          return;
        }
        
        if (data && data.length > 0) {
          // Process ingredients data
          const items: FoodItem[] = data.map(ing => {
            const expiryDate = new Date(ing.expiry_date);
            const today = new Date();
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let status: 'expired' | 'warning' | 'ok';
            if (diffDays < 0) {
              status = 'expired';
            } else if (diffDays <= 3) {
              status = 'warning';
            } else {
              status = 'ok';
            }
            
            return {
              id: ing.id,
              name: ing.name,
              daysLeft: diffDays,
              category: ing.category || 'Uncategorized',
              status: status
            };
          });
          
          setExpiringItems(items);
        }
      } catch (error) {
        console.error('Error processing ingredients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    setLoading(true);
    fetchIngredients();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'expired': return 'bg-fridge-red';
      case 'warning': return 'bg-fridge-orange';
      case 'ok': return 'bg-fridge-green';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: string, daysLeft: number) => {
    switch(status) {
      case 'expired': 
        return <Badge variant="destructive">Expired</Badge>;
      case 'warning': 
        return <Badge className="bg-fridge-orange">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</Badge>;
      case 'ok': 
        return <Badge className="bg-fridge-green">{daysLeft} days left</Badge>;
      default: 
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to your Smart Fridge</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your ingredients</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <AlertTriangle className="h-5 w-5 text-fridge-red mr-2" />
                Expiring Soon
              </CardTitle>
              <CardDescription>Ingredients that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <div className="h-9 w-16 shimmer rounded"></div>
                ) : (
                  expiringItems.filter(item => item.status === 'warning').length
                )}
              </div>
              <div className="mt-2">
                <Progress 
                  value={70} 
                  className="h-2 bg-gray-200"
                  // Removed the indicatorClassName prop
                />
                <div className="h-2 w-[70%] bg-fridge-orange rounded-full -mt-2"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Clock className="h-5 w-5 text-fridge-green mr-2" />
                Fresh Items
              </CardTitle>
              <CardDescription>Ingredients in good condition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <div className="h-9 w-16 shimmer rounded"></div>
                ) : (
                  expiringItems.filter(item => item.status === 'ok').length
                )}
              </div>
              <div className="mt-2">
                <Progress 
                  value={30} 
                  className="h-2 bg-gray-200"
                  // Removed the indicatorClassName prop
                />
                <div className="h-2 w-[30%] bg-fridge-green rounded-full -mt-2"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <ShoppingCart className="h-5 w-5 text-fridge-blue mr-2" />
                Shopping List
              </CardTitle>
              <CardDescription>Items you need to buy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? (
                  <div className="h-9 w-16 shimmer rounded"></div>
                ) : (
                  "5"
                )}
              </div>
              <div className="mt-2">
                <Progress 
                  value={50} 
                  className="h-2 bg-gray-200" 
                  // Removed the indicatorClassName prop
                />
                <div className="h-2 w-[50%] bg-fridge-blue rounded-full -mt-2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Ingredients</CardTitle>
            <CardDescription>
              Monitor the shelf life of your ingredients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expiring">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="h-16 shimmer rounded-md"></div>
                  ))
                ) : (
                  expiringItems.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-8 rounded-full ${getStatusColor(item.status)}`}></div>
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(item.status, item.daysLeft)}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="expiring" className="space-y-4">
                {loading ? (
                  Array(2).fill(0).map((_, index) => (
                    <div key={index} className="h-16 shimmer rounded-md"></div>
                  ))
                ) : (
                  expiringItems
                    .filter(item => item.status === 'warning')
                    .map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-8 rounded-full ${getStatusColor(item.status)}`}></div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(item.status, item.daysLeft)}
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>
              
              <TabsContent value="expired" className="space-y-4">
                {loading ? (
                  Array(2).fill(0).map((_, index) => (
                    <div key={index} className="h-16 shimmer rounded-md"></div>
                  ))
                ) : (
                  expiringItems
                    .filter(item => item.status === 'expired')
                    .map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-8 rounded-full ${getStatusColor(item.status)}`}></div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(item.status, item.daysLeft)}
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-fridge-blue" />
                Consumption Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {loading ? (
                  <div className="w-full h-full shimmer rounded-md"></div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Analytics chart will be displayed here</p>
                    <p className="text-sm mt-2">Track your food consumption patterns</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-fridge-blue" />
                This Week's Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  Array(4).fill(0).map((_, index) => (
                    <div key={index} className="h-12 shimmer rounded-md"></div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Monday</h3>
                        <p className="text-sm text-gray-500">Pasta with Tomato Sauce</p>
                      </div>
                      <Badge className="bg-fridge-blue">Dinner</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Wednesday</h3>
                        <p className="text-sm text-gray-500">Chicken Salad</p>
                      </div>
                      <Badge className="bg-fridge-blue">Lunch</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Friday</h3>
                        <p className="text-sm text-gray-500">Vegetable Stir Fry</p>
                      </div>
                      <Badge className="bg-fridge-blue">Dinner</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">Saturday</h3>
                        <p className="text-sm text-gray-500">Pizza Night</p>
                      </div>
                      <Badge className="bg-fridge-blue">Dinner</Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
