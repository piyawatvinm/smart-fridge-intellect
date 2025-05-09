
import { supabase } from '@/integrations/supabase/client';

// --------- Core Data Initialization Functions ---------
export const initializeAppData = async (userId: string | null) => {
  if (!userId) {
    console.log('No user ID provided, initializing with public data only');
  }

  try {
    // Initialize stores and products
    const stores = await initializeStores(userId);
    const products = await initializeProducts(userId);
    
    // Initialize recipes and ingredients
    await initializeRecipes();
    
    if (userId) {
      // Initialize user-specific data
      await initializeIngredients(userId);
    }
    
    return { stores, products };
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
};

// --------- Store Functions ---------
export const initializeStores = async (userId: string | null) => {
  try {
    console.log('Initializing stores data...');
    
    const storeData = [
      { 
        name: 'Makro', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Rama IV Road, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Lotus', 
        location: 'Multiple locations in Thailand',
        logo_url: '/placeholder.svg',
        address: 'Sukhumvit Road, Bangkok',
        user_id: userId 
      },
      { 
        name: 'BigC', 
        location: 'Nationwide, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Ratchadamri, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Villa Market', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Sukhumvit 33, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Tops', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Central World, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Foodland', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Sukhumvit 16, Bangkok',
        user_id: userId 
      },
      { 
        name: 'Gourmet Market', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'EmQuartier, Bangkok',
        user_id: userId 
      },
      { 
        name: '7-Eleven', 
        location: 'Nationwide, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Multiple locations',
        user_id: userId 
      },
      { 
        name: 'Tesco', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Rama III, Bangkok',
        user_id: userId 
      },
      { 
        name: 'CJ Express', 
        location: 'Bangkok, Thailand',
        logo_url: '/placeholder.svg',
        address: 'Wireless Road, Bangkok',
        user_id: userId 
      }
    ];

    // Check if stores already exist
    const { data: existingStores, error: checkError } = await supabase
      .from('stores')
      .select('id, name')
      .limit(10);
      
    if (checkError) {
      console.error('Error checking existing stores:', checkError);
      return [];
    }
    
    if (existingStores && existingStores.length > 0) {
      console.log(`${existingStores.length} stores already exist, skipping creation`);
      return existingStores;
    }

    // Insert all store records
    const { data: insertedStores, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select();

    if (error) {
      console.error('Error inserting stores:', error);
      return [];
    }

    console.log(`${insertedStores.length} stores created`);
    return insertedStores;
  } catch (error) {
    console.error('Error in initializeStores:', error);
    return [];
  }
};

// Function alias for backward compatibility
export const generateMockStores = initializeStores;

// --------- Product Functions ---------
export const initializeProducts = async (userId: string | null) => {
  try {
    console.log('Initializing products data...');
    
    // First fetch all stores to link products to them
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name');
      
    if (storesError) {
      console.error('Error fetching stores for product creation:', storesError);
      return [];
    }
    
    if (!stores || stores.length === 0) {
      console.log('No stores found. Creating stores first...');
      const createdStores = await initializeStores(userId);
      if (!createdStores || createdStores.length === 0) {
        console.error('Failed to create stores');
        return [];
      }
      stores.push(...createdStores);
    }

    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(10);
      
    if (checkError) {
      console.error('Error checking existing products:', checkError);
      return [];
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.log(`${existingProducts.length} products already exist, skipping creation`);
      // Fetch and return a representative sample
      const { data: sampleProducts } = await supabase
        .from('products')
        .select('*')
        .limit(20);
      return sampleProducts || [];
    }
    
    // Common food products to create
    const productTemplates = [
      { name: 'Milk', category: 'Dairy', unit: 'carton', basePrice: 3.99 },
      { name: 'Eggs', category: 'Dairy', unit: 'dozen', basePrice: 2.99 },
      { name: 'Chicken Breast', category: 'Meat', unit: 'kg', basePrice: 7.99 },
      { name: 'Ground Beef', category: 'Meat', unit: 'kg', basePrice: 8.99 },
      { name: 'Salmon Fillet', category: 'Seafood', unit: 'kg', basePrice: 15.99 },
      { name: 'Broccoli', category: 'Vegetables', unit: 'kg', basePrice: 2.49 },
      { name: 'Carrots', category: 'Vegetables', unit: 'kg', basePrice: 1.99 },
      { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', basePrice: 3.29 },
      { name: 'Potatoes', category: 'Vegetables', unit: 'kg', basePrice: 4.49 },
      { name: 'Onions', category: 'Vegetables', unit: 'kg', basePrice: 1.99 },
      { name: 'Garlic', category: 'Vegetables', unit: 'head', basePrice: 0.99 },
      { name: 'Spinach', category: 'Vegetables', unit: 'bunch', basePrice: 2.99 },
      { name: 'Lettuce', category: 'Vegetables', unit: 'head', basePrice: 2.49 },
      { name: 'Bell Peppers', category: 'Vegetables', unit: 'kg', basePrice: 4.99 },
      { name: 'Mushrooms', category: 'Vegetables', unit: 'kg', basePrice: 5.49 },
      { name: 'Apples', category: 'Fruits', unit: 'kg', basePrice: 3.99 },
      { name: 'Bananas', category: 'Fruits', unit: 'kg', basePrice: 1.99 },
      { name: 'Oranges', category: 'Fruits', unit: 'kg', basePrice: 2.99 },
      { name: 'Grapes', category: 'Fruits', unit: 'kg', basePrice: 4.99 },
      { name: 'Strawberries', category: 'Fruits', unit: 'container', basePrice: 3.99 },
      { name: 'Bread', category: 'Bakery', unit: 'loaf', basePrice: 2.49 },
      { name: 'Rice', category: 'Grains', unit: 'kg', basePrice: 4.99 },
      { name: 'Pasta', category: 'Grains', unit: 'package', basePrice: 1.99 },
      { name: 'Cheddar Cheese', category: 'Dairy', unit: 'kg', basePrice: 8.99 },
      { name: 'Greek Yogurt', category: 'Dairy', unit: 'container', basePrice: 3.49 },
      { name: 'Butter', category: 'Dairy', unit: 'pack', basePrice: 4.29 },
      { name: 'Olive Oil', category: 'Pantry', unit: 'bottle', basePrice: 8.99 },
      { name: 'Salt', category: 'Pantry', unit: 'pack', basePrice: 1.49 },
      { name: 'Black Pepper', category: 'Pantry', unit: 'pack', basePrice: 2.99 },
      { name: 'Sugar', category: 'Pantry', unit: 'kg', basePrice: 2.49 }
    ];
    
    // Generate a batch of products, each product in multiple stores with slight price variations
    const productsToInsert = [];
    
    for (const template of productTemplates) {
      // Determine how many stores will carry this product (between 3 and 8)
      const storeCount = Math.floor(Math.random() * 6) + 3;
      
      // Select random stores for this product
      const shuffledStores = [...stores].sort(() => 0.5 - Math.random());
      const selectedStores = shuffledStores.slice(0, storeCount);
      
      for (const store of selectedStores) {
        // Add price variation between stores (± 15%)
        const priceVariation = (Math.random() * 0.3) - 0.15; // -15% to +15%
        const price = Math.round((template.basePrice * (1 + priceVariation)) * 100) / 100;
        
        productsToInsert.push({
          name: template.name,
          category: template.category,
          description: `Fresh ${template.name.toLowerCase()}`,
          price: price, 
          unit: template.unit,
          store_id: store.id,
          user_id: userId,
          image_url: '/placeholder.svg'  // Placeholder image
        });
      }
    }
    
    // Batch insert products
    const batchSize = 50; // Insert in smaller batches to avoid potential issues
    const insertedProducts = [];
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
        
      if (error) {
        console.error(`Error inserting products batch ${i/batchSize + 1}:`, error);
      } else if (data) {
        insertedProducts.push(...data);
        console.log(`Inserted ${data.length} products in batch ${i/batchSize + 1}`);
      }
    }
    
    console.log(`Total of ${insertedProducts.length} products created`);
    return insertedProducts;
  } catch (error) {
    console.error('Error in initializeProducts:', error);
    return [];
  }
};

// Function alias for backward compatibility
export const generateMockProducts = initializeProducts;

// --------- Ingredients Functions ---------
export const initializeIngredients = async (userId: string) => {
  try {
    if (!userId) {
      console.log('No user ID provided, skipping ingredients initialization');
      return [];
    }
    
    console.log('Initializing ingredients data...');
    
    // Check if user already has ingredients
    const { data: existingIngredients, error: checkError } = await supabase
      .from('ingredients')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing ingredients:', checkError);
      return [];
    }
    
    if (existingIngredients && existingIngredients.length > 0) {
      console.log(`User already has ingredients, skipping creation`);
      const { data } = await supabase
        .from('ingredients')
        .select('*')
        .eq('user_id', userId);
      return data || [];
    }
    
    // Get some products to convert into ingredients
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, unit')
      .limit(15);  // Get a few products to start with
      
    if (productsError || !products || products.length === 0) {
      console.error('Error fetching products for ingredients:', productsError);
      return [];
    }
    
    // Create starter ingredients from the products
    const ingredientsToInsert = products.map(product => {
      // Random expiry date between 3 and 30 days from now
      const daysToExpiry = Math.floor(Math.random() * 27) + 3;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToExpiry);
      
      return {
        name: product.name,
        quantity: Math.floor(Math.random() * 5) + 1, // 1-5 units
        unit: product.unit,
        category: product.category,
        expiry_date: expiryDate.toISOString().split('T')[0],
        user_id: userId,
        product_id: product.id
      };
    });
    
    // Insert ingredients
    const { data: insertedIngredients, error } = await supabase
      .from('ingredients')
      .insert(ingredientsToInsert)
      .select();
      
    if (error) {
      console.error('Error inserting ingredients:', error);
      return [];
    }
    
    console.log(`${insertedIngredients.length} ingredients created`);
    return insertedIngredients;
  } catch (error) {
    console.error('Error in initializeIngredients:', error);
    return [];
  }
};

