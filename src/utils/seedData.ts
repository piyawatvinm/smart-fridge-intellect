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

// Update the findProductsForIngredients function to better match products with ingredients
export const findProductsForIngredients = async (ingredientNames: string[]) => {
  console.log('Finding products for ingredients:', ingredientNames);
  
  try {
    const productMatches = {};
    
    // For each ingredient, find matching products
    for (const name of ingredientNames) {
      // Query products that match the ingredient name
      const { data: nameMatchProducts, error } = await supabase
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
        console.error(`Error finding products for ${name}:`, error);
        throw error;
      }
      
      // Also query products by category
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
        .eq('category', name);
        
      if (categoryError) {
        console.error(`Error finding category products for ${name}:`, categoryError);
      }
      
      // Combine results and remove duplicates
      let allProducts = [...(nameMatchProducts || [])];
      
      if (categoryProducts) {
        const uniqueCategoryProducts = categoryProducts.filter(
          cp => !allProducts.some(p => p.id === cp.id)
        );
        allProducts = [...allProducts, ...uniqueCategoryProducts];
      }
      
      console.log(`Found ${allProducts.length} products matching ingredient "${name}"`);
      productMatches[name] = allProducts;
    }
    
    return productMatches;
  } catch (error) {
    console.error('Error in findProductsForIngredients:', error);
    return {};
  }
};

// Generate mock stores
export const generateMockStores = async (userId) => {
  try {
    // Check if any stores already exist
    const { data: existingStores } = await supabase
      .from('stores')
      .select('id')
      .limit(1);

    // If stores already exist, don't recreate them
    if (existingStores && existingStores.length > 0) {
      console.log('Mock stores already exist, skipping creation');
      return;
    }

    const stores = [
      {
        name: 'Fresh Market',
        address: '123 Main St',
        image_url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        description: 'Local grocery store with fresh produce',
      },
      {
        name: 'Super Foods',
        address: '456 Oak Ave',
        image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        description: 'Supermarket with wide variety of foods',
      },
      {
        name: 'Organic Choices',
        address: '789 Pine Blvd',
        image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        description: 'Specializing in organic and locally sourced foods',
      }
    ];

    // Insert mock stores without user_id to make them visible to all users
    const { error } = await supabase.from('stores').insert(
      stores.map(store => ({
        ...store,
        user_id: null // Make visible to all users
      }))
    );
    
    if (error) {
      console.error('Error creating mock stores:', error);
      return;
    }

    console.log('Mock stores created successfully');
  } catch (error) {
    console.error('Error in generateMockStores:', error);
  }
};

