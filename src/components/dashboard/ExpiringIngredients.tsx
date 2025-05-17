
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthComponents';
import { differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface IngredientItem {
  id: string;
  name: string;
  expiry_date: string;
  quantity: number;
  unit: string;
  category?: string;
}

export const ExpiringIngredients = () => {
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpiringIngredients = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Get current date
        const now = new Date();
        // Calculate date 5 days from now
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + 5);
        
        // Format dates for Supabase query
        const formattedNow = now.toISOString().split('T')[0];
        const formattedFuture = futureDate.toISOString().split('T')[0];
        
        // Fetch ingredients expiring within 5 days
        const { data, error } = await supabase
          .from('ingredients')
          .select('*')
          .eq('user_id', user.id)
          .gte('expiry_date', formattedNow)
          .lte('expiry_date', formattedFuture)
          .order('expiry_date', { ascending: true })
          .limit(5);
        
        if (error) throw error;
        
        setIngredients(data || []);
      } catch (error) {
        console.error('Error fetching expiring ingredients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpiringIngredients();
  }, [user?.id]);

  // Calculate days until expiry
  const daysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return differenceInDays(expiry, now);
  };

  // Get badge variant based on days remaining
  const getExpiryBadgeVariant = (days: number): "default" | "secondary" | "destructive" | "outline" | "success" | null | undefined => {
    if (days <= 1) return "destructive";
    if (days <= 3) return "default";
    return "secondary";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-amber-50/50">
        <CardTitle className="text-lg flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          Expiring Soon
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : ingredients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No ingredients expiring soon. Great job!
          </div>
        ) : (
          <>
            <ul>
              {ingredients.map((item) => (
                <li 
                  key={item.id} 
                  className="border-b last:border-b-0 p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                  <Badge variant={getExpiryBadgeVariant(daysUntilExpiry(item.expiry_date))}>
                    {daysUntilExpiry(item.expiry_date) <= 0
                      ? 'Expires today'
                      : daysUntilExpiry(item.expiry_date) === 1
                      ? '1 day left'
                      : `${daysUntilExpiry(item.expiry_date)} days left`}
                  </Badge>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50">
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => navigate('/ingredients')}
              >
                View All Ingredients
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
