
import { supabase } from "@/integrations/supabase/client";

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
    
    // Sample ingredients to add
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
        name: 'Chicken Breast',
        quantity: 2,
        unit: 'lb',
        category: 'Meat',
        expiry_date: getDateOffset(3), // 3 days from now
        user_id: userId
      },
      {
        name: 'Broccoli',
        quantity: 1,
        unit: 'bunch',
        category: 'Vegetables',
        expiry_date: getDateOffset(5), // 5 days from now
        user_id: userId
      },
      {
        name: 'Cheddar Cheese',
        quantity: 8,
        unit: 'oz',
        category: 'Dairy',
        expiry_date: getDateOffset(14), // 14 days from now
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

// Generate mock store data
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
    
    // Sample stores to add
    const stores = [
      {
        name: 'Fresh Market',
        address: '123 Main St',
        user_id: userId
      },
      {
        name: 'Organic Foods',
        address: '456 Green Ave',
        user_id: userId
      },
      {
        name: 'Budget Grocery',
        address: '789 Value Rd',
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
      
      // Use the new stores
      const storeMap: Record<string, string> = {};
      newStores.forEach(store => {
        storeMap[store.name] = store.id;
      });
      
      // Sample products to add with store associations
      const products = [
        {
          name: 'Eggs (Dozen)',
          description: 'Farm fresh eggs',
          price: 3.99,
          category: 'Dairy',
          image_url: 'https://via.placeholder.com/300?text=Eggs',
          user_id: userId,
          store_id: storeMap['Fresh Market']
        },
        {
          name: 'Organic Chicken Breast',
          description: 'Hormone-free chicken breast',
          price: 8.99,
          category: 'Meat',
          image_url: 'https://via.placeholder.com/300?text=Chicken+Breast',
          user_id: userId,
          store_id: storeMap['Organic Foods']
        },
        {
          name: 'Fresh Broccoli',
          description: 'Locally grown broccoli',
          price: 2.49,
          category: 'Vegetables',
          image_url: 'https://via.placeholder.com/300?text=Broccoli',
          user_id: userId,
          store_id: storeMap['Fresh Market']
        },
        {
          name: 'Cheddar Cheese',
          description: 'Sharp cheddar cheese',
          price: 4.99,
          category: 'Dairy',
          image_url: 'https://via.placeholder.com/300?text=Cheddar+Cheese',
          user_id: userId,
          store_id: storeMap['Budget Grocery']
        },
        {
          name: 'Olive Oil',
          description: 'Extra virgin olive oil',
          price: 7.99,
          category: 'Oils',
          image_url: 'https://via.placeholder.com/300?text=Olive+Oil',
          user_id: userId,
          store_id: storeMap['Organic Foods']
        },
        {
          name: 'Whole Wheat Bread',
          description: 'Freshly baked bread',
          price: 3.49,
          category: 'Bakery',
          image_url: 'https://via.placeholder.com/300?text=Bread',
          user_id: userId,
          store_id: storeMap['Fresh Market']
        },
        {
          name: 'Ground Beef',
          description: 'Lean ground beef',
          price: 6.99,
          category: 'Meat',
          image_url: 'https://via.placeholder.com/300?text=Ground+Beef',
          user_id: userId,
          store_id: storeMap['Budget Grocery']
        },
        {
          name: 'Spinach',
          description: 'Fresh baby spinach',
          price: 3.29,
          category: 'Vegetables',
          image_url: 'https://via.placeholder.com/300?text=Spinach',
          user_id: userId,
          store_id: storeMap['Organic Foods']
        }
      ];
      
      // Insert products
      const { error } = await supabase
        .from('products')
        .insert(products);
        
      if (error) {
        console.error('Error generating mock products:', error);
      } else {
        console.log('Mock products generated successfully');
      }
    }
  } catch (error) {
    console.error('Error in generateMockProducts:', error);
  }
};

// Helper function to get a date offset from today
function getDateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
