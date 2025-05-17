import { supabase } from "@/integrations/supabase/client";

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

// Fetch user's ingredients from Supabase
export const fetchUserIngredients = async (userId: string) => {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching ingredients:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch user's stores from Supabase
export const fetchUserStores = async (userId: string) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
  
  return data || [];
};

// Add a new store
export const addNewStore = async (
  name: string, 
  address: string, 
  userId: string
) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .insert([{ name, address, user_id: userId }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding store:', error);
    throw error;
  }
};

// Get unique ingredient categories
export const fetchUniqueCategories = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('category')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Extract unique categories
    const categories = [...new Set(
      data
        .filter(item => item.category) // Filter out null categories
        .map(item => item.category)
    )];
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Create a new shopping list
export const createShoppingList = async (name: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert([{ name, user_id: userId }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }
};

// Fetch user's shopping lists
export const fetchUserShoppingLists = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return [];
  }
};

// Add item to shopping list
export const addShoppingListItem = async (
  shoppingListId: string, 
  name: string, 
  quantity: number, 
  unit: string, 
  storeId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert([{ 
        shopping_list_id: shoppingListId, 
        name, 
        quantity, 
        unit,
        store_id: storeId 
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding shopping list item:', error);
    throw error;
  }
};

// Update shopping list item's store
export const updateShoppingListItemStore = async (
  itemId: string,
  storeId: string | null
) => {
  try {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .update({ store_id: storeId })
      .eq('id', itemId)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating shopping list item store:', error);
    throw error;
  }
};

// Mark shopping list item as purchased/unpurchased
export const toggleShoppingListItemPurchased = async (
  itemId: string,
  purchased: boolean
) => {
  try {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .update({ purchased })
      .eq('id', itemId)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating shopping list item purchased status:', error);
    throw error;
  }
};

// Fetch shopping list items
export const fetchShoppingListItems = async (shoppingListId: string) => {
  try {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select('*, stores(*)')
      .eq('shopping_list_id', shoppingListId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching shopping list items:', error);
    return [];
  }
};

// PRODUCT & CART FUNCTIONS

// Fetch products for a user
export const fetchUserProducts = async (userId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch all products (for product catalog)
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch product details with store information
export const fetchProductDetails = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      store:store_id (
        id,
        name,
        address
      )
    `)
    .eq('id', productId)
    .single();
  
  if (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
  
  return data;
};

// Create or update a product
export const addProduct = async (
  name: string, 
  description: string | null | undefined, 
  price: number, 
  category: string | null | undefined, 
  userId: string,
  imageUrl: string | null | undefined,
  storeId: string | null | undefined
) => {
  const { data, error } = await supabase
    .from('products')
    .insert([
      { 
        name, 
        description, 
        price, 
        category, 
        user_id: userId,
        image_url: imageUrl,
        store_id: storeId
      }
    ])
    .select();
  
  if (error) {
    console.error('Error adding product:', error);
    throw error;
  }
  
  return data?.[0];
};

// Update a product
export const updateProduct = async (
  productId: string, 
  updates: { 
    name?: string; 
    description?: string | null; 
    price?: number; 
    category?: string | null;
    image_url?: string | null;
    store_id?: string | null;
  }
) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select();
  
  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }
  
  return data?.[0];
};

// Delete a product
export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// CART FUNCTIONS

// Fetch cart items for a user
export const fetchCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products:product_id (
        id,
        name,
        description,
        price,
        image_url,
        category,
        store_id,
        store:store_id (
          id,
          name,
          address
        )
      )
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
  
  return data || [];
};

// Add item to cart
export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  try {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();
    
    if (existingItem) {
      // Update quantity if item exists
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select();
      
      if (error) throw error;
      return data[0];
    } else {
      // Add new item if it doesn't exist
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: userId, product_id: productId, quantity }])
        .select();
      
      if (error) throw error;
      return data[0];
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId: string) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Clear cart
export const clearCart = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// ORDER FUNCTIONS

// Create an order from cart items
export const createOrder = async (userId: string, totalAmount: number) => {
  try {
    // Start a transaction using multiple operations
    // 1. Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: userId, total_amount: totalAmount }])
      .select();
    
    if (orderError) throw new Error(orderError.message);
    
    const orderId = orderData[0].id;
    
    // 2. Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);
    
    if (cartError) throw new Error(cartError.message);
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // 3. Create order items from cart items
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price
    }));
    
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (orderItemsError) throw new Error(orderItemsError.message);
    
    // 4. Add items to the ingredients table
    for (const item of cartItems) {
      // Check if the ingredient already exists
      const { data: existingIngredient } = await supabase
        .from('ingredients')
        .select('*')
        .eq('user_id', userId)
        .eq('name', item.products.name)
        .single();
      
      if (existingIngredient) {
        // Update quantity if ingredient exists
        await supabase
          .from('ingredients')
          .update({
            quantity: existingIngredient.quantity + item.quantity
          })
          .eq('id', existingIngredient.id);
      } else {
        // Add new ingredient
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // Default expiry 30 days from now
        
        await supabase
          .from('ingredients')
          .insert([{
            user_id: userId,
            name: item.products.name,
            quantity: item.quantity,
            unit: 'unit', // Default unit
            category: item.products.category || getCategoryForItem(item.products.name),
            expiry_date: expiryDate.toISOString()
          }]);
      }
    }
    
    // 5. Clear the cart
    await clearCart(userId);
    
    // 6. Create a notification for the order
    await createNotification(
      userId,
      'Order Placed',
      `Your order #${orderId.substring(0, 8)} has been placed successfully.`,
      'order',
      orderId
    );
    
    return { orderId, orderItems };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Fetch orders for a user
export const fetchOrders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// Fetch order details including items
export const fetchOrderDetails = async (orderId: string) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) throw orderError;
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;
    
    return {
      ...order,
      items: orderItems || []
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// NOTIFICATION FUNCTIONS

// Fetch notifications for a user
export const fetchNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Create a notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  relatedType?: string,
  relatedId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ 
        user_id: userId, 
        title, 
        message, 
        related_type: relatedType, 
        related_id: relatedId 
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get notification count
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting notifications:', error);
    return 0;
  }
};

// Fetch stores
export const fetchStores = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
  
  return data || [];
};

