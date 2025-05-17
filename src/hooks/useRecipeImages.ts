import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RecipeImageResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: Error | null;
}

export const useRecipeImages = () => {
  const [results, setResults] = useState<Record<string, RecipeImageResult>>({});

  const fetchImageForRecipe = async (recipeId: string, recipeTitle: string): Promise<string | null> => {
    if (!recipeId || !recipeTitle) return null;
    
    // Mark this recipe as loading
    setResults(prev => ({
      ...prev,
      [recipeId]: { imageUrl: null, isLoading: true, error: null }
    }));
    
    try {
      // First check if we already have the image in Supabase
      const { data: recipe } = await supabase
        .from('recipes')
        .select('image_url')
        .eq('id', recipeId)
        .single();
      
      // If we have an image URL stored, use that
      if (recipe?.image_url) {
        setResults(prev => ({
          ...prev,
          [recipeId]: { imageUrl: recipe.image_url, isLoading: false, error: null }
        }));
        return recipe.image_url;
      }
      
      // Otherwise, call our edge function to get and store an image
      const { data, error } = await supabase.functions.invoke('fetch-recipe-images', {
        body: { recipeId, recipeTitle }
      });
      
      if (error) throw error;
      
      // Update state with the result
      setResults(prev => ({
        ...prev,
        [recipeId]: { imageUrl: data.imageUrl || null, isLoading: false, error: null }
      }));
      
      return data.imageUrl || null;
    } catch (error) {
      console.error('Error fetching recipe image:', error);
      
      // Update state with the error
      setResults(prev => ({
        ...prev,
        [recipeId]: { imageUrl: null, isLoading: false, error: error as Error }
      }));
      
      return null;
    }
  };

  // Function to fetch images for multiple recipes
  const fetchImagesForRecipes = async (recipes: Array<{ id: string, name: string }>) => {
    return Promise.all(recipes.map(recipe => fetchImageForRecipe(recipe.id, recipe.name)));
  };

  // Function to get image for a recipe ID, returns placeholder if not found
  const getRecipeImage = (recipeId: string, defaultImage = '/placeholder.svg'): string => {
    const result = results[recipeId];
    // Return the image URL if we have one, otherwise return default
    return (result && result.imageUrl) ? result.imageUrl : defaultImage;
  };

  return {
    fetchImageForRecipe,
    fetchImagesForRecipes,
    getRecipeImage,
    results
  };
};
