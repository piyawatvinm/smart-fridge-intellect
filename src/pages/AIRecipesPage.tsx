
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { useAuth } from '@/components/AuthComponents';
import { supabase } from '@/integrations/supabase/client';
import { useGemini } from '@/hooks/use-gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, Check, X, ChefHat, ShoppingCart } from 'lucide-react';
import { addToCart, getCategoryForItem } from '@/lib/supabaseHelpers';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeIngredient {
  name: string;
  available: boolean;
}

interface Recipe {
  title: string;
  description: string;
  matchScore: number;
  ingredients: RecipeIngredient[];
  instructions?: string[];
}

const AIRecipesPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const { generateContent, isLoading: isGenerating } = useGemini();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [processingRecipeIndex, setProcessingRecipeIndex] = useState<number | null>(null);

  // Fetch user ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('ingredients')
          .select('id, name, quantity, unit')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIngredients(data || []);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        toast({
          title: 'Error',
          description: 'Failed to load your ingredients',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, [user?.id]);

  // Generate recipes
  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      toast({
        title: 'No ingredients',
        description: 'Add some ingredients to your inventory first',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Prepare ingredient list for the prompt
      const ingredientNames = ingredients.map(ing => ing.name).join(', ');
      
      // Create the prompt
      const prompt = `Here are the ingredients I currently have in my fridge: ${ingredientNames}. 
      Suggest 5 recipes that use these ingredients. Rank them by how many ingredients are already available.
      For each recipe, return in this EXACT format:

      RECIPE:
      Title: [recipe name]
      Match: [percentage of ingredients I already have]
      Description: [brief description of the dish]
      Available Ingredients: [comma-separated list of ingredients I already have that are used]
      Missing Ingredients: [comma-separated list of ingredients I need but don't have]
      Instructions: [numbered list of preparation steps]`;
      
      // Generate content with Gemini
      const content = await generateContent(prompt);
      
      if (!content) {
        throw new Error('Failed to generate recipes');
      }
      
      // Parse the generated content
      const parsedRecipes = parseRecipesFromContent(content, ingredients);
      setRecipes(parsedRecipes);
      
    } catch (err) {
      console.error('Error generating recipes:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate recipes',
        variant: 'destructive',
      });
    }
  };

  // Parse recipes from Gemini response
  const parseRecipesFromContent = (content: string, availableIngredients: Ingredient[]): Recipe[] => {
    const recipes: Recipe[] = [];
    const recipeBlocks = content.split('RECIPE:').filter(block => block.trim());
    
    for (const block of recipeBlocks) {
      try {
        const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
        const recipe: Partial<Recipe> = {
          ingredients: []
        };
        
        let currentSection: string | null = null;
        const instructions: string[] = [];
        
        for (const line of lines) {
          if (line.includes(':')) {
            const [section, content] = line.split(':', 2).map(s => s.trim());
            currentSection = section.toLowerCase();
            
            switch (currentSection) {
              case 'title':
                recipe.title = content;
                break;
              case 'match':
                // Extract percentage
                const matchPercentage = parseInt(content.replace(/\D/g, ''));
                recipe.matchScore = isNaN(matchPercentage) ? 0 : matchPercentage;
                break;
              case 'description':
                recipe.description = content;
                break;
              case 'available ingredients':
                // Add available ingredients
                if (content) {
                  content.split(',').forEach(name => {
                    const trimmedName = name.trim();
                    if (trimmedName) {
                      recipe.ingredients = [
                        ...(recipe.ingredients || []),
                        { name: trimmedName, available: true }
                      ];
                    }
                  });
                }
                break;
              case 'missing ingredients':
                // Add missing ingredients
                if (content) {
                  content.split(',').forEach(name => {
                    const trimmedName = name.trim();
                    if (trimmedName) {
                      recipe.ingredients = [
                        ...(recipe.ingredients || []),
                        { name: trimmedName, available: false }
                      ];
                    }
                  });
                }
                break;
              case 'instructions':
                if (content) {
                  instructions.push(content);
                }
                break;
            }
          } else if (currentSection === 'instructions') {
            // Continue collecting instructions
            instructions.push(line);
          }
        }
        
        recipe.instructions = instructions;
        
        // Only add valid recipes
        if (recipe.title && recipe.ingredients && recipe.ingredients.length > 0) {
          recipes.push(recipe as Recipe);
        }
      } catch (error) {
        console.error('Error parsing recipe:', error);
      }
    }
    
    // Sort by match score (highest first)
    return recipes.sort((a, b) => b.matchScore - a.matchScore);
  };

  // Find or create product for an ingredient
  const findOrCreateProduct = async (ingredientName: string): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      // Try to find an existing product with similar name
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .ilike('name', `%${ingredientName}%`)
        .limit(1);

      // If product exists, return its ID
      if (existingProducts && existingProducts.length > 0) {
        return existingProducts[0].id;
      }

      // Product doesn't exist, get a random store
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .limit(10);

      // Get random store ID or use a default
      const storeId = stores && stores.length > 0 
        ? stores[Math.floor(Math.random() * stores.length)].id 
        : null;

      // Generate a random price between 10 and 50
      const price = Math.floor(Math.random() * 40) + 10;

      // Determine category based on ingredient name
      const category = getCategoryForItem(ingredientName);

      // Create new product
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([
          { 
            name: ingredientName,
            description: `Auto-generated product for ${ingredientName}`,
            category,
            unit: 'unit',
            price,
            store_id: storeId,
            user_id: user.id
          }
        ])
        .select('id')
        .single();

      if (error) throw error;

      // Return the new product ID
      return newProduct.id;
    } catch (error) {
      console.error(`Error finding/creating product for ${ingredientName}:`, error);
      throw error;
    }
  };

  // Add missing ingredients to cart
  const addMissingToCart = async (recipe: Recipe, recipeIndex: number) => {
    if (!user?.id) return;
    
    setIsAddingToCart(true);
    setProcessingRecipeIndex(recipeIndex);
    
    try {
      const missingIngredients = recipe.ingredients.filter(ing => !ing.available);
      let successCount = 0;
      
      for (const ingredient of missingIngredients) {
        try {
          // Find or create product for this ingredient
          const productId = await findOrCreateProduct(ingredient.name);
          
          // Add to cart
          await addToCart(user.id, productId);
          successCount++;
        } catch (error) {
          console.error(`Error processing ingredient ${ingredient.name}:`, error);
          // Continue with other ingredients even if one fails
        }
      }
      
      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `Added ${successCount} of ${missingIngredients.length} missing ingredients to cart`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add any ingredients to cart',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add items to cart',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
      setProcessingRecipeIndex(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Recipe Generator</h1>
            <p className="text-muted-foreground">
              Generate recipes based on ingredients you already have in your inventory
            </p>
          </div>
          
          <Button 
            onClick={handleGenerateRecipes} 
            className="flex items-center gap-2"
            disabled={isGenerating || ingredients.length === 0}
          >
            <ChefHat size={18} />
            Generate Recipes
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="pb-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ingredients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <ChefHat size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No ingredients found</h3>
                <p className="text-muted-foreground mb-4">
                  Add ingredients to your inventory first to generate recipe suggestions
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/ingredients'}>
                  Go to Ingredients
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : recipes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <ChefHat size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Ready to cook something amazing?</h3>
                <p className="text-muted-foreground mb-6">
                  Click the "Generate Recipes" button to get AI-powered recipe suggestions based on your ingredients
                </p>
                <Button onClick={handleGenerateRecipes} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{recipe.title}</CardTitle>
                    <Badge variant={recipe.matchScore >= 70 ? "success" : "outline"}>
                      {recipe.matchScore}% Match
                    </Badge>
                  </div>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Ingredients</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {ingredient.available ? 
                            <Check size={16} className="text-green-600 flex-shrink-0" /> : 
                            <X size={16} className="text-red-600 flex-shrink-0" />
                          }
                          <span className={ingredient.available ? "" : "text-muted-foreground"}>
                            {ingredient.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Instructions</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        {recipe.instructions.slice(0, 3).map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                        {recipe.instructions.length > 3 && (
                          <li>
                            <span className="text-sm text-muted-foreground italic">
                              ...and {recipe.instructions.length - 3} more steps
                            </span>
                          </li>
                        )}
                      </ol>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => addMissingToCart(recipe, index)}
                    disabled={isAddingToCart || recipe.ingredients.every(ing => ing.available)}
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    {processingRecipeIndex === index && isAddingToCart ? 
                      'Processing...' : 
                      'Add Missing Ingredients to Cart'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AIRecipesPage;
