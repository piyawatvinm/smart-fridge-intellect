import React, { useState } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/components/AuthComponents';
import { Check, X, ShoppingCart, AlertCircle, ChefHat, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecipeGeneration, Recipe } from '@/hooks/useRecipeGeneration';
import { toast } from 'sonner';
import { createProductIfNotExists } from '@/lib/supabaseHelpers';

const GenerateRecipePage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);
  
  const {
    userIngredients,
    generatedRecipes,
    generateRecipes,
    loadUserIngredients,
    loadingIngredients,
    generatingRecipes,
    addMissingIngredientsToCart,
    addingToCart
  } = useRecipeGeneration(user?.id);
  
  const handleGenerateRecipes = () => {
    generateRecipes();
  };
  
  const currentRecipe = generatedRecipes[selectedRecipeIndex];
  
  // Update the method to add missing ingredients to cart with product creation
  const handleAddToCartClick = async (recipeIndex: number) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    
    const recipe = generatedRecipes[recipeIndex];
    if (!recipe) return;
    
    try {
      setSelectedRecipeIndex(recipeIndex);
      await addMissingIngredientsToCart(recipeIndex);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add ingredients to cart');
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Generate Recipes from Your Ingredients</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingIngredients ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div>
                    {userIngredients.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No ingredients found in your fridge. Please add ingredients to generate recipes.
                      </p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {userIngredients.slice(0, 10).map((ingredient) => (
                          <li key={ingredient.id} className="flex justify-between items-center">
                            <span>{ingredient.name}</span>
                            <Badge variant="outline">{ingredient.quantity} {ingredient.unit}</Badge>
                          </li>
                        ))}
                        {userIngredients.length > 10 && (
                          <li className="text-muted-foreground text-xs text-center italic">
                            +{userIngredients.length - 10} more ingredients
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerateRecipes}
                  className="w-full"
                  disabled={loadingIngredients || generatingRecipes || userIngredients.length === 0}
                >
                  {generatingRecipes ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Recipes...
                    </>
                  ) : (
                    <>
                      <ChefHat className="mr-2 h-4 w-4" />
                      Generate Recipes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {generatedRecipes.length > 0 && (
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recipe Options</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {generatedRecipes.map((recipe, index) => (
                      <li key={index}>
                        <Button
                          variant={selectedRecipeIndex === index ? "default" : "outline"}
                          className="w-full justify-between h-auto py-2"
                          onClick={() => setSelectedRecipeIndex(index)}
                        >
                          <span className="text-left">{recipe.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              recipe.matchScore >= 80
                                ? 'bg-green-50 text-green-700'
                                : recipe.matchScore >= 50
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {recipe.matchScore}%
                          </Badge>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-2">
            {generatingRecipes ? (
              <Card className="bg-white">
                <CardContent className="py-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-medium">Generating Recipes...</p>
                    <p className="text-sm text-muted-foreground text-center">
                      We're analyzing your ingredients and creating personalized recipe suggestions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : currentRecipe ? (
              <Card className="bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{currentRecipe.name}</CardTitle>
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        {currentRecipe.cookingTime && <span>{currentRecipe.cookingTime}</span>}
                        {currentRecipe.cookingTime && currentRecipe.difficulty && <span>•</span>}
                        {currentRecipe.difficulty && <span>{currentRecipe.difficulty}</span>}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        currentRecipe.matchScore >= 80
                          ? 'bg-green-50 text-green-700'
                          : currentRecipe.matchScore >= 50
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      Match: {currentRecipe.matchScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="ingredients">
                    <TabsList className="mb-4">
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="ingredients">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Available Ingredients:</h3>
                          <ul className="space-y-1">
                            {currentRecipe.availableIngredients.map((ingredient, idx) => (
                              <li key={`avail-${idx}`} className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                <span>{ingredient.quantity && ingredient.unit 
                                  ? `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
                                  : ingredient.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {currentRecipe.missingIngredients.length > 0 && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium">Missing Ingredients:</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToCartClick(selectedRecipeIndex)}
                                disabled={addingToCart || !user}
                              >
                                {addingToCart ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                )}
                                Add All to Cart
                              </Button>
                            </div>
                            <ul className="space-y-1">
                              {currentRecipe.missingIngredients.map((ingredient, idx) => (
                                <li key={`miss-${idx}`} className="flex items-center">
                                  <X className="h-4 w-4 text-red-500 mr-2" />
                                  <span>{ingredient.quantity && ingredient.unit 
                                    ? `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
                                    : ingredient.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {!user && currentRecipe.missingIngredients.length > 0 && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-700 flex items-center text-sm">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Sign in to add missing ingredients to your cart
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="instructions">
                      <div>
                        <h3 className="font-medium mb-2">Preparation Steps:</h3>
                        <ol className="list-decimal list-inside space-y-2 pl-1">
                          {currentRecipe.instructions.map((step, idx) => (
                            <li key={idx} className="pl-1">
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <ChefHat className="h-16 w-16 text-muted-foreground" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium">Generate Custom Recipes</h3>
                      <p className="text-muted-foreground">
                        Click the "Generate Recipes" button to create custom recipes based on ingredients in your fridge.
                      </p>
                      {userIngredients.length === 0 && user && (
                        <div className="pt-4">
                          <Button onClick={() => navigate('/ingredients')}>
                            Add Ingredients First
                          </Button>
                        </div>
                      )}
                      {!user && (
                        <div className="pt-4">
                          <Button onClick={() => navigate('/login')}>
                            Sign In to Continue
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GenerateRecipePage;
