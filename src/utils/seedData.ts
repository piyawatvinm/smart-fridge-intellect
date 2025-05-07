
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/components/ProductComponents";

// Generate mock recipes for recommendations
export const generateMockRecipes = () => {
  return [
    {
      id: '1',
      name: 'Classic Spaghetti Bolognese',
      description: 'A traditional Italian pasta dish with rich meat sauce.',
      imageUrl: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&q=80&w=2344&ixlib=rb-4.0.3',
      preparationTime: '30 minutes',
      difficulty: 'Easy',
      category: 'Italian',
      ingredients: [
        { name: 'Ground beef', quantity: 500, unit: 'g', available: false },
        { name: 'Onion', quantity: 1, unit: 'medium', available: false },
        { name: 'Garlic', quantity: 2, unit: 'cloves', available: false },
        { name: 'Canned tomatoes', quantity: 400, unit: 'g', available: false },
        { name: 'Spaghetti', quantity: 350, unit: 'g', available: false },
        { name: 'Tomato paste', quantity: 2, unit: 'tbsp', available: false },
      ],
      missingCount: 6
    },
    {
      id: '2',
      name: 'Classic Chicken Caesar Salad',
      description: 'Fresh romaine lettuce with grilled chicken and Caesar dressing.',
      imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
      preparationTime: '20 minutes',
      difficulty: 'Easy',
      category: 'Salad',
      ingredients: [
        { name: 'Chicken breast', quantity: 2, unit: 'pieces', available: false },
        { name: 'Romaine lettuce', quantity: 1, unit: 'head', available: false },
        { name: 'Parmesan cheese', quantity: 50, unit: 'g', available: false },
        { name: 'Croutons', quantity: 100, unit: 'g', available: false },
        { name: 'Caesar dressing', quantity: 60, unit: 'ml', available: false },
      ],
      missingCount: 5
    },
    {
      id: '3',
      name: 'Vegetarian Stir Fry',
      description: 'Quick and healthy vegetable stir fry with tofu.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
      preparationTime: '15 minutes',
      difficulty: 'Easy',
      category: 'Vegetarian',
      ingredients: [
        { name: 'Tofu', quantity: 200, unit: 'g', available: false },
        { name: 'Bell peppers', quantity: 2, unit: 'medium', available: false },
        { name: 'Broccoli', quantity: 1, unit: 'head', available: false },
        { name: 'Carrot', quantity: 2, unit: 'medium', available: false },
        { name: 'Soy sauce', quantity: 3, unit: 'tbsp', available: false },
      ],
      missingCount: 5
    },
    {
      id: '4',
      name: 'Homemade Margherita Pizza',
      description: 'Classic pizza with fresh mozzarella, tomatoes, and basil.',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
      preparationTime: '40 minutes',
      difficulty: 'Medium',
      category: 'Italian',
      ingredients: [
        { name: 'Pizza dough', quantity: 1, unit: 'ball', available: false },
        { name: 'Fresh mozzarella', quantity: 200, unit: 'g', available: false },
        { name: 'Tomatoes', quantity: 3, unit: 'medium', available: false },
        { name: 'Fresh basil', quantity: 10, unit: 'leaves', available: false },
        { name: 'Olive oil', quantity: 2, unit: 'tbsp', available: false },
      ],
      missingCount: 5
    },
  ];
};

// Update recipe availability based on user's ingredients
export const updateRecipeAvailability = async (recipes, userId) => {
  try {
    // Fetch user's ingredients
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .eq('user_id', userId);
    
    if (!ingredients) return recipes;
    
    // For each recipe, check if the user has the ingredients
    return recipes.map(recipe => {
      const updatedIngredients = recipe.ingredients.map(ingredient => {
        // Check if user has this ingredient (case-insensitive partial match)
        const hasIngredient = ingredients.some(userIngredient => 
          userIngredient.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
          ingredient.name.toLowerCase().includes(userIngredient.name.toLowerCase())
        );
        
        return { ...ingredient, available: hasIngredient };
      });
      
      // Count missing ingredients
      const missingCount = updatedIngredients.filter(ing => !ing.available).length;
      
      return {
        ...recipe,
        ingredients: updatedIngredients,
        missingCount
      };
    });
  } catch (error) {
    console.error('Error updating recipe availability:', error);
    return recipes;
  }
};

// Find products matching missing ingredients
export const findProductsForIngredients = async (ingredientNames) => {
  try {
    const results = {};
    
    // Get all products
    const { data: products } = await supabase
      .from('products')
      .select(`
        *,
        store:store_id (
          id,
          name,
          address
        )
      `);
    
    if (!products) return {};
    
    // For each ingredient, find matching products
    ingredientNames.forEach(ingredientName => {
      const matchingProducts = products.filter(product => {
        const productName = product.name.toLowerCase();
        const ingredientLower = ingredientName.toLowerCase();
        
        // Match product names that contain the ingredient name or vice versa
        return productName.includes(ingredientLower) || 
               ingredientLower.includes(productName);
      });
      
      results[ingredientName] = matchingProducts;
    });
    
    return results;
  } catch (error) {
    console.error('Error finding products for ingredients:', error);
    return {};
  }
};

// Add any other utility functions as needed
