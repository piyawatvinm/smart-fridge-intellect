
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingCart, List, CheckCircle } from 'lucide-react';

interface RecommendationNoticeProps {
  isVisible: boolean;
  recipeCount?: number;
  storeCount?: number;
  availableProductCount?: number;
  totalIngredientCount?: number;
  matchedIngredients?: string[];
  unmatchedIngredients?: string[];
}

const RecommendationNotice: React.FC<RecommendationNoticeProps> = ({ 
  isVisible, 
  recipeCount = 0,
  storeCount = 0,
  availableProductCount = 0,
  totalIngredientCount = 0,
  matchedIngredients = [],
  unmatchedIngredients = []
}) => {
  if (!isVisible) return null;

  // Calculate match percentage for display
  const matchPercentage = totalIngredientCount > 0 
    ? Math.round((availableProductCount / totalIngredientCount) * 100)
    : 0;

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
              <li>
                <span className="font-medium">{availableProductCount}</span> out of {totalIngredientCount} ingredients have matching products
                {matchPercentage > 0 && <span className="ml-1 text-xs">({matchPercentage}% match rate)</span>}
              </li>
            )}
            <li>Compare prices between stores</li>
            <li>Once ordered, items will appear in your ingredients list</li>
          </ul>
          
          {matchedIngredients.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-blue-800">Successfully matched ingredients:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {matchedIngredients.map((ingredient, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {unmatchedIngredients.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-blue-800">Ingredients without product matches:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {unmatchedIngredients.map((ingredient, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RecommendationNotice;
