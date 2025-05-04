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
  try {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};

// Fetch user's stores from Supabase
export const fetchUserStores = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
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
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch all products (for product catalog)
export const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Add a product
export const addProduct = async (
  name: string,
  description: string,
  price: number,
  category: string,
  userId: string,
  imageUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        description, 
        price, 
        category, 
        user_id: userId,
        image_url: imageUrl 
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (
  id: string,
  updates: {
    name?: string,
    description?: string,
    price?: number,
    category?: string,
    image_url?: string
  }
) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
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
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
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
    
    if (orderError) throw orderError;
    
    const orderId = orderData[0].id;
    
    // 2. Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);
    
    if (cartError) throw cartError;
    
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
    
    if (orderItemsError) throw orderItemsError;
    
    // 4. Clear the cart
    await clearCart(userId);
    
    // 5. Create a notification for the order
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
