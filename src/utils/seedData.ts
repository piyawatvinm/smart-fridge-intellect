
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/components/ProductComponents";

// Mock store data with names, locations, and logo URLs
const MOCK_STORES = [
  {
    name: 'Makro',
    location: 'Bangkok, Thailand',
    logo_url: 'https://placehold.co/200x200?text=Makro'
  },
  {
    name: 'Lotus',
    location: 'Chiang Mai, Thailand',
    logo_url: 'https://placehold.co/200x200?text=Lotus'
  },
  {
    name: 'BigC',
    location: 'Pattaya, Thailand',
    logo_url: 'https://placehold.co/200x200?text=BigC'
  },
  {
    name: 'Villa Market',
    location: 'Sukhumvit, Bangkok',
    logo_url: 'https://placehold.co/200x200?text=Villa'
  },
  {
    name: 'Tops',
    location: 'Silom, Bangkok',
    logo_url: 'https://placehold.co/200x200?text=Tops'
  },
  {
    name: 'Foodland',
    location: 'Huai Khwang, Bangkok',
    logo_url: 'https://placehold.co/200x200?text=Foodland'
  },
  {
    name: 'Gourmet Market',
    location: 'Siam Paragon, Bangkok',
    logo_url: 'https://placehold.co/200x200?text=Gourmet'
  },
  {
    name: '7-Eleven',
    location: 'Nationwide',
    logo_url: 'https://placehold.co/200x200?text=7-Eleven'
  },
  {
    name: 'Tesco',
    location: 'Nationwide',
    logo_url: 'https://placehold.co/200x200?text=Tesco'
  },
  {
    name: 'CJ Express',
    location: 'Nationwide',
    logo_url: 'https://placehold.co/200x200?text=CJ+Express'
  }
];

// Mock product categories
const PRODUCT_CATEGORIES = [
  'Dairy', 'Meat', 'Seafood', 'Vegetables', 'Fruits', 'Bakery', 
  'Condiments', 'Beverages', 'Snacks', 'Frozen Foods', 'Canned Goods'
];

