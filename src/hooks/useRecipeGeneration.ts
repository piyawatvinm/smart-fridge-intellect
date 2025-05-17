import { useState, useEffect } from 'react';
import { useGemini } from '@/hooks/use-gemini';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { addToCart, createProductIfNotExists } from '@/lib/supabaseHelpers';

export interface IngredientItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

export interface RecipeIngredient {
  name: string;
  available: boolean;
  quantity?: string;
  unit?: string;
}

export interface Recipe {
  name: string;
  matchScore: number; // Percentage match
  availableIngredients: RecipeIngredient[];
  missingIngredients: RecipeIngredient[];
  instructions: string[];
  cookingTime?: string;
  difficulty?: string;
}

export const useRecipeGeneration = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [userIngredients, setUserIngredients] = useState<IngredientItem[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [generatingRecipes, setGeneratingRecipes] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loadingSavedRecipes, setLoadingSavedRecipes] = useState(false);
  const { generateContent } = useGemini();

  // Fetch user's actual ingredients from Supabase
  const loadUserIngredients = async () => {
    if (!userId) return;

    setLoadingIngredients(true);
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, quantity, unit, category')
        .eq('user_id', userId);

      if (error) throw error;
      setUserIngredients(data || []);
    } catch (err) {
      console.error('Error fetching user ingredients:', err);
      toast({
        title: 'Error',
        description: 'Failed to load your ingredients',
        variant: 'destructive',
      });
    } finally {
      setLoadingIngredients(false);
    }
  };

  // Load ingredients when userId changes
  useEffect(() => {
    if (userId) {
      loadUserIngredients();
      loadSavedRecipes();
    }
  }, [userId]);

  // Load saved recipes from the database
  const loadSavedRecipes = async () => {
    if (!userId) return;
    
    setLoadingSavedRecipes(true);
    try {
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select(`
          id, 
          name, 
          description, 
          preparation_time, 
          difficulty, 
          category, 
          image_url,
          recipe_ingredients (
            id,
            ingredient_name,
            quantity,
            unit
          )
        `);

      if (error) throw error;

      // Transform the data to match our Recipe interface format
      const formattedRecipes = recipes?.map(recipe => {
        // For each recipe, check which ingredients the user has
        const availableIngredients: RecipeIngredient[] = [];
        const missingIngredients: RecipeIngredient[] = [];
        
        recipe.recipe_ingredients?.forEach(ingredient => {
          // Check if user has this ingredient (case-insensitive match)
          const userHasIngredient = userIngredients.some(
            ui => ui.name.toLowerCase() === ingredient.ingredient_name.toLowerCase()
          );
          
          const ingredientItem = {
            name: ingredient.ingredient_name,
            quantity: ingredient.quantity.toString(),
            unit: ingredient.unit,
            available: userHasIngredient
          };
          
          if (userHasIngredient) {
            availableIngredients.push(ingredientItem);
          } else {
            missingIngredients.push(ingredientItem);
          }
        });
        
        // Calculate match score
        const totalIngredients = availableIngredients.length + missingIngredients.length;
        const matchScore = totalIngredients > 0 
          ? Math.round((availableIngredients.length / totalIngredients) * 100)
          : 0;
        
        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          matchScore: matchScore,
          availableIngredients,
          missingIngredients,
          instructions: [], // No instructions in database, would be filled by AI
          cookingTime: recipe.preparation_time,
          difficulty: recipe.difficulty,
          category: recipe.category,
          imageUrl: recipe.image_url
        };
      }) || [];
      
      // Sort by match score (highest first)
      const sortedRecipes = formattedRecipes.sort((a, b) => b.matchScore - a.matchScore);
      setSavedRecipes(sortedRecipes);
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
      toast({
        title: 'Error',
        description: 'Failed to load saved recipes',
        variant: 'destructive',
      });
    } finally {
      setLoadingSavedRecipes(false);
    }
  };

  // Generate recipes based on user's actual ingredients
  const generateRecipes = async () => {
    if (!userId || userIngredients.length === 0) {
      toast({
        title: 'Error',
        description: 'No ingredients available to generate recipes',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingRecipes(true);
    try {
      // Format ingredients for prompt
      const ingredientsList = userIngredients.map(ing => 
        `${ing.name} (${ing.quantity} ${ing.unit})`
      ).join('\n');

      // Create prompt for Gemini with Thai food focus
      const prompt = `Here are my current ingredients:\n${ingredientsList}\n\nSuggest 5 recipes with a focus on Thai cuisine if possible, sorted by how many of my ingredients they use. For each recipe, return in this exact format:
      
RECIPE:
Title: [recipe name]
Match: [percentage of ingredients I already have]
Available Ingredients: [list ingredients I already have that are used, be specific with quantities]
Missing Ingredients: [list ingredients I don't have that are needed, be specific with quantities]
Instructions: [numbered list of steps]
Cooking Time: [estimated time]
Difficulty: [easy, medium, or hard]

Make sure to ONLY include ingredients from my list in the "Available Ingredients" section.`;

      // Generate content with Gemini
      const generatedContent = await generateContent(prompt);
      
      if (!generatedContent) {
        throw new Error('Failed to generate recipe content');
      }

      // Parse recipes from generated content
      const recipes = parseRecipesFromText(generatedContent, userIngredients);
      
      // Sort recipes by match score (highest first)
      const sortedRecipes = recipes.sort((a, b) => b.matchScore - a.matchScore);
      
      setGeneratedRecipes(sortedRecipes);
    } catch (err) {
      console.error('Error generating recipes:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate recipes',
        variant: 'destructive',
      });
    } finally {
      setGeneratingRecipes(false);
    }
  };

  // Parse recipes from the generated text
  const parseRecipesFromText = (text: string, availableIngredients: IngredientItem[]): Recipe[] => {
    const recipes: Recipe[] = [];
    
    // Split text by "RECIPE:" to get individual recipes
    const recipeBlocks = text.split('RECIPE:').filter(block => block.trim().length > 0);
    
    for (const block of recipeBlocks) {
      try {
        const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
        
        // Initialize recipe object
        const recipe: Partial<Recipe> = {
          availableIngredients: [],
          missingIngredients: [],
          instructions: []
        };

        let currentSection: string | null = null;
        
        for (const line of lines) {
          if (line.includes(':')) {
            const [section, content] = line.split(':', 2).map(s => s.trim());
            currentSection = section.toLowerCase();
            
            switch (currentSection) {
              case 'title':
                recipe.name = content;
                break;
              case 'match':
                // Extract percentage number
                const matchPercentage = parseInt(content.replace(/\D/g, ''));
                recipe.matchScore = isNaN(matchPercentage) ? 0 : matchPercentage;
                break;
              case 'cooking time':
                recipe.cookingTime = content;
                break;
              case 'difficulty':
                recipe.difficulty = content;
                break;
              case 'available ingredients':
                // Start collecting available ingredients
                if (content) {
                  recipe.availableIngredients = recipe.availableIngredients || [];
                  recipe.availableIngredients.push({
                    name: content,
                    available: true,
                    quantity: extractQuantity(content),
                    unit: extractUnit(content)
                  });
                }
                break;
              case 'missing ingredients':
                // Start collecting missing ingredients
                if (content) {
                  recipe.missingIngredients = recipe.missingIngredients || [];
                  recipe.missingIngredients.push({
                    name: content,
                    available: false,
                    quantity: extractQuantity(content),
                    unit: extractUnit(content)
                  });
                }
                break;
              case 'instructions':
                // Start collecting instructions
                if (content) {
                  recipe.instructions = recipe.instructions || [];
                  recipe.instructions.push(content);
                }
                break;
            }
          } else if (currentSection) {
            // Continue collecting items for the current section
            switch (currentSection) {
              case 'available ingredients':
                recipe.availableIngredients = recipe.availableIngredients || [];
                recipe.availableIngredients.push({
                  name: cleanIngredientName(line),
                  available: true,
                  quantity: extractQuantity(line),
                  unit: extractUnit(line)
                });
                break;
              case 'missing ingredients':
                recipe.missingIngredients = recipe.missingIngredients || [];
                recipe.missingIngredients.push({
                  name: cleanIngredientName(line),
                  available: false,
                  quantity: extractQuantity(line),
                  unit: extractUnit(line)
                });
                break;
              case 'instructions':
                recipe.instructions = recipe.instructions || [];
                recipe.instructions.push(line);
                break;
            }
          }
        }
        
        // Verify the recipe has required fields before adding
        if (recipe.name && (recipe.availableIngredients?.length || recipe.missingIngredients?.length)) {
          recipes.push(recipe as Recipe);
        }
      } catch (err) {
        console.error('Error parsing recipe block:', err);
        // Skip this recipe and continue with others
      }
    }
    
    return recipes;
  };

  // Helper function to clean ingredient name from quantity
  const cleanIngredientName = (ingredient: string): string => {
    // Remove quantities like "2 cups" or "1/2 teaspoon" from ingredient name
    return ingredient.replace(/^[\d\s\/\.\-]+(?:cups?|tablespoons?|teaspoons?|tbsp|tsp|g|ml|l|oz|pound|lb|kg)?\s+of\s+/i, '')
      .replace(/^[\d\s\/\.\-]+(?:cups?|tablespoons?|teaspoons?|tbsp|tsp|g|ml|l|oz|pound|lb|kg)\s+/i, '')
      .trim();
  };

  // Helper function to extract quantity from ingredient text
  const extractQuantity = (ingredient: string): string => {
    const quantityMatch = ingredient.match(/^([\d\s\/\.\-]+)/);
    return quantityMatch ? quantityMatch[1].trim() : '';
  };

  // Helper function to extract unit from ingredient text
  const extractUnit = (ingredient: string): string => {
    const unitMatch = ingredient.match(/^[\d\s\/\.\-]+(cups?|tablespoons?|teaspoons?|tbsp|tsp|g|ml|l|oz|pound|lb|kg)/i);
    return unitMatch ? unitMatch[1].trim() : '';
  };

  // Add missing ingredients to cart
  const addMissingIngredientsToCart = async (recipeIndex: number, sourceType: 'generated' | 'saved' = 'generated') => {
    if (!userId) {
      return;
    }

    const recipes = sourceType === 'generated' ? generatedRecipes : savedRecipes;
    
    if (recipeIndex >= recipes.length) {
      return;
    }

    const recipe = recipes[recipeIndex];
    setAddingToCart(true);

    try {
      let addedCount = 0;
      
      // Process each missing ingredient
      for (const ingredient of recipe.missingIngredients) {
        try {
          // Normalize the ingredient name
          const normalizedName = ingredient.name.trim();
          const normalizedNameLower = normalizedName.toLowerCase();
          
          // Check if product with similar name exists
          const { data: existingProducts } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', normalizedNameLower);
            
          let productId: string | null = null;
          
          if (existingProducts && existingProducts.length > 0) {
            // Use existing product (preserve original capitalization)
            productId = existingProducts[0].id;
          } else {
            // Create the product if it doesn't exist
            const product = await createProductIfNotExists(
              normalizedName, // Keep original capitalization for display
              userId,
              ingredient.unit || 'pcs'
            );
            
            if (product) {
              productId = product.id;
            }
          }
          
          if (productId) {
            // Add product to cart
            await addToCart(userId, productId);
            addedCount++;
          }
        } catch (error) {
          console.error(`Error processing ingredient ${ingredient.name}:`, error);
          toast({
            title: 'Error',
            description: `Failed to add ${ingredient.name} to cart`,
            variant: 'destructive',
          });
        }
      }
      
      if (addedCount > 0) {
        toast({
          title: 'Success',
          description: `Added ${addedCount} ingredients to cart`,
        });
      } else {
        toast({
          title: 'Warning',
          description: 'No ingredients were added to cart',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding ingredients to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add ingredients to cart',
        variant: 'destructive',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  return {
    userIngredients,
    generatedRecipes,
    savedRecipes,
    loadUserIngredients,
    generateRecipes,
    loadingIngredients,
    generatingRecipes,
    addMissingIngredientsToCart,
    loadingSavedRecipes,
    addingToCart
  };
};
