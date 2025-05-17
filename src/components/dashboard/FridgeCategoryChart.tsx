
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple, Beef, Bread, Cheese, Coffee, Fish, GrapeIcon, LeafyGreen, Milk, Pizza } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FridgeCategoryChartProps {
  fridgeStats: {
    totalIngredients: number;
    expiringSoon: number;
    expired: number;
    categories: Record<string, number>;
  };
}

export const FridgeCategoryChart: React.FC<FridgeCategoryChartProps> = ({ fridgeStats }) => {
  const navigate = useNavigate();

  // Icons for different food categories
  const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
    'Vegetables': LeafyGreen,
    'Fruits': Apple,
    'Meat': Beef,
    'Dairy': Milk,
    'Grains': Bread,
    'Beverages': Coffee,
    'Seafood': Fish,
    'Cheese': Cheese,
    'Prepared': Pizza,
    'Fruits & Berries': GrapeIcon,
  };

  // Default icon for unknown categories
  const DefaultIcon = LeafyGreen;

  // Transform categories data into sorted array
  const sortedCategories = Object.entries(fridgeStats.categories || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Generate suggestion based on category distribution
  const generateSuggestion = () => {
    if (sortedCategories.length === 0) return "Add ingredients to see category breakdown";
    
    if (sortedCategories.length === 1) {
      return `All your fridge items are ${sortedCategories[0].name.toLowerCase()}`;
    }
    
    const mostCommon = sortedCategories[0];
    const leastCommon = sortedCategories[sortedCategories.length - 1];
    
    if (mostCommon.count > fridgeStats.totalIngredients * 0.5) {
      return `Most of your fridge is ${mostCommon.name.toLowerCase()}`;
    }
    
    if (leastCommon.count === 1) {
      return `You only have 1 ${leastCommon.name.toLowerCase()} item`;
    }
    
    return `You have a good variety of foods`;
  };

  const handleCategoryClick = (category: string) => {
    // Navigate to ingredients page with category filter
    navigate(`/ingredients?category=${encodeURIComponent(category)}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Food Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No ingredients added yet</p>
            <p className="text-sm mt-2">Add ingredients to see your food categories</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {sortedCategories.map((category) => {
                const IconComponent = CATEGORY_ICONS[category.name] || DefaultIcon;
                const isEmpty = category.count === 0;
                
                return (
                  <div
                    key={category.name}
                    className={`flex items-center p-2 rounded-md border cursor-pointer transition-colors ${
                      isEmpty ? 'opacity-50 bg-gray-50' : 'hover:bg-muted'
                    }`}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <div className={`p-2 rounded-full ${isEmpty ? 'bg-gray-100' : 'bg-primary/10'} mr-3`}>
                      <IconComponent className={`h-4 w-4 ${isEmpty ? 'text-gray-400' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.count} {category.count === 1 ? 'item' : 'items'}
                        {isEmpty && ' (Restock?)'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-2 p-3 bg-muted/30 rounded-md">
              <p className="text-sm text-muted-foreground">{generateSuggestion()}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