// Add ingredients from cart items to ingredients table and clear cart
export const addIngredientsFromCart = async (userId: string) => {
  try {
    // First get the cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id (*)
      `)
      .eq('user_id', userId);
    
    if (cartError) {
      console.error('Error fetching cart items:', cartError);
      throw cartError;
    }
    
    if (!cartItems || cartItems.length === 0) {
      return null;
    }
    
    // For each cart item, check if ingredient already exists and update or add
    for (const item of cartItems) {
      const product = item.products;
      
      if (!product) {
        console.error('Product not found for cart item:', item);
        continue;
      }
      
      // Check if the ingredient already exists with the same product_id
      const { data: existingIngredient } = await supabase
        .from('ingredients')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .maybeSingle();
      
      // Set expiry date to 7-14 days in the future depending on product category
      const daysToAdd = getCategoryShelfLife(product.category || getCategoryForItem(product.name));
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);
      
      if (existingIngredient) {
        // Update quantity if ingredient exists
        await supabase
          .from('ingredients')
          .update({
            quantity: existingIngredient.quantity + item.quantity,
            expiry_date: expiryDate.toISOString().split('T')[0]
          })
          .eq('id', existingIngredient.id);
      } else {
        // Add new ingredient with product reference
        await supabase
          .from('ingredients')
          .insert([{
            user_id: userId,
            name: product.name,
            quantity: item.quantity,
            unit: product.unit || 'unit',
            category: product.category || getCategoryForItem(product.name),
            expiry_date: expiryDate.toISOString().split('T')[0],
            product_id: product.id
          }]);
      }
    }
    
    // Create an order
    const total_amount = cartItems.reduce((sum, item) => {
      const price = item.products?.price || 0;
      return sum + (price * (item.quantity || 0));
    }, 0);
    
    // Group cart items by store for creating separate orders
    const itemsByStore: Record<string, any[]> = {};
    cartItems.forEach(item => {
      const storeId = item.products?.store_id || 'unknown';
      if (!itemsByStore[storeId]) {
        itemsByStore[storeId] = [];
      }
      itemsByStore[storeId].push(item);
    });
    
    const orderIds: string[] = [];
    
    // Create an order for each store
    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      const storeTotal = storeItems.reduce((sum, item) => {
        const price = item.products?.price || 0;
        return sum + (price * (item.quantity || 0));
      }, 0);
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: userId,
            total_amount: storeTotal,
            status: 'completed',
            store_id: storeId !== 'unknown' ? storeId : null
          }
        ])
        .select();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        continue;
      }
      
      if (!order || order.length === 0) {
        console.error('No order returned after creation');
        continue;
      }
      
      orderIds.push(order[0].id);
      
      // Create order items
      const orderItems = storeItems.map(item => ({
        order_id: order[0].id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products?.price || 0
      }));
      
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (orderItemsError) {
        console.error('Error creating order items:', orderItemsError);
      }
    }
    
    // Clear the cart
    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (clearCartError) {
      console.error('Error clearing cart:', clearCartError);
      throw clearCartError;
    }
    
    // Create a notification for the order
    if (orderIds.length > 0) {
      await createNotification(
        userId,
        'Orders Completed',
        `Your orders have been processed and ${cartItems.length} items added to your ingredients.`,
        'order',
        orderIds[0] // Reference the first order
      );
    }
    
    return orderIds;
  } catch (error) {
    console.error('Error adding ingredients from cart:', error);
    throw error;
  }
};

// Get shelf life in days based on category
function getCategoryShelfLife(category: string): number {
  category = category.toLowerCase();
  
  // Return shelf life in days
  switch (category) {
    case 'meat':
    case 'seafood':
      return 3; // 3 days
    case 'dairy':
      return 7; // 7 days
    case 'fruits':
    case 'vegetables':
      return 10; // 10 days
    case 'bakery':
      return 5; // 5 days
    case 'frozen foods':
      return 30; // 30 days
    default:
      return 14; // 14 days default
  }
}

// RECIPE FUNCTIONS

// Fetch all recipes from the database
export const fetchRecipes = async () => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchRecipes:', error);
    return [];
  }
};

// Fetch recipe details including ingredients
export const fetchRecipeDetails = async (recipeId) => {
  try {
    // First fetch the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();
      
    if (recipeError) {
      console.error('Error fetching recipe details:', recipeError);
      throw recipeError;
    }
    
    // Then fetch the ingredients for this recipe
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        *,
        products:product_id (
          id,
          name,
          price,
          image_url,
          category,
          store_id,
          store:store_id (
            id,
            name,
            address
          )
        )
      `)
      .eq('recipe_id', recipeId);
    
    if (ingredientsError) {
      console.error('Error fetching recipe ingredients:', ingredientsError);
      throw ingredientsError;
    }
    
    return {
      ...recipe,
      ingredients: ingredients || []
    };
  } catch (error) {
    console.error('Error in fetchRecipeDetails:', error);
    throw error;
  }
};