// Generate mock products with ALL ingredients from recipes
export const generateMockProducts = async (userId) => {
  try {
    // Check if any products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    // If products already exist, don't recreate them
    if (existingProducts && existingProducts.length > 0) {
      console.log('Mock products already exist, skipping creation');
      return;
    }

    // Get stores to associate products with
    const { data: stores } = await supabase
      .from('stores')
      .select('id');

    if (!stores || stores.length === 0) {
      console.error('No stores found to associate products with');
      return;
    }

    // Extract all unique ingredients from recipes
    const recipes = generateMockRecipes();
    const allIngredients = new Set();
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allIngredients.add(ingredient.name);
      });
    });

    // Create products for each ingredient plus additional common products
    const products = [
      // Basic products that were already defined
      {
        name: 'Organic Apples',
        description: 'Fresh organic apples, locally grown',
        price: 3.99,
        category: 'Fruits',
        image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Whole Milk',
        description: 'Fresh whole milk from local farms',
        price: 2.49,
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Organic Spinach',
        description: 'Fresh organic spinach',
        price: 2.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fe?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Whole Grain Bread',
        description: 'Freshly baked whole grain bread',
        price: 3.49,
        category: 'Bakery',
        image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Free-range Eggs',
        description: 'Dozen free-range eggs from local farms',
        price: 4.99,
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      },
      
      // Products for Spaghetti Bolognese
      {
        name: 'Ground Beef',
        description: 'Premium ground beef, perfect for pasta dishes',
        price: 5.99,
        category: 'Meat',
        image_url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Yellow Onions',
        description: 'Fresh yellow onions, perfect for cooking',
        price: 1.49,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Garlic',
        description: 'Fresh garlic bulbs',
        price: 0.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1615477550927-1cd5c024ebde?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Canned Tomatoes',
        description: 'Organic whole peeled tomatoes',
        price: 2.29,
        category: 'Canned Goods',
        image_url: 'https://images.unsplash.com/photo-1599983252945-c31c7b9a11b5?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Spaghetti',
        description: 'Premium Italian spaghetti pasta',
        price: 1.99,
        category: 'Pasta',
        image_url: 'https://images.unsplash.com/photo-1627634777217-c864268db30f?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      },
      {
        name: 'Tomato Paste',
        description: 'Concentrated tomato paste, perfect for sauces',
        price: 1.29,
        category: 'Canned Goods',
        image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      },
      
      // Products for Chicken Caesar Salad
      {
        name: 'Chicken Breast',
        description: 'Fresh boneless skinless chicken breast',
        price: 6.99,
        category: 'Meat',
        image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Romaine Lettuce',
        description: 'Fresh crisp romaine lettuce',
        price: 2.49,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Parmesan Cheese',
        description: 'Aged Italian Parmesan cheese',
        price: 4.99,
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1646847401730-0ae0bc773454?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      },
      {
        name: 'Croutons',
        description: 'Seasoned garlic and herb croutons',
        price: 1.99,
        category: 'Bakery',
        image_url: 'https://images.unsplash.com/photo-1596781914203-bf44c03ac3fc?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Caesar Dressing',
        description: 'Creamy Caesar salad dressing',
        price: 3.49,
        category: 'Condiments',
        image_url: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      
      // Products for Vegetarian Stir Fry
      {
        name: 'Tofu',
        description: 'Extra firm tofu',
        price: 2.99,
        category: 'Vegetarian',
        image_url: 'https://images.unsplash.com/photo-1546069901-5ec6a79120b0?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      },
      {
        name: 'Bell Peppers',
        description: 'Mixed red, yellow, and green bell peppers',
        price: 3.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1534240237849-c8873ebe6115?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Broccoli',
        description: 'Fresh broccoli crowns',
        price: 2.49,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Carrots',
        description: 'Organic fresh carrots',
        price: 1.49,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1598170845047-a69259b3aa10?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      },
      {
        name: 'Soy Sauce',
        description: 'Premium low-sodium soy sauce',
        price: 3.99,
        category: 'Condiments',
        image_url: 'https://images.unsplash.com/photo-1599940765561-21e7ea3bee83?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      
      // Products for Margherita Pizza
      {
        name: 'Pizza Dough',
        description: 'Ready to use pizza dough',
        price: 3.49,
        category: 'Bakery',
        image_url: 'https://images.unsplash.com/photo-1673272466110-9129ad5f8f26?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Fresh Mozzarella',
        description: 'Italian fresh mozzarella cheese',
        price: 4.99,
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      },
      {
        name: 'Fresh Tomatoes',
        description: 'Vine-ripened tomatoes',
        price: 2.99,
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[0].id
      },
      {
        name: 'Fresh Basil',
        description: 'Aromatic fresh basil leaves',
        price: 2.49,
        category: 'Herbs',
        image_url: 'https://images.unsplash.com/photo-1600331322856-dc0cb7f22edf?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[1].id
      },
      {
        name: 'Olive Oil',
        description: 'Extra virgin olive oil',
        price: 6.99,
        category: 'Oils',
        image_url: 'https://images.unsplash.com/photo-1531816856617-4a81085efc49?auto=format&fit=crop&q=80&w=2340&ixlib=rb-4.0.3',
        store_id: stores[2].id
      }
    ];

    // Insert mock products without user_id to make them visible to all users
    const { error } = await supabase.from('products').insert(
      products.map(product => ({
        ...product,
        user_id: null // Make visible to all users
      }))
    );
    
    if (error) {
      console.error('Error creating mock products:', error);
      return;
    }

    console.log('Mock products created successfully');
  } catch (error) {
    console.error('Error in generateMockProducts:', error);
  }
};

// Generate mock ingredients
export const generateMockIngredients = async (userId) => {
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
