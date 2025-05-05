
import { supabase } from "@/integrations/supabase/client";

// Generate mock store data with the specified names
export const generateMockStores = async (userId: string) => {
  if (!userId) return;
  
  try {
    // Check if stores already exist
    const { data: existingStores, error: checkError } = await supabase
      .from('stores')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking stores:', checkError);
      return;
    }
    
    // If stores already exist, don't add more
    if (existingStores && existingStores.length > 0) {
      console.log('Stores already exist');
      return;
    }
    
    // Sample stores to add with the specified names
    const stores = [
      {
        name: 'Makro',
        address: '123 Main St, Bangkok',
        user_id: userId
      },
      {
        name: 'Lotus',
        address: '456 Garden Rd, Bangkok',
        user_id: userId
      },
      {
        name: 'BigC',
        address: '789 Market Blvd, Bangkok',
        user_id: userId
      },
      {
        name: 'Villa Market',
        address: '101 Expat Lane, Bangkok',
        user_id: userId
      },
      {
        name: 'Tops',
        address: '202 Shopping Mall, Bangkok',
        user_id: userId
      },
      {
        name: 'Foodland',
        address: '303 Food Street, Bangkok',
        user_id: userId
      },
      {
        name: 'Gourmet Market',
        address: '404 Luxury Ave, Bangkok',
        user_id: userId
      },
      {
        name: '7-Eleven',
        address: '505 Convenience Rd, Bangkok',
        user_id: userId
      },
      {
        name: 'Tesco',
        address: '606 British Lane, Bangkok',
        user_id: userId
      },
      {
        name: 'CJ Express',
        address: '707 Quick Stop Blvd, Bangkok',
        user_id: userId
      }
    ];
    
    // Insert stores
    const { error, data } = await supabase
      .from('stores')
      .insert(stores)
      .select();
      
    if (error) {
      console.error('Error generating mock stores:', error);
      return null;
    } else {
      console.log('Mock stores generated successfully');
      return data;
    }
  } catch (error) {
    console.error('Error in generateMockStores:', error);
    return null;
  }
};