// Mock product data with details
const MOCK_PRODUCTS = [
  { name: 'Fresh Milk', category: 'Dairy', unit: 'liter', price: 45.00 },
  { name: 'Organic Eggs', category: 'Dairy', unit: 'dozen', price: 85.00 },
  { name: 'Chicken Breast', category: 'Meat', unit: 'kg', price: 120.00 },
  { name: 'Ground Beef', category: 'Meat', unit: 'kg', price: 250.00 },
  { name: 'Pork Chops', category: 'Meat', unit: 'kg', price: 180.00 },
  { name: 'Fresh Salmon', category: 'Seafood', unit: 'kg', price: 450.00 },
  { name: 'Shrimp', category: 'Seafood', unit: 'kg', price: 350.00 },
  { name: 'Broccoli', category: 'Vegetables', unit: 'kg', price: 60.00 },
  { name: 'Spinach', category: 'Vegetables', unit: 'bundle', price: 35.00 },
  { name: 'Lettuce', category: 'Vegetables', unit: 'head', price: 40.00 },
  { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', price: 45.00 },
  { name: 'Onions', category: 'Vegetables', unit: 'kg', price: 30.00 },
  { name: 'Garlic', category: 'Vegetables', unit: 'kg', price: 80.00 },
  { name: 'Bell Peppers', category: 'Vegetables', unit: 'kg', price: 90.00 },
  { name: 'Mushrooms', category: 'Vegetables', unit: 'pack', price: 40.00 },
  { name: 'Apples', category: 'Fruits', unit: 'kg', price: 120.00 },
  { name: 'Bananas', category: 'Fruits', unit: 'kg', price: 45.00 },
  { name: 'Oranges', category: 'Fruits', unit: 'kg', price: 80.00 },
  { name: 'Strawberries', category: 'Fruits', unit: 'pack', price: 100.00 },
  { name: 'Blueberries', category: 'Fruits', unit: 'pack', price: 150.00 },
  { name: 'Whole Wheat Bread', category: 'Bakery', unit: 'loaf', price: 55.00 },
  { name: 'Croissants', category: 'Bakery', unit: 'pack', price: 120.00 },
  { name: 'Bagels', category: 'Bakery', unit: 'pack', price: 85.00 },
  { name: 'Cheddar Cheese', category: 'Dairy', unit: 'kg', price: 350.00 },
  { name: 'Mozzarella', category: 'Dairy', unit: 'pack', price: 180.00 },
  { name: 'Greek Yogurt', category: 'Dairy', unit: 'cup', price: 45.00 },
  { name: 'Butter', category: 'Dairy', unit: 'pack', price: 95.00 },
  { name: 'Tofu', category: 'Vegetarian', unit: 'pack', price: 60.00 },
  { name: 'Olive Oil', category: 'Condiments', unit: 'bottle', price: 250.00 },
  { name: 'Soy Sauce', category: 'Condiments', unit: 'bottle', price: 85.00 },
  { name: 'Rice', category: 'Grains', unit: 'kg', price: 75.00 },
  { name: 'Pasta', category: 'Grains', unit: 'pack', price: 65.00 },
  { name: 'Cereal', category: 'Breakfast', unit: 'box', price: 120.00 },
  { name: 'Orange Juice', category: 'Beverages', unit: 'liter', price: 95.00 },
  { name: 'Sparkling Water', category: 'Beverages', unit: 'bottle', price: 35.00 }
];

// Mock recipe data
const MOCK_RECIPES = [
  {
    name: 'Classic Spaghetti Bolognese',
    description: 'A traditional Italian pasta dish with rich meat sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&q=80&w=2344&ixlib=rb-4.0.3',
    preparationTime: '30 minutes',
    difficulty: 'Easy',
    category: 'Italian',
    ingredients: [
      { name: 'Ground Beef', quantity: 500, unit: 'g' },
      { name: 'Onions', quantity: 1, unit: 'medium' },
      { name: 'Garlic', quantity: 2, unit: 'cloves' },
      { name: 'Tomatoes', quantity: 400, unit: 'g' },
      { name: 'Pasta', quantity: 350, unit: 'g' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
    ]
  },
  {
    name: 'Chicken Caesar Salad',
    description: 'Fresh romaine lettuce with grilled chicken and Caesar dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
    preparationTime: '20 minutes',
    difficulty: 'Easy',
    category: 'Salad',
    ingredients: [
      { name: 'Chicken Breast', quantity: 2, unit: 'pieces' },
      { name: 'Lettuce', quantity: 1, unit: 'head' },
      { name: 'Cheddar Cheese', quantity: 50, unit: 'g' },
      { name: 'Whole Wheat Bread', quantity: 2, unit: 'slices' },
      { name: 'Olive Oil', quantity: 1, unit: 'tbsp' },
    ]
  },
  {
    name: 'Vegetarian Stir Fry',
    description: 'Quick and healthy vegetable stir fry with tofu.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
    preparationTime: '15 minutes',
    difficulty: 'Easy',
    category: 'Vegetarian',
    ingredients: [
      { name: 'Tofu', quantity: 200, unit: 'g' },
      { name: 'Bell Peppers', quantity: 2, unit: 'medium' },
      { name: 'Broccoli', quantity: 1, unit: 'head' },
      { name: 'Mushrooms', quantity: 200, unit: 'g' },
      { name: 'Soy Sauce', quantity: 3, unit: 'tbsp' },
      { name: 'Rice', quantity: 200, unit: 'g' },
    ]
  },
  {
    name: 'Homemade Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomatoes, and basil.',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
    preparationTime: '40 minutes',
    difficulty: 'Medium',
    category: 'Italian',
    ingredients: [
      { name: 'Whole Wheat Bread', quantity: 1, unit: 'ball' }, // Pizza dough substitute
      { name: 'Mozzarella', quantity: 200, unit: 'g' },
      { name: 'Tomatoes', quantity: 3, unit: 'medium' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' },
    ]
  },
  {
    name: 'Healthy Breakfast Bowl',
    description: 'Nutritious breakfast with yogurt, fruits, and cereal.',
    imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
    preparationTime: '10 minutes',
    difficulty: 'Easy',
    category: 'Breakfast',
    ingredients: [
      { name: 'Greek Yogurt', quantity: 1, unit: 'cup' },
      { name: 'Strawberries', quantity: 100, unit: 'g' },
      { name: 'Blueberries', quantity: 50, unit: 'g' },
      { name: 'Cereal', quantity: 50, unit: 'g' },
    ]
  }
];

// Generate mock stores
export const generateMockStores = async (userId: string | null): Promise<any[]> => {
  try {
    // Check if stores already exist
    const { data: existingStores, error } = await supabase
      .from('stores')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error checking for stores:', error);
      throw error;
    }
    
    if (existingStores && existingStores.length > 0) {
      console.log('Mock stores already exist, skipping creation');
      return existingStores;
    }
    
    console.log('No stores found, generating mock stores...');
    
    // Insert the 10 mock stores
    const mockStores = MOCK_STORES.map(store => ({
      ...store,
      user_id: userId
    }));
    
    // Insert mock stores
    const { data, error: insertError } = await supabase
      .from('stores')
      .insert(mockStores)
      .select();
    
    if (insertError) {
      console.error('Error creating mock stores:', insertError);
      throw insertError;
    }
    
    console.log('Successfully generated mock stores:', data?.length || 0);
    return data || [];
    
  } catch (error) {
    console.error('Error creating mock stores:', error);
    return [];
  }
};

// Generate mock products with distribution across stores
export const generateMockProducts = async (userId: string | null): Promise<Product[] | null> => {
  try {
    // Check if any products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing products:', checkError);
      return null;
    }

    // If products already exist, don't recreate them
    if (existingProducts && existingProducts.length > 0) {
      console.log('Mock products already exist, skipping creation');
      // Return existing products
      const { data: products } = await supabase.from('products').select('*');
      return products;
    }

    // Get stores to associate products with
    let { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id, name');

    if (storeError || !stores || stores.length === 0) {
      console.log('No stores found, generating stores first...');
      stores = await generateMockStores(userId);
      
      if (!stores || stores.length === 0) {
        console.error('Failed to create stores');
        return null;
      }
    }
      
    console.log(`Found ${stores.length} stores to assign products to`);

    // Create multiple products for each store with variations
    const productsToInsert: any[] = [];
    
    // For each mock product, create variations in different stores
    MOCK_PRODUCTS.forEach(mockProduct => {
      // Determine how many stores will have this product (between 1 and 5)
      const storeCount = Math.floor(Math.random() * 5) + 1;
      
      // Randomly select stores for this product
      const selectedStoreIndices = new Set<number>();
      while (selectedStoreIndices.size < Math.min(storeCount, stores.length)) {
        selectedStoreIndices.add(Math.floor(Math.random() * stores.length));
      }
      
      // Create product entries for each selected store
      Array.from(selectedStoreIndices).forEach(storeIndex => {
        const store = stores[storeIndex];
        
        // Vary the price slightly for each store (±15%)
        const basePriceVariation = 0.85 + (Math.random() * 0.3); // between 85% and 115% of base price
        const storePrice = Math.round((mockProduct.price * basePriceVariation) * 100) / 100;
        
        productsToInsert.push({
          name: mockProduct.name,
          description: `${mockProduct.name} from ${store.name}`,
          price: storePrice,
          category: mockProduct.category,
          unit: mockProduct.unit,
          user_id: null, // Make visible to all users
          store_id: store.id,
          image_url: `https://source.unsplash.com/random/300x200/?${encodeURIComponent(mockProduct.name.toLowerCase())}`
        });
      });
    });

    console.log(`Preparing to insert ${productsToInsert.length} product variants...`);

    // Insert products in batches to avoid exceeding request limits
    const BATCH_SIZE = 50;
    const batches = [];
    
    for (let i = 0; i < productsToInsert.length; i += BATCH_SIZE) {
      const batch = productsToInsert.slice(i, i + BATCH_SIZE);
      batches.push(batch);
    }
    
    let allInsertedProducts: any[] = [];
    
    for (const batch of batches) {
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        console.error('Error inserting product batch:', error);
      } else if (data) {
        allInsertedProducts = [...allInsertedProducts, ...data];
      }
    }

    console.log(`Successfully generated ${allInsertedProducts.length} products`);
    return allInsertedProducts;
  } catch (error) {
    console.error('Error in generateMockProducts:', error);
    return null;
  }
};

// Generate mock recipes with linked products
export const generateMockRecipes = async (): Promise<any[]> => {
  try {
    // Check if recipes already exist
    const { data: existingRecipes, error: checkError } = await supabase
      .from('recipes')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing recipes:', checkError);
      return MOCK_RECIPES.map((recipe, index) => ({
        ...recipe,
        id: `mock-${index + 1}`,
        missingCount: recipe.ingredients.length
      }));
    }

    if (existingRecipes && existingRecipes.length > 0) {
      console.log('Recipes already exist, using mock data with availability check');
      return MOCK_RECIPES.map((recipe, index) => ({
        ...recipe,
        id: existingRecipes[0]?.id || `mock-${index + 1}`,
        missingCount: recipe.ingredients.length
      }));
    }
    
    // Insert recipes into database
    const recipesToInsert = MOCK_RECIPES.map(recipe => ({
      name: recipe.name,
      description: recipe.description,
      image_url: recipe.imageUrl,
      preparation_time: recipe.preparationTime,
      difficulty: recipe.difficulty,
      category: recipe.category
    }));
    
    const { data: insertedRecipes, error: insertError } = await supabase
      .from('recipes')
      .insert(recipesToInsert)
      .select();
    
    if (insertError) {
      console.error('Error inserting recipes:', insertError);
      return MOCK_RECIPES.map((recipe, index) => ({
        ...recipe,
        id: `mock-${index + 1}`,
        missingCount: recipe.ingredients.length
      }));
    }
    
    // Insert recipe ingredients with product links
    if (insertedRecipes) {
      // Get all products to match ingredients
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name');
        
      if (allProducts && allProducts.length > 0) {
        for (let i = 0; i < insertedRecipes.length; i++) {
          const recipe = insertedRecipes[i];
          const mockRecipe = MOCK_RECIPES[i];
          
          // For each ingredient, find matching product
          for (const ingredient of mockRecipe.ingredients) {
            // Find product that matches ingredient name (case insensitive partial match)
            const matchingProduct = allProducts.find(product => 
              product.name.toLowerCase().includes(ingredient.name.toLowerCase()) || 
              ingredient.name.toLowerCase().includes(product.name.toLowerCase())
            );
            
            if (matchingProduct) {
              // Insert recipe ingredient with product link
              await supabase.from('recipe_ingredients').insert({
                recipe_id: recipe.id,
                ingredient_name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                product_id: matchingProduct.id
              });
            } else {
              // Insert recipe ingredient without product link
              await supabase.from('recipe_ingredients').insert({
                recipe_id: recipe.id,
                ingredient_name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit
              });
            }
          }
        }
      }
      
      // Return recipes with ingredient counts
      const recipesWithCounts = insertedRecipes.map((recipe, index) => ({
        ...recipe,
        imageUrl: MOCK_RECIPES[index].imageUrl,
        ingredients: MOCK_RECIPES[index].ingredients.map(ing => ({
          ...ing,
          available: false
        })),
        missingCount: MOCK_RECIPES[index].ingredients.length
      }));
      
      return recipesWithCounts;
    }
    
    // Fallback to mock data if database operations fail
    return MOCK_RECIPES.map((recipe, index) => ({
      ...recipe,
      id: `mock-${index + 1}`,
      missingCount: recipe.ingredients.length
    }));
  } catch (error) {
    console.error('Error generating recipes:', error);
    return MOCK_RECIPES.map((recipe, index) => ({
      ...recipe,
      id: `mock-${index + 1}`,
      missingCount: recipe.ingredients.length
    }));
  }
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
        const hasIngredient = ingredients.some(userIngredient => {
          // Safely check if the properties exist and are strings before using toLowerCase()
          const ingredientName = typeof ingredient.name === 'string' ? ingredient.name.toLowerCase() : '';
          const userIngredientName = typeof userIngredient.name === 'string' ? userIngredient.name.toLowerCase() : '';
          
          return userIngredientName.includes(ingredientName) || ingredientName.includes(userIngredientName);
        });
        
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

// Helper function to find products for ingredients
export const findProductsForIngredients = async (ingredientNames: string[]): Promise<Record<string, any[]>> => {
  try {
    console.log('Finding products for ingredients:', ingredientNames);
    
    // Ensure mock data exists
    try {
      await generateMockStores(null);
      await generateMockProducts(null);
    } catch (error) {
      console.error('Error ensuring mock data exists:', error);
      // Continue execution even if there's an error with mock data generation
    }
    
    const result: Record<string, any[]> = {};
    
    // For each ingredient name, find matching products
    for (const name of ingredientNames) {
      console.log('Searching for products matching:', name);
      
      // Query products where the name contains the ingredient name (case insensitive)
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          store:store_id (
            id,
            name,
            address,
            logo_url,
            location
          )
        `)
        .ilike('name', `%${name}%`);
      
      if (error) {
        console.error('Error searching for products:', error);
        result[name] = [];
        continue;
      }
      
      // If no products match directly, try relaxing the search
      if (!products || products.length === 0) {
        // Split the ingredient name and search for parts
        const parts = name.split(' ');
        if (parts.length > 1) {
          for (const part of parts) {
            if (part.length < 3) continue; // Skip short words like "of", "to", etc.
            
            const { data: partProducts, error: partError } = await supabase
              .from('products')
              .select(`
                *,
                store:store_id (
                  id,
                  name,
                  address,
                  logo_url,
                  location
                )
              `)
              .ilike('name', `%${part}%`);
            
            if (!partError && partProducts && partProducts.length > 0) {
              // Add these products to the result for this ingredient
              result[name] = partProducts;
              console.log(`Found ${partProducts.length} products matching part "${part}" of ingredient "${name}"`);
              break;
            }
          }
        }
      } else {
        result[name] = products;
        console.log(`Found ${products.length} products matching ingredient "${name}"`);
      }
      
      // If still no products found, check the category that might match
      if (!result[name] || result[name].length === 0) {
        const category = getCategoryForIngredient(name);
        if (category) {
          const { data: categoryProducts, error: categoryError } = await supabase
            .from('products')
            .select(`
              *,
              store:store_id (
                id,
                name,
                address,
                logo_url,
                location
              )
            `)
            .eq('category', category);
          
          if (!categoryError && categoryProducts && categoryProducts.length > 0) {
            result[name] = categoryProducts;
            console.log(`Found ${categoryProducts.length} products by category "${category}" for ingredient "${name}"`);
          } else {
            result[name] = [];
          }
        } else {
          result[name] = [];
        }
      }
    }
    
    console.log('Products found:', result);
    return result;
  } catch (error) {
    console.error('Error finding products for ingredients:', error);
    return {};
  }
};

// Helper function to determine ingredient category
const getCategoryForIngredient = (name: string): string | null => {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('beef') || nameLower.includes('chicken') || nameLower.includes('pork') || 
      nameLower.includes('fish') || nameLower.includes('meat')) {
    return 'Meat';
  } else if (nameLower.includes('milk') || nameLower.includes('cheese') || 
            nameLower.includes('yogurt') || nameLower.includes('cream')) {
    return 'Dairy';
  } else if (nameLower.includes('apple') || nameLower.includes('banana') || 
            nameLower.includes('berry') || nameLower.includes('fruit')) {
    return 'Fruits';
  } else if (nameLower.includes('potato') || nameLower.includes('onion') || 
            nameLower.includes('carrot') || nameLower.includes('tomato') || 
            nameLower.includes('vegetable')) {
    return 'Vegetables';
  } else if (nameLower.includes('pasta') || nameLower.includes('rice') || 
            nameLower.includes('bread') || nameLower.includes('flour')) {
    return 'Bakery';
  }
  
  return null;
};

// Helper function to determine category based on item name
export const getCategoryForItem = (name: string): string => {
  name = name.toLowerCase();
  
  if (name.includes('milk') || name.includes('yogurt') || name.includes('cheese') || name.includes('butter')) {
    return 'Dairy';
  } else if (name.includes('bread') || name.includes('bun') || name.includes('cake') || name.includes('pastry')) {
    return 'Bakery';
  } else if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
            name.includes('berry') || name.includes('fruit')) {
    return 'Fruits';
  } else if (name.includes('tomato') || name.includes('potato') || name.includes('onion') ||
            name.includes('carrot') || name.includes('lettuce') || name.includes('vegetable')) {
    return 'Vegetables';
  } else if (name.includes('beef') || name.includes('chicken') || name.includes('pork') ||
            name.includes('steak') || name.includes('fish') || name.includes('meat')) {
    return 'Meat';
  } else if (name.includes('rice') || name.includes('pasta') || name.includes('flour') ||
            name.includes('cereal') || name.includes('grain')) {
    return 'Grains';
  } else if (name.includes('sugar') || name.includes('salt') || name.includes('pepper') ||
            name.includes('spice') || name.includes('herb')) {
    return 'Spices';
  } else if (name.includes('oil') || name.includes('vinegar') || name.includes('sauce') ||
            name.includes('ketchup') || name.includes('mayonnaise') || name.includes('dressing')) {
    return 'Condiments';
  } else if (name.includes('juice') || name.includes('soda') || name.includes('water') ||
            name.includes('tea') || name.includes('coffee') || name.includes('drink')) {
    return 'Beverages';
  } else if (name.includes('cookie') || name.includes('chocolate') || name.includes('candy') ||
            name.includes('sweet') || name.includes('snack') || name.includes('chips')) {
    return 'Snacks';
  } else {
    return 'Other';
  }
};

// Initialize data for a new user or application
export const initializeAppData = async (userId: string | null = null): Promise<void> => {
  console.log('Initializing app data...');
  
  // Generate stores if they don't exist
  const stores = await generateMockStores(userId);
  console.log(`Generated ${stores.length} stores`);
  
  // Generate products if they don't exist
  const products = await generateMockProducts(userId);
  console.log(`Generated ${products?.length || 0} products`);
  
  // Generate recipes if they don't exist
  const recipes = await generateMockRecipes();
  console.log(`Generated ${recipes.length} recipes`);
  
  console.log('App data initialization complete');
};

// Generate mock ingredients for a user
export const generateMockIngredients = async (userId: string | null): Promise<void> => {
  try {
    // Check if the user already has ingredients
    if (!userId) return;
    
    const { data: existingIngredients } = await supabase
      .from('ingredients')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    // If ingredients already exist, don't recreate them
    if (existingIngredients && existingIngredients.length > 0) {
      console.log('User already has ingredients, skipping creation');
      return;
    }

    // Get some random products to use as ingredients
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .limit(10);
    
    if (!products || products.length === 0) {
      console.log('No products found, generating some first');
      await generateMockProducts(null);
      return;
    }

    // Create ingredients from products
    const ingredients = products.slice(0, 5).map(product => {
      // Set expiry date to 7-14 days in the future
      const daysToAdd = Math.floor(Math.random() * 7) + 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);
      
      return {
        name: product.name,
        quantity: Math.floor(Math.random() * 5) + 1,
        unit: product.unit || 'unit',
        category: product.category || getCategoryForItem(product.name),
        expiry_date: expiryDate.toISOString(),
        user_id: userId,
        product_id: product.id
      };
    });

    // Insert mock ingredients
    const { error } = await supabase.from('ingredients').insert(ingredients);
    
    if (error) {
      console.error('Error creating mock ingredients:', error);
      return;
    }

    console.log('Mock ingredients created successfully');
  } catch (error) {
    console.error('Error in generateMockIngredients:', error);
  }
};
