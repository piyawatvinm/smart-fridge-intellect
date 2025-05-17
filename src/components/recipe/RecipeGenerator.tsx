
import React, { useState } from 'react';
import { useGemini } from '@/hooks/use-gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ChefHat, Loader2, ShoppingCart } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthComponents';
import { addToCart } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RecipeGeneratorProps {
  availableIngredients: string[];
  missingIngredients: string[];
  onClose?: () => void;
}

interface ParsedRecipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
  alternatives: string[];
  matchScore?: string;
  availableIngredients?: string[];
  missingIngredients?: string[];
}

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ 
  availableIngredients, 
  missingIngredients,
  onClose
}) => {
  const [recipe, setRecipe] = useState<string | null>(null);
  const [parsedRecipes, setParsedRecipes] = useState<ParsedRecipe[]>([]);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  const [generateMultiple, setGenerateMultiple] = useState(true);
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  
  const { generateRecipe, isLoading, error } = useGemini({
    onSuccess: (text) => {
      setRecipe(text);
      
      try {
        if (generateMultiple) {
          // Parse multiple recipes
          const recipes: ParsedRecipe[] = [];
          const recipeBlocks = text.split(/RECIPE OPTION \d+:/g).filter(block => block.trim());
          
          recipeBlocks.forEach(block => {
            const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
            const recipe: Partial<ParsedRecipe> = {
              ingredients: [],
              instructions: [],
              availableIngredients: [],
              missingIngredients: [],
              alternatives: []
            };
            
            let currentSection: string | null = null;
            
            for (const line of lines) {
              if (line.includes(':')) {
                const [sectionName, content] = line.split(':').map(s => s.trim());
                currentSection = sectionName.toLowerCase();
                
                if (content) {
                  if (currentSection === 'recipe name') recipe.name = content;
                  else if (currentSection === 'match score') recipe.matchScore = content;
                  else if (currentSection === 'cooking time') recipe.cookingTime = content;
                  else if (currentSection === 'difficulty') recipe.difficulty = content;
                  else if (currentSection === 'available') {
                    recipe.availableIngredients = recipe.availableIngredients || [];
                    recipe.availableIngredients.push(content);
                  }
                  else if (currentSection === 'missing') {
                    recipe.missingIngredients = recipe.missingIngredients || [];
                    recipe.missingIngredients.push(content);
                  }
                }
              } else if (currentSection) {
                if (currentSection === 'ingredients') {
                  if (line.startsWith('- Available:')) {
                    currentSection = 'available';
                  } else if (line.startsWith('- Missing:')) {
                    currentSection = 'missing';
                  } else {
                    recipe.ingredients = recipe.ingredients || [];
                    recipe.ingredients.push(line);
                  }
                } else if (currentSection === 'instructions') {
                  recipe.instructions = recipe.instructions || [];
                  recipe.instructions.push(line);
                } else if (currentSection === 'available') {
                  recipe.availableIngredients = recipe.availableIngredients || [];
                  recipe.availableIngredients.push(line);
                } else if (currentSection === 'missing') {
                  recipe.missingIngredients = recipe.missingIngredients || [];
                  recipe.missingIngredients.push(line);
                }
              }
            }
            
            if (recipe.name) {
              recipes.push(recipe as ParsedRecipe);
            }
          });
          
          setParsedRecipes(recipes);
          setSelectedRecipeIndex(0);
        } else {
          // Parse single recipe
          const sections: Record<string, string[]> = {};
          let currentSection: string | null = null;
          
          const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
          
          for (const line of lines) {
            if (line.includes(':') && !line.startsWith('-') && !line.startsWith('•')) {
              const [sectionName] = line.split(':');
              currentSection = sectionName.trim().toLowerCase();
              sections[currentSection] = [];
              
              // Add the content after the colon to the section if there is any
              const content = line.substring(line.indexOf(':') + 1).trim();
              if (content) sections[currentSection].push(content);
            } else if (currentSection) {
              sections[currentSection].push(line);
            }
          }
          
          // Extract structured data from parsed sections
          const parsedRecipe = {
            name: sections['recipe name']?.[0] || 'Custom Recipe',
            ingredients: sections['ingredients'] || [],
            instructions: sections['instructions'] || [],
            cookingTime: sections['cooking time']?.[0] || 'Unknown',
            difficulty: sections['difficulty']?.[0] || 'Medium',
            alternatives: sections['alternative ingredients (for missing ones)'] || []
          };
          
          setParsedRecipes([parsedRecipe]);
        }
      } catch (err) {
        console.error('Error parsing recipe:', err);
        // Keep the raw text even if parsing fails
      }
    },
  });
  
  const handleGenerateRecipe = async () => {
    setParsedRecipes([]);
    await generateRecipe({ 
      availableIngredients, 
      missingIngredients,
      generateMultipleRecipes: generateMultiple
    });
  };
  
  const handleAddIngredientsToCart = async (ingredients: string[]) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }
    
    if (!ingredients || ingredients.length === 0) {
      toast.error('No ingredients to add');
      return;
    }
    
    // Here we would integrate with the product matching and cart system
    // For now, we'll just show a toast that it would be added
    toast.success(`Adding ${ingredients.length} ingredients to cart`);
    // Ideally, you'd call a function to match these ingredients with actual products
    // and then add those products to the cart
  };
  
  const currentRecipe = parsedRecipes[selectedRecipeIndex];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChefHat className="mr-2" />
          AI Recipe Generator
        </CardTitle>
        <CardDescription>
          Generate recipe recommendations based on your available and missing ingredients
        </CardDescription>
        
        <div className="flex items-center space-x-2 mt-4">
          <Switch
            id="generate-multiple"
            checked={generateMultiple}
            onCheckedChange={setGenerateMultiple}
          />
          <Label htmlFor="generate-multiple">Generate multiple recipe options</Label>
        </div>
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
        
        {/* Recipe Options (when multiple are generated) */}
        {parsedRecipes.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {parsedRecipes.map((recipe, index) => (
              <Button
                key={index}
                variant={selectedRecipeIndex === index ? "default" : "outline"}
                onClick={() => setSelectedRecipeIndex(index)}
                className="flex-grow"
              >
                Option {index + 1}
                {recipe.matchScore && (
                  <Badge variant="secondary" className="ml-2">
                    {recipe.matchScore}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}
        
        {/* Generated Recipe Display */}
        {parsedRecipes.length > 0 && currentRecipe ? (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">{currentRecipe.name}</h2>
              {currentRecipe.matchScore && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {currentRecipe.matchScore}
                </Badge>
              )}
            </div>
            
            <Tabs defaultValue="ingredients">
              <TabsList>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ingredients" className="space-y-4">
                {(currentRecipe.availableIngredients && currentRecipe.availableIngredients.length > 0) && (
                  <div>
                    <h3 className="font-medium mb-1">Available Ingredients:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentRecipe.availableIngredients.map((ingredient, index) => (
                        <li key={`avail-${index}`} className="text-sm">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
                            Available
                          </Badge>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(currentRecipe.missingIngredients && currentRecipe.missingIngredients.length > 0) && (
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium mb-1">Missing Ingredients:</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddIngredientsToCart(currentRecipe.missingIngredients || [])}
                        className="text-xs"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Add All to Cart
                      </Button>
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentRecipe.missingIngredients.map((ingredient, index) => (
                        <li key={`miss-${index}`} className="text-sm">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mr-2">
                            Missing
                          </Badge>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(!currentRecipe.availableIngredients || !currentRecipe.missingIngredients) && (
                  <div>
                    <h3 className="font-medium mb-1">All Ingredients:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm">{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {currentRecipe.alternatives && currentRecipe.alternatives.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-1">Alternative Ingredients:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentRecipe.alternatives.map((alt, index) => (
                        <li key={index} className="text-sm">{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="instructions">
                <div>
                  <h3 className="font-medium mb-1">Instructions:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    {currentRecipe.instructions.map((step, index) => (
                      <li key={index} className="text-sm">{step}</li>
                    ))}
                  </ol>
                  
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium">Cooking Time:</span> {currentRecipe.cookingTime}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {currentRecipe.difficulty}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {!isLoading && (
              <p>Click the button below to generate recipe recommendations based on your ingredients</p>
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
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : recipe ? (
            'Generate New Recipe'
          ) : (
            'Generate Recipe'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeGenerator;