// Generate mock product data with store associations
export const generateMockProducts = async (userId: string) => {
  if (!userId) return;
  
  try {
    // Check if user already has products
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking products:', checkError);
      return;
    }
    
    // If user already has products, don't add more
    if (existingProducts && existingProducts.length > 0) {
      console.log('User already has products');
      return;
    }
    
    // Get stores first
    const { data: stores } = await supabase
      .from('stores')
      .select('id, name');
      
    if (!stores || stores.length === 0) {
      // Create stores if they don't exist
      await generateMockStores(userId);
      
      // Fetch the newly created stores
      const { data: newStores } = await supabase
        .from('stores')
        .select('id, name');
        
      if (!newStores || newStores.length === 0) {
        console.error('No stores available');
        return;
      }
      
      // Now that we have stores, create product templates
      const productTemplates = [
        { name: 'Milk', category: 'Dairy', basePrice: 2.99, unit: 'carton' },
        { name: 'Eggs', category: 'Dairy', basePrice: 3.49, unit: 'dozen' },
        { name: 'Chicken Breast', category: 'Meat', basePrice: 6.99, unit: 'kg' },
        { name: 'Broccoli', category: 'Vegetables', basePrice: 1.99, unit: 'bunch' },
        { name: 'Cheddar Cheese', category: 'Dairy', basePrice: 4.99, unit: 'pack' },
        { name: 'Lettuce', category: 'Vegetables', basePrice: 1.49, unit: 'head' },
        { name: 'Salmon', category: 'Seafood', basePrice: 12.99, unit: 'fillet' },
        { name: 'Bacon', category: 'Meat', basePrice: 5.99, unit: 'pack' },
        { name: 'Tomato', category: 'Vegetables', basePrice: 0.99, unit: 'kg' },
        { name: 'Tofu', category: 'Protein', basePrice: 2.49, unit: 'pack' },
        { name: 'Garlic', category: 'Vegetables', basePrice: 0.89, unit: 'bulb' },
        { name: 'Onion', category: 'Vegetables', basePrice: 1.29, unit: 'kg' },
        { name: 'Olive Oil', category: 'Oils', basePrice: 7.99, unit: 'bottle' },
        { name: 'Bread', category: 'Bakery', basePrice: 2.99, unit: 'loaf' },
        { name: 'Butter', category: 'Dairy', basePrice: 3.49, unit: 'pack' },
        { name: 'Yogurt', category: 'Dairy', basePrice: 1.99, unit: 'cup' },
        { name: 'Bell Pepper', category: 'Vegetables', basePrice: 1.29, unit: 'each' },
        { name: 'Mushroom', category: 'Vegetables', basePrice: 2.49, unit: 'pack' },
        { name: 'Pork Chops', category: 'Meat', basePrice: 7.99, unit: 'kg' },
        { name: 'Spinach', category: 'Vegetables', basePrice: 2.29, unit: 'bunch' },
        { name: 'Apple', category: 'Fruits', basePrice: 1.49, unit: 'kg' },
        { name: 'Banana', category: 'Fruits', basePrice: 0.99, unit: 'kg' },
        { name: 'Rice', category: 'Grains', basePrice: 4.99, unit: 'kg' },
        { name: 'Pasta', category: 'Grains', basePrice: 1.99, unit: 'pack' },
        { name: 'Ground Beef', category: 'Meat', basePrice: 8.99, unit: 'kg' },
        { name: 'Orange Juice', category: 'Beverages', basePrice: 3.99, unit: 'carton' },
        { name: 'Cereal', category: 'Breakfast', basePrice: 4.49, unit: 'box' },
        { name: 'Potato', category: 'Vegetables', basePrice: 2.49, unit: 'kg' },
        { name: 'Honey', category: 'Sweeteners', basePrice: 6.99, unit: 'jar' },
        { name: 'Coffee', category: 'Beverages', basePrice: 8.99, unit: 'bag' }
      ];
      
      // Create products spread across stores
      const products = [];
      
      // Distribute products across stores
      for (const template of productTemplates) {
        // Decide how many stores will carry this product (between 3 and 7)
        const storeCount = 3 + Math.floor(Math.random() * 5);
        
        // Shuffle stores to randomly select which ones carry the product
        const shuffledStores = [...newStores].sort(() => 0.5 - Math.random());
        const selectedStores = shuffledStores.slice(0, storeCount);
        
        for (const store of selectedStores) {
          // Add slight price variation per store (±20%)
          const priceVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
          const price = Number((template.basePrice * priceVariation).toFixed(2));
          
          // Create product variant for this store
          products.push({
            name: template.name,
            description: `Fresh ${template.name.toLowerCase()} from ${store.name}`,
            price: price,
            category: template.category,
            image_url: `https://via.placeholder.com/300?text=${encodeURIComponent(template.name)}`,
            user_id: userId,
            store_id: store.id,
            unit: template.unit
          });
        }
      }
      
      // Batch insert all products
      const { error } = await supabase
        .from('products')
        .insert(products);
        
      if (error) {
        console.error('Error generating mock products:', error);
      } else {
        console.log(`Mock products generated successfully: ${products.length} products created`);
      }
    }
  } catch (error) {
    console.error('Error in generateMockProducts:', error);
  }
};

