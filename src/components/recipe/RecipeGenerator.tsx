import React, { useState } from 'react';
import { useGemini } from '@/hooks/use-gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ChefHat, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface RecipeGeneratorProps {
  availableIngredients: string[];
  missingIngredients: string[];
  onClose?: () => void;
}

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ 
  availableIngredients, 
  missingIngredients,
  onClose
}) => {
  const [recipe, setRecipe] = useState<string | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<{
    name: string;
    ingredients: string[];
    instructions: string[];
    cookingTime: string;
    difficulty: string;
    alternatives: string[];
  } | null>(null);
  
  const { generateRecipe, isLoading, error } = useGemini({
    onSuccess: (text) => {
      setRecipe(text);
      // Parse the recipe text into structured data
      try {
        const sections: Record<string, string[]> = {};
        let currentSection: string | null = null;
        
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        
        for (const line of lines) {
          if (line.includes(':') && !line.startsWith('-') && !line.startsWith('•')) {
            const [sectionName] = line.split(':');
            currentSection = sectionName.trim();
            sections[currentSection] = [];
            
            // Add the content after the colon to the section if there is any
            const content = line.substring(line.indexOf(':') + 1).trim();
            if (content) sections[currentSection].push(content);
          } else if (currentSection) {
            sections[currentSection].push(line);
          }
        }
        
        // Extract structured data from parsed sections
        setParsedRecipe({
          name: sections['Recipe Name']?.[0] || 'Custom Recipe',
          ingredients: sections['Ingredients'] || [],
          instructions: sections['Instructions'] || [],
          cookingTime: sections['Cooking Time']?.[0] || 'Unknown',
          difficulty: sections['Difficulty']?.[0] || 'Medium',
          alternatives: sections['Alternative Ingredients'] || []
        });
      } catch (err) {
        console.error('Error parsing recipe:', err);
        // Keep the raw text even if parsing fails
      }
    },
  });
  
  const handleGenerateRecipe = async () => {
    await generateRecipe({ availableIngredients, missingIngredients });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChefHat className="mr-2" />
          AI Recipe Generator
        </CardTitle>
        <CardDescription>
          Generate a custom recipe based on your available and missing ingredients
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ingredient Summary */}
        <div className="space-y-2">
          <div>
            <h3 className="font-medium text-sm">Available ingredients ({availableIngredients.length}):</h3>
            <p className="text-sm text-muted-foreground">
              {availableIngredients.length > 0 
                ? availableIngredients.slice(0, 5).join(', ') + (availableIngredients.length > 5 ? '...' : '')
                : 'No available ingredients selected'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm">Missing ingredients ({missingIngredients.length}):</h3>
            <p className="text-sm text-muted-foreground">
              {missingIngredients.length > 0 
                ? missingIngredients.slice(0, 5).join(', ') + (missingIngredients.length > 5 ? '...' : '')
                : 'No missing ingredients selected'}
            </p>
          </div>
        </div>
        
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        
        {/* Generated Recipe Display */}
        {recipe && parsedRecipe ? (
          <div className="mt-4 space-y-4">
            <h2 className="text-xl font-bold">{parsedRecipe.name}</h2>
            
            <div>
              <h3 className="font-medium mb-1">Ingredients:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {parsedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm">{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Instructions:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                {parsedRecipe.instructions.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium">Cooking Time:</span> {parsedRecipe.cookingTime}
              </div>
              <div>
                <span className="font-medium">Difficulty:</span> {parsedRecipe.difficulty}
              </div>
            </div>
            
            {parsedRecipe.alternatives.length > 0 && (
              <div>
                <h3 className="font-medium mb-1">Alternative Ingredients:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {parsedRecipe.alternatives.map((alt, index) => (
                    <li key={index} className="text-sm">{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {!isLoading && (
              <p>Click the button below to generate a custom recipe based on your ingredients</p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          onClick={handleGenerateRecipe}
          disabled={isLoading || (availableIngredients.length === 0 && missingIngredients.length === 0)}
          className="ml-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : recipe ? (
            'Regenerate Recipe'
          ) : (
            'Generate Recipe'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeGenerator;