// Function alias for backward compatibility
export const generateMockIngredients = initializeIngredients;

// --------- Recipe Functions ---------
export const initializeRecipes = async () => {
  try {
    console.log('Initializing recipes data...');
    
    // Check if recipes already exist
    const { data: existingRecipes, error: checkError } = await supabase
      .from('recipes')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing recipes:', checkError);
      return [];
    }
    
    if (existingRecipes && existingRecipes.length > 0) {
      console.log(`Recipes already exist, skipping creation`);
      return generateMockRecipes(); // Return mock recipes for client-side usage
    }
    
    const recipesToInsert = [
      {
        name: 'Vegetable Stir Fry',
        description: 'A quick and healthy veggie stir fry',
        preparation_time: '15 min',
        difficulty: 'Easy',
        category: 'Vegetarian',
        image_url: 'https://source.unsplash.com/random/300×300/?stirfry'
      },
      {
        name: 'Classic Chicken Soup',
        description: 'Comforting homemade chicken soup',
        preparation_time: '45 min',
        difficulty: 'Medium',
        category: 'Soups',
        image_url: 'https://source.unsplash.com/random/300×300/?chickensoup'
      },
      {
        name: 'Greek Salad',
        description: 'Traditional Greek salad with feta and olives',
        preparation_time: '10 min',
        difficulty: 'Easy',
        category: 'Salads',
        image_url: 'https://source.unsplash.com/random/300×300/?greeksalad'
      },
      {
        name: 'Pasta Carbonara',
        description: 'Creamy Italian pasta with bacon',
        preparation_time: '25 min',
        difficulty: 'Medium',
        category: 'Pasta',
        image_url: 'https://source.unsplash.com/random/300×300/?carbonara'
      },
      {
        name: 'Beef Stew',
        description: 'Hearty beef stew with vegetables',
        preparation_time: '90 min',
        difficulty: 'Hard',
        category: 'Meat',
        image_url: 'https://source.unsplash.com/random/300×300/?beefstew'
      },
      {
        name: 'Vegetable Curry',
        description: 'Spicy vegetable curry',
        preparation_time: '35 min',
        difficulty: 'Medium',
        category: 'Vegetarian',
        image_url: 'https://source.unsplash.com/random/300×300/?curry'
      },
      {
        name: 'Mushroom Risotto',
        description: 'Creamy Italian rice with mushrooms',
        preparation_time: '40 min',
        difficulty: 'Medium',
        category: 'Rice',
        image_url: 'https://source.unsplash.com/random/300×300/?risotto'
      }
    ];
    
    // Insert recipes
    const { data: insertedRecipes, error } = await supabase
      .from('recipes')
      .insert(recipesToInsert)
      .select();
      
    if (error) {
      console.error('Error inserting recipes:', error);
      return [];
    }
    
    console.log(`${insertedRecipes.length} recipes created`);
    
    // For each recipe, create recipe ingredients
    for (const recipe of insertedRecipes) {
      // Get a random set of products to use as ingredients
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, category')
        .limit(30);  // Get a larger pool to select from
        
      if (productsError || !products) {
        console.error('Error fetching products for recipe ingredients:', productsError);
        continue;
      }
      
      // Select 5-8 random products as ingredients for this recipe
      const ingredientCount = Math.floor(Math.random() * 4) + 5;  // 5-8 ingredients
      const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffledProducts.slice(0, ingredientCount);
      
      const recipeIngredientsToInsert = selectedProducts.map(product => {
        return {
          recipe_id: recipe.id,
          product_id: product.id,
          ingredient_name: product.name,
          quantity: Math.floor(Math.random() * 4) + 1,  // 1-4 units
          unit: ['cup', 'tablespoon', 'teaspoon', 'piece', 'gram'][Math.floor(Math.random() * 5)]
        };
      });
      
      // Insert recipe ingredients
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredientsToInsert);
        
      if (ingredientsError) {
        console.error(`Error inserting ingredients for recipe ${recipe.name}:`, ingredientsError);
      } else {
        console.log(`Added ${recipeIngredientsToInsert.length} ingredients to recipe ${recipe.name}`);
      }
    }
    
    return insertedRecipes;
  } catch (error) {
    console.error('Error in initializeRecipes:', error);
    return [];
  }
};