// Generate mock ingredient data
export const generateMockIngredients = async (userId: string) => {
  if (!userId) return;
  
  try {
    // Check if user already has ingredients
    const { data: existingIngredients, error: checkError } = await supabase
      .from('ingredients')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking ingredients:', checkError);
      return;
    }
    
    // If user already has ingredients, don't add more
    if (existingIngredients && existingIngredients.length > 0) {
      console.log('User already has ingredients');
      return;
    }
    
    // Sample ingredients to add (basic pantry items)
    const ingredients = [
      {
        name: 'Eggs',
        quantity: 12,
        unit: 'unit',
        category: 'Dairy',
        expiry_date: getDateOffset(10), // 10 days from now
        user_id: userId
      },
      {
        name: 'Milk',
        quantity: 1,
        unit: 'carton',
        category: 'Dairy',
        expiry_date: getDateOffset(7),
        user_id: userId
      },
      {
        name: 'Bread',
        quantity: 1,
        unit: 'loaf',
        category: 'Bakery',
        expiry_date: getDateOffset(5),
        user_id: userId
      },
      {
        name: 'Rice',
        quantity: 5,
        unit: 'kg',
        category: 'Grains',
        expiry_date: getDateOffset(90),
        user_id: userId
      },
      {
        name: 'Salt',
        quantity: 1,
        unit: 'pack',
        category: 'Spices',
        expiry_date: getDateOffset(365),
        user_id: userId
      },
      {
        name: 'Olive Oil',
        quantity: 1,
        unit: 'bottle',
        category: 'Oils',
        expiry_date: getDateOffset(180),
        user_id: userId
      },
      {
        name: 'Onion',
        quantity: 3,
        unit: 'unit',
        category: 'Vegetables',
        expiry_date: getDateOffset(14),
        user_id: userId
      },
      {
        name: 'Garlic',
        quantity: 1,
        unit: 'bulb',
        category: 'Vegetables',
        expiry_date: getDateOffset(21),
        user_id: userId
      }
    ];
    
    // Insert ingredients
    const { error } = await supabase
      .from('ingredients')
      .insert(ingredients);
      
    if (error) {
      console.error('Error generating mock ingredients:', error);
    } else {
      console.log('Mock ingredients generated successfully');
    }
  } catch (error) {
    console.error('Error in generateMockIngredients:', error);
  }
};

// Generate example recipe recommendations
export const generateMockRecipes = () => {
  return [
    {
      id: '1',
      name: 'Classic Omelette',
      category: 'Breakfast',
      preparationTime: '15 mins',
      difficulty: 'Easy',
      imageUrl: 'https://via.placeholder.com/300?text=Omelette',
      ingredients: [
        { name: 'Eggs', quantity: 3, unit: 'unit', available: true },
        { name: 'Milk', quantity: 2, unit: 'tbsp', available: true },
        { name: 'Cheese', quantity: 30, unit: 'g', available: false },
        { name: 'Bell Pepper', quantity: 0.5, unit: 'unit', available: false },
        { name: 'Salt', quantity: 1, unit: 'pinch', available: true }
      ]
    },
    {
      id: '2',
      name: 'Chicken Stir Fry',
      category: 'Dinner',
      preparationTime: '25 mins',
      difficulty: 'Medium',
      imageUrl: 'https://via.placeholder.com/300?text=Chicken+Stir+Fry',
      ingredients: [
        { name: 'Chicken Breast', quantity: 200, unit: 'g', available: false },
        { name: 'Broccoli', quantity: 1, unit: 'cup', available: false },
        { name: 'Onion', quantity: 1, unit: 'unit', available: true },
        { name: 'Garlic', quantity: 2, unit: 'cloves', available: true },
        { name: 'Olive Oil', quantity: 2, unit: 'tbsp', available: true },
        { name: 'Rice', quantity: 1, unit: 'cup', available: true }
      ]
    },
    {
      id: '3',
      name: 'Vegetable Pasta',
      category: 'Lunch',
      preparationTime: '20 mins',
      difficulty: 'Easy',
      imageUrl: 'https://via.placeholder.com/300?text=Vegetable+Pasta',
      ingredients: [
        { name: 'Pasta', quantity: 100, unit: 'g', available: false },
        { name: 'Tomato', quantity: 2, unit: 'unit', available: false },
        { name: 'Bell Pepper', quantity: 1, unit: 'unit', available: false },
        { name: 'Onion', quantity: 1, unit: 'unit', available: true },
        { name: 'Olive Oil', quantity: 2, unit: 'tbsp', available: true },
        { name: 'Garlic', quantity: 2, unit: 'cloves', available: true }
      ]
    },
    {
      id: '4',
      name: 'Creamy Mushroom Soup',
      category: 'Soup',
      preparationTime: '30 mins',
      difficulty: 'Medium',
      imageUrl: 'https://via.placeholder.com/300?text=Mushroom+Soup',
      ingredients: [
        { name: 'Mushroom', quantity: 200, unit: 'g', available: false },
        { name: 'Onion', quantity: 1, unit: 'unit', available: true },
        { name: 'Garlic', quantity: 2, unit: 'cloves', available: true },
        { name: 'Milk', quantity: 1, unit: 'cup', available: true },
        { name: 'Butter', quantity: 2, unit: 'tbsp', available: false }
      ]
    },
    {
      id: '5',
      name: 'Fresh Fruit Salad',
      category: 'Dessert',
      preparationTime: '10 mins',
      difficulty: 'Easy',
      imageUrl: 'https://via.placeholder.com/300?text=Fruit+Salad',
      ingredients: [
        { name: 'Apple', quantity: 1, unit: 'unit', available: false },
        { name: 'Banana', quantity: 1, unit: 'unit', available: false },
        { name: 'Orange', quantity: 1, unit: 'unit', available: false },
        { name: 'Honey', quantity: 1, unit: 'tbsp', available: false }
      ]
    }
  ];
};

