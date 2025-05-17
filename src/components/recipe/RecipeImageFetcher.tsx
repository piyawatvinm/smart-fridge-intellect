
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader, RefreshCw, ImagePlus } from 'lucide-react';
import { useRecipeImages } from '@/hooks/useRecipeImages';

export const RecipeImageFetcher: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const { fetchImageForRecipe } = useRecipeImages();

  const fetchAllRecipeImages = async () => {
    setIsLoading(true);
    try {
      // Fetch all recipes that don't have an image URL yet
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name')
        .is('image_url', null);
        
      if (error) throw error;
      
      if (!recipes || recipes.length === 0) {
        toast({
          title: 'No recipes to update',
          description: 'All recipes already have images.',
        });
        setIsLoading(false);
        return;
      }
      
      setProgress({ completed: 0, total: recipes.length });
      
      // Process recipes in batches of 5 to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < recipes.length; i += batchSize) {
        const batch = recipes.slice(i, i + batchSize);
        
        // Process each batch in parallel
        await Promise.all(
          batch.map(async (recipe) => {
            await fetchImageForRecipe(recipe.id, recipe.name);
            setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
          })
        );
        
        // Add a small delay between batches to avoid overwhelming the API
        if (i + batchSize < recipes.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast({
        title: 'Images updated',
        description: `Updated ${recipes.length} recipes with images.`,
      });
    } catch (error) {
      console.error('Error updating recipe images:', error);
      toast({
        title: 'Error updating images',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateRecipeImages = async () => {
    setIsValidating(true);
    try {
      // Call the edge function to validate and fix all recipe images
      const { data, error } = await supabase.functions.invoke('recipe-images-cron', {});
      
      if (error) throw error;
      
      toast({
        title: 'Image validation complete',
        description: data.message,
      });
      
      console.log('Image validation results:', data);
    } catch (error) {
      console.error('Error validating recipe images:', error);
      toast({
        title: 'Error validating images',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const replaceAllRecipeImages = async () => {
    setIsReplacing(true);
    try {
      // Fetch ALL recipes regardless of whether they have an image URL
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id, name');
        
      if (error) throw error;
      
      if (!recipes || recipes.length === 0) {
        toast({
          title: 'No recipes found',
          description: 'There are no recipes in the database.',
        });
        setIsReplacing(false);
        return;
      }
      
      setProgress({ completed: 0, total: recipes.length });
      
      // First, clear all existing image URLs
      const { error: clearError } = await supabase
        .from('recipes')
        .update({ image_url: null })
        .in('id', recipes.map(r => r.id));
      
      if (clearError) throw clearError;
      
      // Process recipes in batches of 5 to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < recipes.length; i += batchSize) {
        const batch = recipes.slice(i, i + batchSize);
        
        // Process each batch in parallel
        await Promise.all(
          batch.map(async (recipe) => {
            await fetchImageForRecipe(recipe.id, recipe.name);
            setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
          })
        );
        
        // Add a small delay between batches to avoid overwhelming the API
        if (i + batchSize < recipes.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast({
        title: 'Images replaced',
        description: `Replaced images for ${recipes.length} recipes with new ones from Pexels.`,
      });
    } catch (error) {
      console.error('Error replacing recipe images:', error);
      toast({
        title: 'Error replacing images',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <Button 
        onClick={fetchAllRecipeImages} 
        disabled={isLoading || isValidating || isReplacing}
        variant="outline"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Fetching images ({progress.completed}/{progress.total})
          </>
        ) : (
          'Fetch Missing Recipe Images'
        )}
      </Button>
      
      <Button 
        onClick={validateRecipeImages} 
        disabled={isLoading || isValidating || isReplacing}
        variant="outline"
      >
        {isValidating ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Validating images...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Validate & Fix All Recipe Images
          </>
        )}
      </Button>
      
      <Button 
        onClick={replaceAllRecipeImages} 
        disabled={isLoading || isValidating || isReplacing}
        variant="default"
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isReplacing ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Replacing images ({progress.completed}/{progress.total})
          </>
        ) : (
          <>
            <ImagePlus className="mr-2 h-4 w-4" />
            Replace All Recipe Images
          </>
        )}
      </Button>
    </div>
  );
};
