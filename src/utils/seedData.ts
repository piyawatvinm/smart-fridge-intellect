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
            address
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
                  address
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
                address
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

// Generate mock stores
export const generateMockStores = async (userId: string | null): Promise<void> => {
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
      return;
    }
    
    console.log('No stores found, generating mock stores...');
    
    const mockStores = [
      {
        name: 'Grocery Heaven',
        address: '123 Main Street, Anytown, USA',
        user_id: userId
      },
      {
        name: 'Fresh Market',
        address: '456 Oak Avenue, Springfield, USA',
        user_id: userId
      },
      {
        name: 'Value Mart',
        address: '789 Pine Road, Westville, USA',
        user_id: userId
      }
    ];
    
    // Insert mock stores
    const { error: insertError } = await supabase
      .from('stores')
      .insert(mockStores);
    
    if (insertError) {
      console.error('Error creating mock stores:', insertError);
      throw insertError;
    }
    
    console.log('Successfully generated mock stores');
    
  } catch (error) {
    console.error('Error creating mock stores:', error);
    // Don't rethrow the error, just log it
  }
};

// Generate mock products with ALL ingredients from recipes
export const generateMockProducts = async (userId: string | null): Promise<Product[] | void> => {
  try {
    // Check if any products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking existing products:', checkError);
      return;
    }

    // If products already exist, don't recreate them
    if (existingProducts && existingProducts.length > 0) {
      console.log('Mock products already exist, skipping creation');
      return;
    }

    // Get stores to associate products with
    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id');

    if (storeError || !stores || stores.length === 0) {
      await generateMockStores(userId);
    }

    // Fetch stores again if we had to create them
    const { data: allStores } = await supabase
      .from('stores')
      .select('id');
      
    if (!allStores || allStores.length === 0) {
      console.error('Still no stores found after creation attempt');
      return;
    }

    // Extract all unique ingredients from recipes
    const recipes = generateMockRecipes();
    const allIngredientNames = new Set();
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allIngredientNames.add(ingredient.name);
      });
    });
    
    console.log('Creating products for these ingredients:', Array.from(allIngredientNames));

    // Create products for each ingredient
    const products = [];
    
    // Helper function to distribute products across stores
    const getRandomStoreId = () => {
      const randomIndex = Math.floor(Math.random() * allStores.length);
      return allStores[randomIndex].id;
    };

    // Create specific products for each recipe ingredient
    // Spaghetti Bolognese ingredients
    products.push(
      {
        name: 'Ground Beef',
        description: 'Premium ground beef, perfect for pasta dishes',
        price: 5.99,
        category: 'Meat',
        image_url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Yellow Onions',
        description: 'Fresh yellow onions, perfect for cooking',
        price: 1.49,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Garlic',
        description: 'Fresh garlic bulbs',
        price: 0.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1615477550927-1cd5c024ebde?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Canned Tomatoes',
        description: 'Organic whole peeled tomatoes',
        price: 2.29,
        category: 'Canned Goods',
        image_url: 'https://images.unsplash.com/photo-1599983252945-c31c7b9a11b5?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Spaghetti',
        description: 'Premium Italian spaghetti pasta',
        price: 1.99,
        category: 'Pasta',
        image_url: 'https://images.unsplash.com/photo-1627634777217-c864268db30f?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Tomato Paste',
        description: 'Concentrated tomato paste, perfect for sauces',
        price: 1.29,
        category: 'Canned Goods',
        image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      // Chicken Caesar Salad ingredients
      {
        name: 'Chicken Breast',
        description: 'Boneless skinless chicken breast, perfect for salads',
        price: 4.99,
        category: 'Meat',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=2274&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Romaine Lettuce',
        description: 'Fresh crisp romaine lettuce',
        price: 2.49,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43f?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Parmesan Cheese',
        description: 'Aged Parmesan cheese, grated',
        price: 3.99,
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Croutons',
        description: 'Seasoned garlic croutons for salads',
        price: 1.99,
        category: 'Bakery',
        image_url: 'https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Caesar Dressing',
        description: 'Creamy Caesar salad dressing',
        price: 2.99,
        category: 'Condiments',
        image_url: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      // Vegetarian Stir Fry ingredients
      {
        name: 'Tofu',
        description: 'Firm tofu for stir frying',
        price: 2.49,
        category: 'Vegetarian',
        image_url: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Bell Peppers',
        description: 'Mixed bell peppers, red, yellow and green',
        price: 3.49,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=2274&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Broccoli',
        description: 'Fresh broccoli crowns',
        price: 1.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1614336215203-05a588f74627?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Carrots',
        description: 'Fresh organic carrots',
        price: 1.29,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Soy Sauce',
        description: 'Traditional soy sauce, perfect for stir fry',
        price: 2.99,
        category: 'Condiments',
        image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      // Margherita Pizza ingredients
      {
        name: 'Pizza Dough',
        description: 'Ready-to-use pizza dough',
        price: 3.49,
        category: 'Bakery',
        image_url: 'https://images.unsplash.com/photo-1622121341458-ee051ee9f9a6?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Fresh Mozzarella',
        description: 'Italian fresh mozzarella cheese',
        price: 4.99,
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1611565877126-c2952e6e2e33?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Tomatoes',
        description: 'Ripe Roma tomatoes',
        price: 2.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Fresh Basil',
        description: 'Organic fresh basil',
        price: 1.99,
        category: 'Produce',
        image_url: 'https://images.unsplash.com/photo-1600435335786-d74d2bb6de37?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Olive Oil',
        description: 'Extra virgin olive oil',
        price: 7.99,
        category: 'Oils',
        image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=2336&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      }
    );

    // Add some basic staples
    products.push(
      {
        name: 'Organic Apples',
        description: 'Fresh organic apples, locally grown',
        price: 3.99,
        category: 'Fruits',
        image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Whole Milk',
        description: 'Fresh whole milk from local farms',
        price: 2.49,
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      },
      {
        name: 'Organic Spinach',
        description: 'Fresh organic spinach',
        price: 2.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fe?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: getRandomStoreId()
      }
    );

    // Insert mock products without user_id to make them visible to all users
    const { data, error } = await supabase.from('products').insert(
      products.map(product => ({
        ...product,
        user_id: null // Make visible to all users
      }))
    ).select();
    
    if (error) {
      console.error('Error creating mock products:', error);
      return;
    }

    console.log(`Mock products created successfully: ${products.length} products`);
    return data;
  } catch (error) {
    console.error('Error in generateMockProducts:', error);
  }
};

// Generate mock ingredients
export const generateMockIngredients = async (userId: string | null): Promise<void> => {
  try {
    // Check if the user already has ingredients
    const { data: existingIngredients } = await supabase
      .from('ingredients')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    // If ingredients already exist, don't recreate them
    if (existingIngredients && existingIngredients.length > 0) {
      console.log('Mock ingredients already exist, skipping creation');
      return;
    }

    const ingredients = [
      {
        name: 'Eggs',
        quantity: 12,
        unit: 'unit',
        expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        category: 'Dairy',
        user_id: userId
      },
      {
        name: 'Milk',
        quantity: 1,
        unit: 'gallon',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        category: 'Dairy',
        user_id: userId
      },
      {
        name: 'Bread',
        quantity: 1,
        unit: 'loaf',
        expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        category: 'Bakery',
        user_id: userId
      },
      {
        name: 'Apples',
        quantity: 6,
        unit: 'unit',
        expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        category: 'Fruits',
        user_id: userId
      },
      {
        name: 'Chicken breast',
        quantity: 2,
        unit: 'lb',
        expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        category: 'Meat',
        user_id: userId
      }
    ];

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
