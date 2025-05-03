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