// For client-side usage, we need to provide mock recipes with ingredient availability
export const generateMockRecipes = () => {
  return [
    {
      id: '1',
      name: 'Vegetable Stir Fry',
      description: 'A quick and healthy veggie stir fry',
      preparationTime: '15 min',
      difficulty: 'Easy',
      category: 'Vegetarian',
      imageUrl: 'https://source.unsplash.com/random/300×300/?stirfry',
      missingCount: 2,
      ingredients: [
        { name: 'Broccoli', quantity: 2, unit: 'cups', available: true },
        { name: 'Bell Peppers', quantity: 1, unit: 'cup', available: true },
        { name: 'Carrots', quantity: 1, unit: 'cup', available: false },
        { name: 'Onions', quantity: 1, unit: 'medium', available: true },
        { name: 'Garlic', quantity: 3, unit: 'cloves', available: true },
        { name: 'Ginger', quantity: 1, unit: 'tablespoon', available: false },
        { name: 'Soy Sauce', quantity: 2, unit: 'tablespoons', available: true }
      ]
    },
    {
      id: '2',
      name: 'Classic Chicken Soup',
      description: 'Comforting homemade chicken soup',
      preparationTime: '45 min',
      difficulty: 'Medium',
      category: 'Soups',
      imageUrl: 'https://source.unsplash.com/random/300×300/?chickensoup',
      missingCount: 1,
      ingredients: [
        { name: 'Chicken Breast', quantity: 2, unit: 'pieces', available: true },
        { name: 'Carrots', quantity: 2, unit: 'medium', available: false },
        { name: 'Celery', quantity: 3, unit: 'stalks', available: true },
        { name: 'Onions', quantity: 1, unit: 'large', available: true },
        { name: 'Garlic', quantity: 2, unit: 'cloves', available: true }
      ]
    },
    {
      id: '3',
      name: 'Greek Salad',
      description: 'Traditional Greek salad with feta and olives',
      preparationTime: '10 min',
      difficulty: 'Easy',
      category: 'Salads',
      imageUrl: 'https://source.unsplash.com/random/300×300/?greeksalad',
      missingCount: 0,
      ingredients: [
        { name: 'Tomatoes', quantity: 3, unit: 'medium', available: true },
        { name: 'Cucumber', quantity: 1, unit: 'large', available: true },
        { name: 'Feta Cheese', quantity: 1, unit: 'cup', available: true },
        { name: 'Olives', quantity: 1/2, unit: 'cup', available: true },
        { name: 'Olive Oil', quantity: 2, unit: 'tablespoons', available: true }
      ]
    },
    {
      id: '4',
      name: 'Pasta Carbonara',
      description: 'Creamy Italian pasta with bacon',
      preparationTime: '25 min',
      difficulty: 'Medium',
      category: 'Pasta',
      imageUrl: 'https://source.unsplash.com/random/300×300/?carbonara',
      missingCount: 3,
      ingredients: [
        { name: 'Spaghetti', quantity: 250, unit: 'grams', available: true },
        { name: 'Bacon', quantity: 150, unit: 'grams', available: false },
        { name: 'Eggs', quantity: 3, unit: 'large', available: true },
        { name: 'Parmesan', quantity: 1/2, unit: 'cup', available: false },
        { name: 'Black Pepper', quantity: 1, unit: 'teaspoon', available: true },
        { name: 'Garlic', quantity: 2, unit: 'cloves', available: false }
      ]
    }
  ];
};

