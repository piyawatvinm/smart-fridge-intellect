
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthComponents';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Ingredient {
  id: string;
  name: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  matchPercentage: number;
  availableCount: number;
  totalCount: number;
}

export const CookableRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCookableRecipes = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch user's available ingredients
        const { data: userIngredients, error: ingredientsError } = await supabase
          .from('ingredients')
          .select('name')
          .eq('user_id', user.id);
        
        if (ingredientsError) throw ingredientsError;
        
        const availableIngredients = new Set(
          (userIngredients || []).map(ingredient => ingredient.name.toLowerCase())
        );
        
        // Fetch all recipes with their ingredients
        const { data: allRecipes, error: recipesError } = await supabase
          .from('recipes')
          .select('*, recipe_ingredients(ingredient_name)');
        
        if (recipesError) throw recipesError;
        
        // Calculate match percentage for each recipe
        const recipesWithMatches = allRecipes.map((recipe: any) => {
          const recipeIngredients = recipe.recipe_ingredients || [];
          const totalIngredients = recipeIngredients.length;
          
          if (totalIngredients === 0) {
            return { ...recipe, matchPercentage: 0, availableCount: 0, totalCount: 0 };
          }
          
          const availableCount = recipeIngredients.filter((item: any) => 
            availableIngredients.has(item.ingredient_name.toLowerCase())
          ).length;
          
          const matchPercentage = Math.round((availableCount / totalIngredients) * 100);
          
          return {
            ...recipe,
            matchPercentage,
            availableCount,
            totalCount: totalIngredients
          };
        });
        
        // Sort by match percentage (highest first) and take top 3
        const topRecipes = recipesWithMatches
          .sort((a: Recipe, b: Recipe) => b.matchPercentage - a.matchPercentage)
          .slice(0, 3);
        
        setRecipes(topRecipes);
      } catch (error) {
        console.error('Error fetching cookable recipes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCookableRecipes();
  }, [user?.id]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-green-50/50">
        <CardTitle className="text-lg flex items-center">
          <ChefHat className="h-5 w-5 text-green-500 mr-2" />
          Top Cookable Recipes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : recipes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recipes found. Try adding more ingredients!
          </div>
        ) : (
          <>
            <ul>
              {recipes.map((recipe) => (
                <li 
                  key={recipe.id} 
                  className="border-b last:border-b-0 p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{recipe.name}</div>
                    <Badge 
                      variant={recipe.matchPercentage > 80 ? 'success' : 'default'}
                      className="ml-2"
                    >
                      {recipe.matchPercentage}% match
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {recipe.description?.substring(0, 80)}
                    {recipe.description?.length > 80 ? '...' : ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    {recipe.availableCount}/{recipe.totalCount} ingredients available
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50">
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => navigate('/ai-recipes')}
              >
                View All Recipes
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
