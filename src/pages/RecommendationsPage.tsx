
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/components/AuthComponents';
import { Check, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  generateMockRecipes, 
  updateRecipeAvailability, 
  findProductsForIngredients,
  initializeProducts as generateMockProducts,
  initializeStores as generateMockStores
} from '@/utils/seedData';
import { addToCart } from '@/lib/supabaseHelpers';
import { supabase } from '@/integrations/supabase/client';

const RecommendationsPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [missingIngredients, setMissingIngredients] = useState<any[]>([]);
  const [productsForIngredients, setProductsForIngredients] = useState<any>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Make sure mock data is generated when the page loads
  useEffect(() => {
    const ensureMockData = async () => {
      try {
        console.log("Ensuring mock data exists...");
        await generateMockStores(null);
        await generateMockProducts(null);
        console.log("Mock data check completed");
      } catch (error) {
        console.error("Error ensuring mock data:", error);
      }
    };
    
    ensureMockData();
  }, []);
  
  // Load recipes and update availability based on user's ingredients
  useEffect(() => {
    const loadRecipes = async () => {
      setLoadingRecipes(true);
      try {
        // Generate mock recipes
        const mockRecipes = generateMockRecipes();
        
        // Update recipe availability based on user ingredients
        const updatedRecipes = user 
          ? await updateRecipeAvailability(mockRecipes, user.id)
          : mockRecipes;
          
        setRecipes(updatedRecipes);
        
        // Select the first recipe by default
        if (updatedRecipes.length > 0) {
          handleRecipeSelect(updatedRecipes[0]);
        }
      } catch (error) {
        console.error('Error loading recipes:', error);
        toast.error('Failed to load recipe recommendations');
      } finally {
        setLoadingRecipes(false);
      }
    };
    
    loadRecipes();
  }, [user]);
  
  // Handle recipe selection
  const handleRecipeSelect = async (recipe) => {
    setSelectedRecipe(recipe);
    
    // Find missing ingredients
    const missing = recipe.ingredients.filter(ing => !ing.available);
    setMissingIngredients(missing);
    
    if (missing.length > 0) {
      // Find products for missing ingredients
      setLoadingProducts(true);
      try {
        const missingIngredientNames = missing.map(ing => ing.name);
        console.log('Looking for products for these ingredients:', missingIngredientNames);
        
        // Use the findProductsForIngredients helper function
        const productMatches = await findProductsForIngredients(missingIngredientNames);
        
        console.log('Products found:', productMatches);
        setProductsForIngredients(productMatches);
      } catch (error) {
        console.error('Error finding products for ingredients:', error);
        toast.error('Failed to find matching products');
      } finally {
        setLoadingProducts(false);
      }
    } else {
      setProductsForIngredients({});
    }
  };
  
  // Add all missing ingredients to cart
  const handleAddAllToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }
    
    if (missingIngredients.length === 0) {
      toast.info('No missing ingredients to add');
      return;
    }
    
    setAddingToCart(true);
    try {
      let addedCount = 0;
      
      // For each missing ingredient
      for (const ingredient of missingIngredients) {
        // Get matching products
        const matchingProducts = productsForIngredients[ingredient.name];
        
        if (matchingProducts && matchingProducts.length > 0) {
          // Choose the first matching product
          const product = matchingProducts[0];
          
          // Add to cart
          await addToCart(user.id, product.id, 1);
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        toast.success(`Added ${addedCount} items to cart`);
        navigate('/my-orders');
      } else {
        toast.warning('No matching products found');
      }
    } catch (error) {
      console.error('Error adding items to cart:', error);
      toast.error('Failed to add items to cart');
    } finally {
      setAddingToCart(false);
    }
  };
  
  // Add single ingredient to cart
  const handleAddIngredientToCart = async (ingredient, product) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }
    
    try {
      await addToCart(user.id, product.id, 1);
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };
  
  // Navigate to products page
  const handleBrowseProducts = () => {
    navigate('/products?from=recommendation');
  };
  
  // Calculate how many ingredients are available vs missing
  const getAvailabilityBadge = (recipe) => {
    if (!recipe) return null;
    
    const totalIngredients = recipe.ingredients.length;
    const availableCount = recipe.ingredients.filter(ing => ing.available).length;
    const missingCount = totalIngredients - availableCount;
    
    if (missingCount === 0) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          All ingredients available
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          {missingCount} missing ingredient{missingCount !== 1 ? 's' : ''}
        </Badge>
      );
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Recipe Recommendations</h1>
        
        {loadingRecipes ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div className="md:col-span-2">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Suggested Recipes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {recipes.map(recipe => (
                      <li key={recipe.id}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between h-auto py-2 ${
                            selectedRecipe?.id === recipe.id ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handleRecipeSelect(recipe)}
                        >
                          <span className="text-left">{recipe.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              recipe.missingCount === 0
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            {recipe.missingCount === 0
                              ? 'Ready'
                              : `${recipe.missingCount} missing`}
                          </Badge>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleBrowseProducts}
                  >
                    Browse All Products
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              {selectedRecipe ? (
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-1">{selectedRecipe.name}</CardTitle>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <span>{selectedRecipe.category}</span>
                          <span>•</span>
                          <span>{selectedRecipe.preparationTime}</span>
                          <span>•</span>
                          <span>{selectedRecipe.difficulty}</span>
                        </div>
                      </div>
                      {getAvailabilityBadge(selectedRecipe)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <img
                          src={selectedRecipe.imageUrl}
                          alt={selectedRecipe.name}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="md:w-2/3">
                        <Tabs defaultValue="ingredients">
                          <TabsList className="mb-4">
                            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                            <TabsTrigger value="instructions">Instructions</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="ingredients">
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium mb-2">What You Need:</h3>
                                <ul className="space-y-2">
                                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                                    <li 
                                      key={idx}
                                      className="flex items-center justify-between py-1"
                                    >
                                      <div className="flex items-center">
                                        {ingredient.available ? (
                                          <Check className="h-4 w-4 text-green-500 mr-2" />
                                        ) : (
                                          <X className="h-4 w-4 text-red-500 mr-2" />
                                        )}
                                        <span>
                                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                                        </span>
                                      </div>
                                      
                                      {!ingredient.available && (
                                        <Badge 
                                          variant="outline" 
                                          className="bg-red-50 text-red-700 border-red-200"
                                        >
                                          Missing
                                        </Badge>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {missingIngredients.length > 0 && (
                                <div className="pt-4 border-t border-gray-200">
                                  <Button
                                    onClick={handleAddAllToCart}
                                    disabled={addingToCart || !user}
                                    className="bg-fridge-blue hover:bg-blue-700"
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {addingToCart ? 'Adding...' : 'Add Missing Ingredients to Cart'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="instructions">
                            <div>
                              <h3 className="font-medium mb-2">Preparation Steps:</h3>
                              <ol className="list-decimal list-inside space-y-2 pl-1">
                                <li>Preheat oven to 350°F (175°C) if baking is required.</li>
                                <li>Prepare all ingredients: wash, chop, and measure as needed.</li>
                                <li>Mix ingredients according to the recipe proportions.</li>
                                <li>Cook according to the recipe guidelines.</li>
                                <li>Serve hot or cold as preferred.</li>
                              </ol>
                              <p className="mt-4 text-gray-500 italic">
                                Note: Detailed recipe instructions would be available in a full recipe app.
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-[400px] flex items-center justify-center border rounded-lg">
                  <p className="text-gray-500">Select a recipe to view details</p>
                </div>
              )}
              
              {/* Missing Ingredients Products Section */}
              {selectedRecipe && missingIngredients.length > 0 && (
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Products for Missing Ingredients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingProducts ? (
                        <div className="space-y-4">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {missingIngredients.map((ingredient) => {
                            const products = productsForIngredients[ingredient.name] || [];
                            
                            return (
                              <div key={ingredient.name} className="space-y-2">
                                <h3 className="font-medium border-b pb-1">
                                  {ingredient.name} ({products.length} options)
                                </h3>
                                
                                {products.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {products.slice(0, 3).map((product) => (
                                      <div 
                                        key={product.id}
                                        className="border rounded p-3 flex justify-between items-center"
                                      >
                                        <div>
                                          <p className="font-medium">{product.name}</p>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-sm text-gray-500">
                                              ${product.price.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-400">|</span>
                                            <span className="text-sm text-gray-500">
                                              {product.store?.name || 'Unknown Store'}
                                            </span>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddIngredientToCart(ingredient, product)}
                                          disabled={!user}
                                        >
                                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm">
                                    <p>No matching products found</p>
                                    <Button 
                                      variant="outline"
                                      size="sm" 
                                      className="mt-2"
                                      onClick={handleBrowseProducts}
                                    >
                                      Browse Products
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          <div className="pt-2 border-t border-gray-200 flex justify-end">
                            <Button
                              variant="outline"
                              onClick={handleBrowseProducts}
                              className="mt-2"
                            >
                              Browse All Products
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecommendationsPage;