export const updateRecipeAvailability = async (recipes, userId) => {
  if (!userId) return recipes;
  
  try {
    // Fetch user's ingredients
    const { data: userIngredients, error } = await supabase
      .from('ingredients')
      .select('name')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user ingredients:', error);
      return recipes;
    }
    
    // Create a set of ingredient names the user has
    const availableIngredients = new Set(userIngredients.map(ing => ing.name.toLowerCase()));
    
    // Update recipe ingredient availability and missing count
    return recipes.map(recipe => {
      let missingCount = 0;
      const updatedIngredients = recipe.ingredients.map(ingredient => {
        const isAvailable = availableIngredients.has(ingredient.name.toLowerCase());
        if (!isAvailable) missingCount++;
        return { ...ingredient, available: isAvailable };
      });
      
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

export const findProductsForIngredients = async (ingredientNames) => {
  try {
    const productMatches = {};
    
    // For each ingredient name, find matching products
    for (const name of ingredientNames) {
      // Search for products with similar names
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
        .ilike('name', `%${name}%`)
        .limit(5);
        
      if (error) {
        console.error(`Error finding products for ingredient ${name}:`, error);
        productMatches[name] = [];
        continue;
      }
      
      productMatches[name] = products || [];
    }
    
    return productMatches;
  } catch (error) {
    console.error('Error finding products for ingredients:', error);
    return {};
  }
};
