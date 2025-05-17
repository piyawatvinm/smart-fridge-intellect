
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingCart, List } from 'lucide-react';

interface RecommendationNoticeProps {
  isVisible: boolean;
  recipeCount?: number;
  storeCount?: number;
  availableProductCount?: number;
  totalIngredientCount?: number;
}

const RecommendationNotice: React.FC<RecommendationNoticeProps> = ({ 
  isVisible, 
  recipeCount = 0,
  storeCount = 0,
  availableProductCount = 0,
  totalIngredientCount = 0
}) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6">
      <Alert className="bg-blue-50 border-blue-200">
        <ShoppingCart className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 font-medium">Shop for Recipe Ingredients</AlertTitle>
        <AlertDescription className="text-blue-700">
          <p className="mb-2">
            Browse products from various stores to find the ingredients you need for your recipes.
            Add them to your cart and confirm your order to stock your virtual fridge.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{recipeCount > 0 ? `${recipeCount} recipes available with ingredient matching` : 'Get product suggestions for your recipes'}</li>
            <li>Products are available from {storeCount > 0 ? storeCount : 'multiple'} different stores</li>
            {availableProductCount > 0 && totalIngredientCount > 0 && (
              <li><span className="font-medium">{availableProductCount}</span> out of {totalIngredientCount} ingredients have matching products</li>
            )}
            <li>Compare prices between stores</li>
            <li>Once ordered, items will appear in your ingredients list</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RecommendationNotice;
