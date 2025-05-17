
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Refrigerator, AlertTriangle, ShoppingCart, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthComponents';
import { useState, useEffect } from 'react';

interface DashboardCardsProps {
  fridgeStats: {
    totalIngredients: number;
    expiringSoon: number;
    expired: number;
    categories: Record<string, number>;
  };
  fridgeFullnessPercentage: number;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ 
  fridgeStats,
  fridgeFullnessPercentage
}) => {
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const user = getUser();
  const [cartCount, setCartCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchCartAndOrders = async () => {
      try {
        // Fetch cart items count
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select('id')
          .eq('user_id', user.id);
          
        if (cartError) throw cartError;
        setCartCount(cartItems?.length || 0);
        
        // Fetch pending orders count
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending');
          
        if (ordersError) throw ordersError;
        setPendingOrders(orders?.length || 0);
        
      } catch (error) {
        console.error('Error fetching cart/orders data:', error);
      }
    };
    
    fetchCartAndOrders();
  }, [user?.id]);

  // Generate color class based on fullness percentage
  const getFridgeColorClass = () => {
    if (fridgeFullnessPercentage > 80) return 'bg-green-500';
    if (fridgeFullnessPercentage > 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <>
      {/* Fridge Fullness Card */}
      <Card 
        className="overflow-hidden hover:shadow-md transition-all"
        onClick={() => navigate('/ingredients')}
      >
        <CardContent className="p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Refrigerator className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-medium">Fridge Fullness</h3>
            </div>
            <Badge variant={fridgeFullnessPercentage > 80 ? 'success' : 'default'}>
              {fridgeStats.totalIngredients} items
            </Badge>
          </div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{fridgeFullnessPercentage}% full</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getFridgeColorClass()}`}
              style={{ width: `${fridgeFullnessPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Card */}
      <Card 
        className={`overflow-hidden hover:shadow-md transition-all ${
          fridgeStats.expiringSoon > 0 ? 'border-amber-300' : ''
        }`}
        onClick={() => navigate('/ingredients')}
      >
        <CardContent className="p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="font-medium">Expiring Soon</h3>
            </div>
            <Badge variant={fridgeStats.expiringSoon > 0 ? 'default' : 'success'}>
              {fridgeStats.expiringSoon} items
            </Badge>
          </div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{fridgeStats.expiringSoon === 0 
              ? 'No ingredients expiring soon' 
              : `${fridgeStats.expiringSoon} ingredients expiring soon`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-amber-500"
              style={{ width: `${Math.min(100, fridgeStats.expiringSoon * 10)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Cart/Orders Card */}
      <Card 
        className="overflow-hidden hover:shadow-md transition-all"
        onClick={() => navigate('/cart')}
      >
        <CardContent className="p-6 cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-medium">Shopping Cart</h3>
            </div>
            <Badge variant={cartCount > 0 ? 'default' : 'secondary'}>
              {cartCount} items
            </Badge>
          </div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{cartCount === 0 
              ? 'Your cart is empty' 
              : `${cartCount} items in cart`}
            </span>
            {pendingOrders > 0 && (
              <span className="text-blue-500 font-medium">
                {pendingOrders} pending orders
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-purple-500"
              style={{ width: `${Math.min(100, cartCount * 10)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
