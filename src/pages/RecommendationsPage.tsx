import { Layout } from "@/components/LayoutComponents";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, Heart, ShoppingCart, Star, Info, Search, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGemini } from '@/hooks/use-gemini';
import { useAuth } from "@/components/AuthComponents";
import { addToCart, fetchUserIngredients } from "@/lib/supabaseHelpers";
import { useNavigate } from "react-router-dom";

interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
  missing?: boolean;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  rating: number;
  image: string;
  matchPercentage: number;
  isFavorite: boolean;
  description: string;
  instructions?: string[];
}

const RecommendationsPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const { generateContent, isLoading: geminiLoading } = useGemini();
  
  useEffect(() => {
    loadUserIngredients();
    generateRecipes();
  }, [user]);
  
  const loadUserIngredients = async () => {
    if (!user) return;
    
    try {
      const ingredients = await fetchUserIngredients(user.id);
      setUserIngredients(ingredients.map(ing => ing.name.toLowerCase()));
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };
  
  // Generate recipes using Gemini API
  const generateRecipes = async () => {
    setLoading(true);
    
    try {
      if (!user) return;
      
      const ingredients = await fetchUserIngredients(user.id);
      const ingredientsList = ingredients.map(ing => ing.name).join(", ");
      
      const prompt = `Given these ingredients: ${ingredientsList || "no ingredients provided"}. 
      Generate 5 recipe suggestions in JSON format. 
      For each recipe, include: name, cuisine type, difficulty (easy/medium/hard), 
      cookingTime (in minutes), list of ingredients with quantities, 
      a brief description, and instructions as an array of steps.
      If an ingredient isn't in the provided list, mark it as missing: true.
      Output should be valid JSON.`;
      
      const result = await generateContent(prompt);
      
      if (result) {
        try {
          // Extract JSON from the response (handling potential text before/after JSON)
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : result;
          const parsedData = JSON.parse(jsonStr);
          
          const processedRecipes = (parsedData.recipes || []).map((recipe: any, index: number) => {
            // Process ingredients to mark what user already has
            const processedIngredients = recipe.ingredients.map((ing: any) => {
              const name = typeof ing === 'string' ? ing : ing.name;
              const exists = userIngredients.includes(name.toLowerCase());
              
              return {
                ...ing,
                name: typeof ing === 'string' ? ing : ing.name,
                missing: !exists
              };
            });
            
            // Calculate match percentage based on ingredients user already has
            const totalIngredients = processedIngredients.length;
            const availableIngredients = processedIngredients.filter(ing => !ing.missing).length;
            const matchPercentage = Math.floor((availableIngredients / totalIngredients) * 100);
            
            return {
              id: `recipe-${index + 1}`,
              name: recipe.name,
              ingredients: processedIngredients,
              cookingTime: recipe.cookingTime || Math.floor(Math.random() * 30) + 15,
              difficulty: recipe.difficulty || 'medium',
              cuisine: recipe.cuisine || 'International',
              rating: recipe.rating || (Math.random() * 2 + 3).toFixed(1),
              image: recipe.image || 'https://via.placeholder.com/300',
              matchPercentage,
              isFavorite: false,
              description: recipe.description || `A delicious ${recipe.cuisine || ''} recipe.`,
              instructions: recipe.instructions || []
            };
          });
          
          setRecipes(processedRecipes);
          setFilteredRecipes(processedRecipes);
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          toast.error('Error generating recipes');
          // Use mock data as fallback
          setRecipes(generateMockRecipes());
          setFilteredRecipes(generateMockRecipes());
        }
      } else {
        // Use mock data as fallback
        setRecipes(generateMockRecipes());
        setFilteredRecipes(generateMockRecipes());
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
      toast.error('Failed to generate recipes');
      // Use mock data as fallback
      setRecipes(generateMockRecipes());
      setFilteredRecipes(generateMockRecipes());
    } finally {
      setLoading(false);
    }
  };
  
  // Mock data for fallback
  const generateMockRecipes = (): Recipe[] => {
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        name: 'Spaghetti Carbonara',
        ingredients: ['Pasta', 'Eggs', 'Bacon', 'Parmesan Cheese', 'Black Pepper', 'Salt'].map(name => ({ name })),
        cookingTime: 25,
        difficulty: 'easy',
        cuisine: 'Italian',
        rating: 4.7,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 90,
        isFavorite: true,
        description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.'
      },
      {
        id: '2',
        name: 'Chicken Stir Fry',
        ingredients: ['Chicken Breast', 'Bell Peppers', 'Broccoli', 'Soy Sauce', 'Garlic', 'Ginger', 'Rice'].map(name => ({ name })),
        cookingTime: 30,
        difficulty: 'medium',
        cuisine: 'Asian',
        rating: 4.5,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 85,
        isFavorite: false,
        description: 'A quick and healthy stir fry with chicken and vegetables.',
      },
      {
        id: '3',
        name: 'Vegetable Omelette',
        ingredients: ['Eggs', 'Bell Peppers', 'Onions', 'Cheese', 'Milk', 'Salt', 'Pepper'].map(name => ({ name })),
        cookingTime: 15,
        difficulty: 'easy',
        cuisine: 'International',
        rating: 4.3,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 100,
        isFavorite: true,
        description: 'A fluffy omelette packed with fresh vegetables and cheese.'
      },
      {
        id: '4',
        name: 'Beef Tacos',
        ingredients: ['Ground Beef', 'Taco Shells', 'Lettuce', 'Tomatoes', 'Cheese', 'Sour Cream', 'Salsa'].map(name => ({ name })),
        cookingTime: 25,
        difficulty: 'easy',
        cuisine: 'Mexican',
        rating: 4.6,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 70,
        isFavorite: false,
        description: 'Classic beef tacos with all the toppings.',
      },
      {
        id: '5',
        name: 'Vegetable Curry',
        ingredients: ['Potatoes', 'Carrots', 'Peas', 'Curry Powder', 'Coconut Milk', 'Onions', 'Rice'].map(name => ({ name })),
        cookingTime: 40,
        difficulty: 'medium',
        cuisine: 'Indian',
        rating: 4.4,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 75,
        isFavorite: false,
        description: 'A flavorful vegetable curry with a rich sauce.',
      },
      {
        id: '6',
        name: 'Caesar Salad',
        ingredients: ['Romaine Lettuce', 'Croutons', 'Parmesan Cheese', 'Caesar Dressing', 'Chicken Breast'].map(name => ({ name })),
        cookingTime: 15,
        difficulty: 'easy',
        cuisine: 'International',
        rating: 4.2,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 80,
        isFavorite: false,
        description: 'A classic Caesar salad with homemade dressing and croutons.',
      },
      {
        id: '7',
        name: 'Tomato Soup',
        ingredients: ['Tomatoes', 'Onions', 'Garlic', 'Vegetable Broth', 'Cream', 'Basil', 'Bread'].map(name => ({ name })),
        cookingTime: 35,
        difficulty: 'easy',
        cuisine: 'International',
        rating: 4.5,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 95,
        isFavorite: true,
        description: 'A comforting tomato soup with a hint of cream and fresh basil.'
      },
      {
        id: '8',
        name: 'Pancakes',
        ingredients: ['Flour', 'Eggs', 'Milk', 'Sugar', 'Baking Powder', 'Butter', 'Maple Syrup'].map(name => ({ name })),
        cookingTime: 20,
        difficulty: 'easy',
        cuisine: 'American',
        rating: 4.8,
        image: 'https://via.placeholder.com/300',
        matchPercentage: 90,
        isFavorite: true,
        description: 'Fluffy pancakes served with butter and maple syrup.'
      }
    ];
    
    return mockRecipes;
  };
  
  // Filter recipes when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredRecipes(filtered);
    }
  }, [searchTerm, recipes]);

  const toggleFavorite = (id: string) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id 
        ? {...recipe, isFavorite: !recipe.isFavorite} 
        : recipe
    ));
    
    // Also update filtered recipes
    setFilteredRecipes(filteredRecipes.map(recipe => 
      recipe.id === id 
        ? {...recipe, isFavorite: !recipe.isFavorite} 
        : recipe
    ));
    
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      toast.success(`${recipe.isFavorite ? 'Removed from' : 'Added to'} favorites`);
    }
  };

  const addRecipeToCart = async (recipe: Recipe) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }
    
    // Get missing ingredients
    const missingIngredients = recipe.ingredients.filter(ing => ing.missing);
    
    if (missingIngredients.length === 0) {
      toast.success('You have all ingredients for this recipe!');
      return;
    }
    
    try {
      // Add each missing ingredient to cart
      for (const ingredient of missingIngredients) {
        // Find a product that matches this ingredient
        // In a real app, you would have a proper product database lookup
        // This is a simplified version
        await addToCart(user.id, ingredient.name, 1);
      }
      
      toast.success(`Added ${missingIngredients.length} ingredients to cart`);
      // Navigate to the cart
      navigate('/my-orders');
    } catch (error) {
      console.error('Error adding ingredients to cart:', error);
      toast.error('Failed to add ingredients to cart');
    }
  };

  const openRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-fridge-yellow text-fridge-yellow" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <span className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-fridge-yellow text-fridge-yellow" />
          </span>
        </span>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return <div className="flex">{stars}</div>;
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch(difficulty) {
      case 'easy':
        return <Badge className="bg-fridge-green text-white">Easy</Badge>;
      case 'medium':
        return <Badge className="bg-fridge-orange text-white">Medium</Badge>;
      case 'hard':
        return <Badge className="bg-fridge-red text-white">Hard</Badge>;
      default:
        return null;
    }
  };

  const hasMissingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.some(ing => ing.missing);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommended Recipes</h1>
          <p className="text-gray-600 mt-1">Personalized recipes based on your available ingredients</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Find Recipes</CardTitle>
                <CardDescription>
                  {filteredRecipes.length} recipes found that match your ingredients
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search recipes or ingredients..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={generateRecipes}
                  disabled={geminiLoading}
                  variant="outline"
                  size="icon"
                >
                  <ChefHat className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="best-match">
              <TabsList className="mb-6">
                <TabsTrigger value="best-match">Best Match</TabsTrigger>
                <TabsTrigger value="quick-meals">Quick Meals</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
              
              <TabsContent value="best-match">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, index) => (
                      <div key={index} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : filteredRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No recipes found matching your search.</p>
                    <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes
                      .sort((a, b) => b.matchPercentage - a.matchPercentage)
                      .map((recipe) => (
                        <Card key={recipe.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-40 bg-gray-100">
                            <div className="absolute top-2 right-2 z-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                                onClick={() => toggleFavorite(recipe.id)}
                              >
                                <Heart 
                                  className={`h-5 w-5 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                                />
                              </Button>
                            </div>
                            <div className="absolute bottom-2 left-2 z-10">
                              <Badge className="bg-fridge-blue/90 backdrop-blur-sm">
                                {recipe.matchPercentage}% Match
                              </Badge>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ChefHat className="h-12 w-12 text-gray-300" />
                            </div>
                          </div>
                          
                          <CardContent className="pt-4">
                            <h3 className="font-medium text-lg mb-1">{recipe.name}</h3>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-1">
                                {renderStars(parseFloat(recipe.rating.toString()))}
                                <span className="text-sm text-gray-600 ml-1">
                                  {typeof recipe.rating === 'number' ? recipe.rating.toFixed(1) : recipe.rating}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                <Clock className="h-4 w-4" />
                                <span>{recipe.cookingTime} min</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge variant="outline" className="bg-gray-50">
                                {recipe.cuisine}
                              </Badge>
                              {getDifficultyBadge(recipe.difficulty)}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {recipe.description}
                            </p>
                            
                            {hasMissingIngredients(recipe) && (
                              <div className="mb-3">
                                <p className="text-sm text-amber-700">
                                  Missing: {recipe.ingredients
                                    .filter(ing => ing.missing)
                                    .map(ing => ing.name)
                                    .join(', ')}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex justify-between mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-fridge-blue border-fridge-blue"
                                onClick={() => openRecipeDetails(recipe)}
                              >
                                <Info className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={hasMissingIngredients(recipe)
                                  ? "text-fridge-orange border-fridge-orange" 
                                  : "text-fridge-green border-fridge-green"
                                }
                                onClick={() => addRecipeToCart(recipe)}
                              >
                                {hasMissingIngredients(recipe) ? (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add to Cart
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    All Items Ready
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="quick-meals">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={index} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes
                      .filter(recipe => recipe.cookingTime <= 20)
                      .sort((a, b) => a.cookingTime - b.cookingTime)
                      .map((recipe) => (
                        <Card key={recipe.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-40 bg-gray-100">
                            <div className="absolute top-2 right-2 z-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                                onClick={() => toggleFavorite(recipe.id)}
                              >
                                <Heart 
                                  className="h-5 w-5 fill-red-500 text-red-500" 
                                />
                              </Button>
                            </div>
                            <div className="absolute bottom-2 left-2 z-10">
                              <Badge className="bg-fridge-green/90 backdrop-blur-sm">
                                Quick - {recipe.cookingTime} min
                              </Badge>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ChefHat className="h-12 w-12 text-gray-300" />
                            </div>
                          </div>
                          
                          <CardContent className="pt-4">
                            <h3 className="font-medium text-lg mb-1">{recipe.name}</h3>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-1">
                                {renderStars(parseFloat(recipe.rating.toString()))}
                                <span className="text-sm text-gray-600 ml-1">
                                  {typeof recipe.rating === 'number' ? recipe.rating.toFixed(1) : recipe.rating}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                <Clock className="h-4 w-4" />
                                <span>{recipe.cookingTime} min</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge variant="outline" className="bg-gray-50">
                                {recipe.cuisine}
                              </Badge>
                              {getDifficultyBadge(recipe.difficulty)}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {recipe.description}
                            </p>
                            
                            {hasMissingIngredients(recipe) && (
                              <div className="mb-3">
                                <p className="text-sm text-amber-700">
                                  Missing: {recipe.ingredients
                                    .filter(ing => ing.missing)
                                    .map(ing => ing.name)
                                    .join(', ')}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex justify-between mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-fridge-blue border-fridge-blue"
                                onClick={() => openRecipeDetails(recipe)}
                              >
                                <Info className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={hasMissingIngredients(recipe)
                                  ? "text-fridge-orange border-fridge-orange" 
                                  : "text-fridge-green border-fridge-green"
                                }
                                onClick={() => addRecipeToCart(recipe)}
                              >
                                {hasMissingIngredients(recipe) ? (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add to Cart
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    All Items Ready
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="favorites">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={index} className="h-80 bg-gray-100 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredRecipes.filter(recipe => recipe.isFavorite).length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No favorite recipes yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Click the heart icon on recipes to add them to favorites</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecipes
                          .filter(recipe => recipe.isFavorite)
                          .map((recipe) => (
                            <Card key={recipe.id} className="overflow-hidden hover:shadow-md transition-shadow">
                              <div className="relative h-40 bg-gray-100">
                                <div className="absolute top-2 right-2 z-10">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                                    onClick={() => toggleFavorite(recipe.id)}
                                  >
                                    <Heart 
                                      className="h-5 w-5 fill-red-500 text-red-500" 
                                    />
                                  </Button>
                                </div>
                                <div className="absolute bottom-2 left-2 z-10">
                                  <Badge className="bg-fridge-blue/90 backdrop-blur-sm">
                                    {recipe.matchPercentage}% Match
                                  </Badge>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <ChefHat className="h-12 w-12 text-gray-300" />
                                </div>
                              </div>
                              
                              <CardContent className="pt-4">
                                <h3 className="font-medium text-lg mb-1">{recipe.name}</h3>
                                
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-1">
                                    {renderStars(parseFloat(recipe.rating.toString()))}
                                    <span className="text-sm text-gray-600 ml-1">
                                      {typeof recipe.rating === 'number' ? recipe.rating.toFixed(1) : recipe.rating}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                    <Clock className="h-4 w-4" />
                                    <span>{recipe.cookingTime} min</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 mb-3">
                                  <Badge variant="outline" className="bg-gray-50">
                                    {recipe.cuisine}
                                  </Badge>
                                  {getDifficultyBadge(recipe.difficulty)}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {recipe.description}
                                </p>
                                
                                {hasMissingIngredients(recipe) && (
                                  <div className="mb-3">
                                    <p className="text-sm text-amber-700">
                                      Missing: {recipe.ingredients
                                        .filter(ing => ing.missing)
                                        .map(ing => ing.name)
                                        .join(', ')}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="flex justify-between mt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-fridge-blue border-fridge-blue"
                                    onClick={() => openRecipeDetails(recipe)}
                                  >
                                    <Info className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className={hasMissingIngredients(recipe)
                                      ? "text-fridge-orange border-fridge-orange" 
                                      : "text-fridge-green border-fridge-green"
                                    }
                                    onClick={() => addRecipeToCart(recipe)}
                                  >
                                    {hasMissingIngredients(recipe) ? (
                                      <>
                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                        Add to Cart
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-1" />
                                        All Items Ready
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Recipe Details Dialog */}
        {selectedRecipe && (
          <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedRecipe.name}</DialogTitle>
                <DialogDescription>
                  {selectedRecipe.cuisine} • {selectedRecipe.cookingTime} min • {selectedRecipe.difficulty}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                  <ChefHat className="h-12 w-12 text-gray-300" />
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Ingredients</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className={
                        ingredient.missing
                          ? "text-amber-700 font-medium"
                          : "text-gray-600"
                      }>
                        {ingredient.name}
                        {ingredient.quantity && ingredient.unit && ` - ${ingredient.quantity} ${ingredient.unit}`}
                        {ingredient.missing && " (missing)"}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Instructions</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      {selectedRecipe.instructions.map((step, index) => (
                        <li key={index} className="text-gray-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  {hasMissingIngredients(selectedRecipe) ? (
                    <Button
                      onClick={() => addRecipeToCart(selectedRecipe)}
                      className="bg-fridge-blue hover:bg-blue-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Missing Ingredients to Cart
                    </Button>
                  ) : (
                    <Button variant="outline" className="text-fridge-green border-fridge-green">
                      <Check className="h-4 w-4 mr-2" />
                      All Ingredients Available
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default RecommendationsPage;
