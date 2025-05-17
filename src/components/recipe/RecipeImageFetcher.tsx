
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';
import { useRecipeImages } from '@/hooks/useRecipeImages';

export const RecipeImageFetcher: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="mb-4">
      <Button 
        onClick={fetchAllRecipeImages} 
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Fetching images ({progress.completed}/{progress.total})
          </>
        ) : (
          'Fetch Recipe Images'
        )}
      </Button>
    </div>
  );
};
