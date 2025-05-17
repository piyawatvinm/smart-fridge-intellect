
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthComponents';
import { toast } from 'sonner';

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  preparation_time?: string;
  difficulty?: string;
  recipe_ingredients: {
    id: string;
    ingredient_name: string;
    quantity: number;
    unit: string;
  }[];
}

export const ChefSuggestion = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUser } = useAuth();
  const user = getUser();
  
  useEffect(() => {
    const fetchDailyRecipe = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Get today's date as string for consistent recipe selection
        const today = new Date().toISOString().split('T')[0];
        
        // Use a deterministic method to select a "daily" recipe
        // We'll use the current date as a seed for selection
        const { data: recipes, error } = await supabase
          .from('recipes')
          .select('*, recipe_ingredients(*)')
          .limit(10);
        
        if (error) throw error;
        
        if (recipes && recipes.length > 0) {
          // Use the day of month to select a recipe (cyclic selection)
          const dayOfMonth = new Date().getDate();
          const recipeIndex = dayOfMonth % recipes.length;
          setRecipe(recipes[recipeIndex]);
        }
      } catch (error) {
        console.error('Error fetching daily recipe:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyRecipe();
  }, [user?.id]);

  const addToShoppingList = async () => {
    if (!recipe || !user?.id) return;
    
    try {
      // Create a new shopping list
      const listName = `Recipe: ${recipe.name}`;
      const { data: shoppingList, error: listError } = await supabase
        .from('shopping_lists')
        .insert({ name: listName, user_id: user.id })
        .select('id')
        .single();
      
      if (listError) throw listError;
      
      // Add recipe ingredients to the shopping list
      if (recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0) {
        const shoppingItems = recipe.recipe_ingredients.map(ingredient => ({
          shopping_list_id: shoppingList.id,
          name: ingredient.ingredient_name,
          quantity: ingredient.quantity,
          unit: ingredient.unit || 'unit',
        }));
        
        const { error: itemsError } = await supabase
          .from('shopping_list_items')
          .insert(shoppingItems);
        
        if (itemsError) throw itemsError;
        
        toast.success('Recipe ingredients added to shopping list!');
      }
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast.error('Failed to add ingredients to shopping list');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-50/50">
        <CardTitle className="text-lg flex items-center">
          <ChefHat className="h-5 w-5 text-blue-500 mr-2" />
          Chef's Suggestion
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="text-center py-8">Loading today's suggestion...</div>
        ) : !recipe ? (
          <div className="text-center py-8 text-gray-500">
            No recipe suggestions available right now.
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{recipe.name}</h3>
              {recipe.difficulty && (
                <Badge variant="secondary">{recipe.difficulty}</Badge>
              )}
            </div>
            
            {recipe.image_url && (
              <div className="aspect-video w-full overflow-hidden rounded-md mb-4">
                <img 
                  src={recipe.image_url} 
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <p className="text-gray-600 mb-4">
              {recipe.description?.substring(0, 150)}
              {recipe.description?.length > 150 ? '...' : ''}
            </p>
            
            {recipe.preparation_time && (
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Clock className="h-4 w-4 mr-1" />
                <span>{recipe.preparation_time}</span>
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={addToShoppingList}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredients to Shopping List
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
