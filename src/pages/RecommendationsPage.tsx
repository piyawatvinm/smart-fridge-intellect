
import { Layout } from "@/components/LayoutComponents";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Clock, Heart, ShoppingCart, Star, ExternalLink, Info, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  rating: number;
  image: string;
  matchPercentage: number;
  isFavorite: boolean;
  description: string;
  missingIngredients?: string[];
}

const RecommendationsPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Mock data initialization
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          name: 'Spaghetti Carbonara',
          ingredients: ['Pasta', 'Eggs', 'Bacon', 'Parmesan Cheese', 'Black Pepper', 'Salt'],
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
          ingredients: ['Chicken Breast', 'Bell Peppers', 'Broccoli', 'Soy Sauce', 'Garlic', 'Ginger', 'Rice'],
          cookingTime: 30,
          difficulty: 'medium',
          cuisine: 'Asian',
          rating: 4.5,
          image: 'https://via.placeholder.com/300',
          matchPercentage: 85,
          isFavorite: false,
          description: 'A quick and healthy stir fry with chicken and vegetables.',
          missingIngredients: ['Ginger']
        },
        {
          id: '3',
          name: 'Vegetable Omelette',
          ingredients: ['Eggs', 'Bell Peppers', 'Onions', 'Cheese', 'Milk', 'Salt', 'Pepper'],
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
          ingredients: ['Ground Beef', 'Taco Shells', 'Lettuce', 'Tomatoes', 'Cheese', 'Sour Cream', 'Salsa'],
          cookingTime: 25,
          difficulty: 'easy',
          cuisine: 'Mexican',
          rating: 4.6,
          image: 'https://via.placeholder.com/300',
          matchPercentage: 70,
          isFavorite: false,
          description: 'Classic beef tacos with all the toppings.',
          missingIngredients: ['Ground Beef', 'Taco Shells']
        },
        {
          id: '5',
          name: 'Vegetable Curry',
          ingredients: ['Potatoes', 'Carrots', 'Peas', 'Curry Powder', 'Coconut Milk', 'Onions', 'Rice'],
          cookingTime: 40,
          difficulty: 'medium',
          cuisine: 'Indian',
          rating: 4.4,
          image: 'https://via.placeholder.com/300',
          matchPercentage: 75,
          isFavorite: false,
          description: 'A flavorful vegetable curry with a rich sauce.',
          missingIngredients: ['Curry Powder', 'Coconut Milk']
        },
        {
          id: '6',
          name: 'Caesar Salad',
          ingredients: ['Romaine Lettuce', 'Croutons', 'Parmesan Cheese', 'Caesar Dressing', 'Chicken Breast'],
          cookingTime: 15,
          difficulty: 'easy',
          cuisine: 'International',
          rating: 4.2,
          image: 'https://via.placeholder.com/300',
          matchPercentage: 80,
          isFavorite: false,
          description: 'A classic Caesar salad with homemade dressing and croutons.',
          missingIngredients: ['Caesar Dressing']
        },
        {
          id: '7',
          name: 'Tomato Soup',
          ingredients: ['Tomatoes', 'Onions', 'Garlic', 'Vegetable Broth', 'Cream', 'Basil', 'Bread'],
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
          ingredients: ['Flour', 'Eggs', 'Milk', 'Sugar', 'Baking Powder', 'Butter', 'Maple Syrup'],
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
      
      setRecipes(mockRecipes);
      setFilteredRecipes(mockRecipes);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter recipes when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
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

  const addToShoppingList = (recipe: Recipe) => {
    // In a real app, this would add missing ingredients to a shopping list
    if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
      toast.success(`Added ${recipe.missingIngredients.join(', ')} to shopping list`);
    } else {
      toast.success('You have all ingredients for this recipe!');
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
                      <div key={index} className="h-80 shimmer rounded-lg"></div>
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
                                {renderStars(recipe.rating)}
                                <span className="text-sm text-gray-600 ml-1">{recipe.rating.toFixed(1)}</span>
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
                            
                            {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-amber-700">
                                  Missing: {recipe.missingIngredients.join(', ')}
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
                                className={recipe.missingIngredients && recipe.missingIngredients.length > 0 
                                  ? "text-fridge-orange border-fridge-orange" 
                                  : "text-fridge-green border-fridge-green"
                                }
                                onClick={() => addToShoppingList(recipe)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                {recipe.missingIngredients && recipe.missingIngredients.length > 0 
                                  ? "Get Ingredients" 
                                  : "Cook Now"
                                }
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
                      <div key={index} className="h-80 shimmer rounded-lg"></div>
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
                                  className={`h-5 w-5 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
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
                                {renderStars(recipe.rating)}
                                <span className="text-sm text-gray-600 ml-1">{recipe.rating.toFixed(1)}</span>
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
                            
                            {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-amber-700">
                                  Missing: {recipe.missingIngredients.join(', ')}
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
                                className={recipe.missingIngredients && recipe.missingIngredients.length > 0 
                                  ? "text-fridge-orange border-fridge-orange" 
                                  : "text-fridge-green border-fridge-green"
                                }
                                onClick={() => addToShoppingList(recipe)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                {recipe.missingIngredients && recipe.missingIngredients.length > 0 
                                  ? "Get Ingredients" 
                                  : "Cook Now"
                                }
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
                      <div key={index} className="h-80 shimmer rounded-lg"></div>
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
                                    {renderStars(recipe.rating)}
                                    <span className="text-sm text-gray-600 ml-1">{recipe.rating.toFixed(1)}</span>
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
                                
                                {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-sm text-amber-700">
                                      Missing: {recipe.missingIngredients.join(', ')}
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
                                    className={recipe.missingIngredients && recipe.missingIngredients.length > 0 
                                      ? "text-fridge-orange border-fridge-orange" 
                                      : "text-fridge-green border-fridge-green"
                                    }
                                    onClick={() => addToShoppingList(recipe)}
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 
                                      ? "Get Ingredients" 
                                      : "Cook Now"
                                    }
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
                        selectedRecipe.missingIngredients && 
                        selectedRecipe.missingIngredients.includes(ingredient)
                          ? "text-amber-700 font-medium"
                          : "text-gray-600"
                      }>
                        {ingredient}
                        {selectedRecipe.missingIngredients && 
                         selectedRecipe.missingIngredients.includes(ingredient) && 
                         " (missing)"}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Instructions</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
                    <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
                    <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</li>
                    <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.</li>
                    <li>Excepteur sint occaecat cupidatat non proident.</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Nutrition Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Calories:</span>
                      <span className="font-medium">450 kcal</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Protein:</span>
                      <span className="font-medium">20g</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Carbs:</span>
                      <span className="font-medium">35g</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">Fat:</span>
                      <span className="font-medium">15g</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => toggleFavorite(selectedRecipe.id)}
                >
                  <Heart 
                    className={`h-4 w-4 mr-2 ${selectedRecipe.isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                  {selectedRecipe.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                
                <div className="flex gap-2">
                  {selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0 && (
                    <Button 
                      className="bg-fridge-orange hover:bg-orange-600"
                      onClick={() => addToShoppingList(selectedRecipe)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Missing to Cart
                    </Button>
                  )}
                  <Button 
                    className="bg-fridge-blue hover:bg-fridge-blue-light"
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    Start Cooking
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default RecommendationsPage;