// Helper function to get a date offset from today
function getDateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Function to update recipe availability based on user ingredients
export const updateRecipeAvailability = async (recipes: any[], userId: string) => {
  if (!userId) return recipes;
  
  try {
    // Fetch user's ingredients
    const { data: userIngredients, error } = await supabase
      .from('ingredients')
      .select('name, quantity, unit')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    if (!userIngredients || userIngredients.length === 0) {
      // No ingredients, all recipe ingredients will be unavailable
      return recipes;
    }
    
    // Convert ingredients to a map for easier lookup
    const ingredientMap = new Map();
    userIngredients.forEach(ing => {
      ingredientMap.set(ing.name.toLowerCase(), {
        quantity: ing.quantity,
        unit: ing.unit
      });
    });
    
    // Update availability for each recipe
    const updatedRecipes = recipes.map(recipe => {
      const updatedIngredients = recipe.ingredients.map(ing => {
        const userIngredient = ingredientMap.get(ing.name.toLowerCase());
        return {
          ...ing,
          available: !!userIngredient // Mark as available if the ingredient exists in user's fridge
        };
      });
      
      // Calculate how many ingredients are missing
      const missingCount = updatedIngredients.filter(ing => !ing.available).length;
      const totalCount = updatedIngredients.length;
      
      return {
        ...recipe,
        ingredients: updatedIngredients,
        availabilityScore: (totalCount - missingCount) / totalCount,
        missingCount
      };
    });
    
    // Sort recipes by availability (most available ingredients first)
    return updatedRecipes.sort((a, b) => b.availabilityScore - a.availabilityScore);
    
  } catch (error) {
    console.error('Error updating recipe availability:', error);
    return recipes;
  }
};

// Find matching products for missing ingredients
export const findProductsForIngredients = async (ingredientNames: string[]) => {
  if (!ingredientNames || ingredientNames.length === 0) return [];
  
  try {
    // Create a query that searches for products matching any of the ingredient names
    const queries = ingredientNames.map(name => {
      return `name.ilike.%${name}%`;
    });
    
    const queryString = queries.join(',');
    
    // Fetch matching products
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        store:store_id (
          id,
          name,
          address
        )
      `)
      .or(queryString);
      
    if (error) throw error;
    
    // Group products by ingredient name
    const productsByIngredient = {};
    
    products.forEach(product => {
      const matchingIngredient = ingredientNames.find(name => 
        product.name.toLowerCase().includes(name.toLowerCase())
      );
      
      if (matchingIngredient) {
        if (!productsByIngredient[matchingIngredient]) {
          productsByIngredient[matchingIngredient] = [];
        }
        productsByIngredient[matchingIngredient].push(product);
      }
    });
    
    return productsByIngredient;
    
  } catch (error) {
    console.error('Error finding products for ingredients:', error);
    return {};
  }
};
