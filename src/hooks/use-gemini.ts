
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseGeminiProps {
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface GenerateRecipeOptions {
  availableIngredients?: string[];
  missingIngredients?: string[];
}

export function useGemini({ onSuccess, onError }: UseGeminiProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generateContent = async (prompt: string) => {
    if (!prompt.trim()) {
      const error = new Error('Prompt cannot be empty');
      setError(error);
      onError?.(error);
      toast({
        title: 'Error',
        description: 'Prompt cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini', {
        body: { prompt },
      });

      if (error) throw new Error(error.message);
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.text);
      onSuccess?.(data.text);
      return data.text;
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      const error = err instanceof Error ? err : new Error('Failed to generate content');
      setError(error);
      onError?.(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecipe = async (options: GenerateRecipeOptions = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { availableIngredients = [], missingIngredients = [] } = options;
      
      if (availableIngredients.length === 0 && missingIngredients.length === 0) {
        throw new Error('At least one ingredient (available or missing) is required');
      }
      
      const { data, error } = await supabase.functions.invoke('gemini', {
        body: { 
          recipeMode: true, 
          availableIngredients,
          missingIngredients,
        },
      });

      if (error) throw new Error(error.message);
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.text);
      onSuccess?.(data.text);
      return data.text;
    } catch (err) {
      console.error('Error generating recipe with Gemini API:', err);
      const error = err instanceof Error ? err : new Error('Failed to generate recipe');
      setError(error);
      onError?.(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateContent,
    generateRecipe,
    isLoading,
    result,
    error,
  };
}
