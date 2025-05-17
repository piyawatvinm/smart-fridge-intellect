
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Receipt, UtensilsCrossed, ListTodo, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to help you manage your kitchen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 gap-2"
            onClick={() => navigate('/shopping-list')}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Shopping Lists</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 gap-2"
            onClick={() => navigate('/ingredients')}
          >
            <UtensilsCrossed className="h-5 w-5" />
            <span>Manage Ingredients</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 gap-2"
            onClick={() => navigate('/receipt')}
          >
            <Receipt className="h-5 w-5" />
            <span>Scan Receipt</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 gap-2"
            onClick={() => navigate('/orders')}
          >
            <ListTodo className="h-5 w-5" />
            <span>Track Orders</span>
          </Button>
          
          {/* Add new Generate Recipe button */}
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            onClick={() => navigate('/generate-recipe')}
          >
            <ChefHat className="h-5 w-5" />
            <span>Generate Recipes</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
