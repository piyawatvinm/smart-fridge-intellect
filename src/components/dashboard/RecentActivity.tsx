
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ShoppingCart, ListPlus, Receipt, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthComponents';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'cart' | 'shopping_list' | 'receipt' | 'ingredient';
  title: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUser } = useAuth();
  const user = getUser();
  
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch recent cart items
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select('id, created_at, product:product_id(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (cartError) throw cartError;
        
        // Fetch recent shopping lists
        const { data: shoppingLists, error: listsError } = await supabase
          .from('shopping_lists')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (listsError) throw listsError;
        
        // Fetch recent receipts
        const { data: receipts, error: receiptsError } = await supabase
          .from('receipts')
          .select('id, store:store_id(name), purchase_date, total_amount')
          .eq('user_id', user.id)
          .order('purchase_date', { ascending: false })
          .limit(3);
        
        if (receiptsError) throw receiptsError;
        
        // Combine and format the activities
        const allActivities: ActivityItem[] = [
          ...(cartItems || []).map(item => ({
            id: `cart-${item.id}`,
            type: 'cart' as const,
            title: `Added ${item.product?.name || 'an item'} to cart`,
            timestamp: item.created_at,
          })),
          ...(shoppingLists || []).map(list => ({
            id: `list-${list.id}`,
            type: 'shopping_list' as const,
            title: `Created "${list.name}" shopping list`,
            timestamp: list.created_at,
          })),
          ...(receipts || []).map(receipt => ({
            id: `receipt-${receipt.id}`,
            type: 'receipt' as const,
            title: `Added receipt from ${receipt.store?.name || 'store'}`,
            timestamp: receipt.purchase_date,
            metadata: {
              amount: receipt.total_amount
            }
          })),
        ];
        
        // Sort by timestamp (most recent first) and take top 5
        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
        
        setActivities(sortedActivities);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentActivity();
  }, [user?.id]);

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'shopping_list':
        return <ListPlus className="h-4 w-4" />;
      case 'receipt':
        return <Receipt className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Get badge color for activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'cart':
        return 'bg-purple-100 text-purple-500';
      case 'shopping_list':
        return 'bg-green-100 text-green-500';
      case 'receipt':
        return 'bg-amber-100 text-amber-500';
      default:
        return 'bg-blue-100 text-blue-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Activity className="h-5 w-5 text-gray-500 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recent activity to show.
          </div>
        ) : (
          <ul>
            {activities.map((activity) => (
              <li 
                key={activity.id} 
                className="border-b last:border-b-0 p-4 flex items-center"
              >
                <div className={`rounded-full p-2 mr-3 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  <div className="text-sm font-medium">{activity.title}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