// Check ingredient availability for recipes
export const checkIngredientsAvailability = async (userId, recipeIds) => {
  try {
    if (!userId) return {};
    
    // Fetch user's ingredients
    const { data: userIngredients } = await supabase
      .from('ingredients')
      .select('name, quantity, unit')
      .eq('user_id', userId);
      
    // Create a map of user ingredients for quick lookup
    const userIngredientsMap = new Map();
    (userIngredients || []).forEach(ing => {
      userIngredientsMap.set(ing.name.toLowerCase(), ing);
    });
    
    // Fetch recipe ingredients for all requested recipes
    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select('recipe_id, ingredient_name, quantity, unit')
      .in('recipe_id', recipeIds);
      
    // Group ingredients by recipe
    const availabilityByRecipe = {};
    
    (recipeIngredients || []).forEach(ingredient => {
      const recipeId = ingredient.recipe_id;
      
      if (!availabilityByRecipe[recipeId]) {
        availabilityByRecipe[recipeId] = {
          totalCount: 0,
          availableCount: 0,
          ingredients: []
        };
      }
      
      const isAvailable = userIngredientsMap.has(ingredient.ingredient_name.toLowerCase());
      
      availabilityByRecipe[recipeId].totalCount++;
      if (isAvailable) {
        availabilityByRecipe[recipeId].availableCount++;
      }
      
      availabilityByRecipe[recipeId].ingredients.push({
        name: ingredient.ingredient_name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        available: isAvailable
      });
    });
    
    return availabilityByRecipe;
  } catch (error) {
    console.error('Error checking ingredients availability:', error);
    return {};
  }
};

// Find products for missing ingredients to add to cart
export const findProductsForRecipeIngredients = async (recipeId) => {
  try {
    // Fetch the recipe ingredients
    const { data: recipeIngredients, error } = await supabase
      .from('recipe_ingredients')
      .select(`
        ingredient_name,
        product_id,
        products:product_id (*)
      `)
      .eq('recipe_id', recipeId);
      
    if (error) {
      console.error('Error fetching recipe ingredients:', error);
      throw error;
    }
    
    const productsByIngredient = {};
    
    // For ingredients with associated products, add them to the map
    for (const ingredient of (recipeIngredients || [])) {
      if (ingredient.product_id && ingredient.products) {
        const ingName = ingredient.ingredient_name;
        if (!productsByIngredient[ingName]) {
          productsByIngredient[ingName] = [];
        }
        productsByIngredient[ingName].push(ingredient.products);
      }
    }
    
    // For ingredients without direct product associations, find matching products
    for (const ingredient of (recipeIngredients || [])) {
      const ingName = ingredient.ingredient_name;
      
      if (!productsByIngredient[ingName] || productsByIngredient[ingName].length === 0) {
        // Search for similar products
        const { data: matchingProducts } = await supabase
          .from('products')
          .select(`
            *,
            store:store_id (
              id,
              name,
              address
            )
          `)
          .ilike('name', `%${ingName}%`)
          .limit(5);
          
        if (matchingProducts && matchingProducts.length > 0) {
          productsByIngredient[ingName] = matchingProducts;
        }
      }
    }
    
    return productsByIngredient;
  } catch (error) {
    console.error('Error finding products for recipe ingredients:', error);
    return {};
  }
};
