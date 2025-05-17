
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchStores } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';
import { Product } from '@/components/ProductComponents';

interface Store {
  id: string;
  name: string;
  address: string;
  logo_url?: string;
  location?: string;
}

// Common ingredient variations map
const ingredientVariations: Record<string, string[]> = {
  'flour': ['all-purpose flour', 'wheat flour', 'bread flour', 'plain flour'],
  'sugar': ['white sugar', 'granulated sugar', 'brown sugar', 'cane sugar'],
  'salt': ['sea salt', 'table salt', 'kosher salt', 'iodized salt'],
  'milk': ['whole milk', 'skim milk', '2% milk', 'almond milk'],
  'oil': ['olive oil', 'vegetable oil', 'canola oil', 'cooking oil'],
  'eggs': ['egg', 'large eggs', 'egg whites', 'free-range eggs'],
  'butter': ['unsalted butter', 'salted butter', 'margarine'],
  'cheese': ['cheddar cheese', 'mozzarella cheese', 'parmesan cheese'],
  'onion': ['yellow onion', 'white onion', 'red onion', 'green onion'],
  'garlic': ['garlic clove', 'minced garlic', 'garlic powder'],
  'pepper': ['black pepper', 'white pepper', 'bell pepper', 'chili pepper'],
  'tomato': ['cherry tomatoes', 'roma tomatoes', 'tomato paste', 'tomato sauce'],
  'potato': ['russet potato', 'sweet potato', 'yukon gold potato'],
  'rice': ['white rice', 'brown rice', 'basmati rice', 'jasmine rice'],
  'pasta': ['spaghetti', 'penne', 'macaroni', 'linguine', 'fettuccine'],
  'chicken': ['chicken breast', 'chicken thigh', 'chicken wings', 'rotisserie chicken'],
  'beef': ['ground beef', 'steak', 'beef chuck', 'sirloin'],
  'water': ['filtered water', 'tap water', 'spring water'],
};

// Reverse lookup map to quickly find base ingredients
const buildReverseLookup = () => {
  const reverseLookup: Record<string, string> = {};
  Object.entries(ingredientVariations).forEach(([baseIngredient, variations]) => {
    reverseLookup[baseIngredient] = baseIngredient;
    variations.forEach(variation => {
      reverseLookup[variation.toLowerCase()] = baseIngredient;
    });
  });
  return reverseLookup;
};

const reverseLookup = buildReverseLookup();

// Function to normalize ingredient name
const normalizeIngredientName = (name: string): string => {
  const lowercaseName = name.toLowerCase().trim();
  
  // Check if this is a variation of a base ingredient
  for (const [base, variations] of Object.entries(ingredientVariations)) {
    if (lowercaseName === base) return base;
    if (variations.some(v => lowercaseName === v)) return base;
    
    // Check if the ingredient name contains the base
    if (lowercaseName.includes(base)) return base;
    
    // Check if any variation is contained in the ingredient name
    if (variations.some(v => lowercaseName.includes(v))) return base;
  }
  
  // If no match is found, return the original name
  return lowercaseName;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all-categories');
  const [selectedStore, setSelectedStore] = useState<string>('all-stores');
  const [productsByIngredient, setProductsByIngredient] = useState<Record<string, Product[]>>({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log('Fetching products...');
      
      // Fetch all products with store information
      let { data: productData, error } = await supabase
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
        `);
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched:', productData?.length || 0);
      
      // Fetch store data for products
      const storeList = await fetchStores();
      setStores(storeList);
      console.log('Stores fetched:', storeList?.length || 0);

      // Enhance products with store information when available
      const productsWithStoreInfo = productData?.map(product => {
        // Make sure each product has the store_id property, even if it's null
        const enhancedProduct: Product = {
          ...product,
          store_id: product.store_id || null
        };
        
        if (enhancedProduct.store_id) {
          const store = storeList.find(s => s.id === enhancedProduct.store_id);
          return {
            ...enhancedProduct,
            store: store ? { 
              id: store.id, 
              name: store.name, 
              address: store.address,
              logo_url: store.logo_url,
              location: store.location
            } : undefined
          };
        }
        return enhancedProduct;
      }) || [];
      
      console.log('Enhanced products:', productsWithStoreInfo.length);
      setProducts(productsWithStoreInfo);
      
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  // Improved product matching for ingredients
  const getProductsForIngredients = async (ingredientNames: string[]) => {
    setLoading(true);
    try {
      // Create a map to store products by ingredient name
      const productMap: Record<string, Product[]> = {};
      
      // Load all products first if not already loaded
      if (products.length === 0) {
        await loadProducts();
      }
      
      console.log('Finding products for ingredients:', ingredientNames);
      
      // For each ingredient, find matching products with improved matching algorithm
      for (const ingredientName of ingredientNames) {
        // Normalize ingredient name for better matching
        const normalizedName = normalizeIngredientName(ingredientName.toLowerCase().trim());
        console.log(`Normalized "${ingredientName}" to "${normalizedName}"`);
        
        // Match products using more flexible criteria
        const matchingProducts = products.filter(product => {
          const productName = product.name.toLowerCase();
          const normalizedProductName = normalizeIngredientName(productName);
          
          // Check if the normalized names match
          if (normalizedProductName === normalizedName) {
            console.log(`Direct normalized match: ${product.name} matches ${ingredientName}`);
            return true;
          }
          
          // Check if product name contains ingredient name or vice versa
          if (productName.includes(normalizedName) || normalizedName.includes(productName)) {
            console.log(`Substring match: ${product.name} matches ${ingredientName}`);
            return true;
          }
          
          // Check if this is a known variation
          const baseIngredient = reverseLookup[productName];
          if (baseIngredient && baseIngredient === normalizedName) {
            console.log(`Variation match: ${product.name} is a variation of ${ingredientName}`);
            return true;
          }
          
          // Word-by-word matching (any word in ingredient name matches any word in product name)
          const ingredientWords = normalizedName.split(/\s+/).filter(word => word.length > 2);
          const productWords = productName.split(/\s+/);
          
          const wordMatch = ingredientWords.some(ingWord => 
            productWords.some(prodWord => 
              prodWord.includes(ingWord) || ingWord.includes(prodWord)
            )
          );
          
          if (wordMatch) {
            console.log(`Word match: ${product.name} matches ${ingredientName} by word comparison`);
            return true;
          }
          
          return false;
        });
        
        console.log(`Found ${matchingProducts.length} matches for ${ingredientName}`);
        
        // Store in the map
        productMap[ingredientName] = matchingProducts;
        
        // If no matches found with the improved algorithm, try a database query with ILIKE
        if (matchingProducts.length === 0) {
          console.log(`No matches found locally for ${ingredientName}, trying database query`);
          
          // First, try to match with variations if this is a base ingredient
          if (ingredientVariations[normalizedName]) {
            const variations = ingredientVariations[normalizedName];
            console.log(`Trying known variations for ${normalizedName}:`, variations);
            
            // For each variation, check if we have products that match
            for (const variation of variations) {
              const variationMatches = products.filter(product => 
                product.name.toLowerCase().includes(variation)
              );
              
              if (variationMatches.length > 0) {
                console.log(`Found ${variationMatches.length} matches using variation: ${variation}`);
                productMap[ingredientName] = variationMatches;
                break;
              }
            }
          }
          
          // If still no matches, try a database query
          if (productMap[ingredientName].length === 0) {
            // Create search terms based on the ingredient name
            const searchTerms = ingredientName
              .split(' ')
              .filter(term => term.length > 2) // Only terms with length > 2
              .map(term => `%${term.toLowerCase()}%`);
              
            if (searchTerms.length > 0) {
              // Also include variations in the search
              if (ingredientVariations[normalizedName]) {
                ingredientVariations[normalizedName].forEach(variation => {
                  searchTerms.push(`%${variation.toLowerCase()}%`);
                });
              }
              
              console.log(`Trying database query with terms:`, searchTerms);
              
              // Build query to find products that match the ingredient
              let query = supabase
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
                `);
                
              // Add search conditions
              query = searchTerms.reduce((q, term, index) => {
                return index === 0 
                  ? q.ilike('name', term)
                  : q.or(`name.ilike.${term}`);
              }, query);
              
              // Execute query and get results
              const { data, error } = await query;
              
              if (!error && data.length > 0) {
                console.log(`Database query found ${data.length} matches`);
                // Enhance products with store information
                const dbMatchingProducts = data.map(product => ({
                  ...product,
                  store_id: product.store_id || null
                }));
                
                // Store in the map
                productMap[ingredientName] = dbMatchingProducts;
              } else {
                console.log('Database query returned no results or error:', error);
              }
            }
          }
        }
      }
      
      console.log('Product matches found:', Object.entries(productMap).map(([ing, prods]) => 
        `${ing}: ${prods.length} products`).join(', '));
      
      setProductsByIngredient(productMap);
      return productMap;
    } catch (error) {
      console.error('Error loading products for ingredients:', error);
      toast.error('Failed to load matching products');
      return {};
    } finally {
      setLoading(false);
    }
  };
  
  // New function to count available products for recipe ingredients
  const countAvailableProductsForIngredients = (ingredientNames: string[]): number => {
    let count = 0;
    
    // Check which ingredients have matching products
    for (const ingredientName of ingredientNames) {
      if (productsByIngredient[ingredientName]?.length > 0) {
        count++;
      }
    }
    
    return count;
  };
  
  // Get ingredient names from products by ingredient map
  const getMatchedIngredientNames = (): string[] => {
    return Object.keys(productsByIngredient);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesCategory = selectedCategory === 'all-categories' || 
      product.category === selectedCategory;
    
    const matchesStore = selectedStore === 'all-stores' ||
      product.store_id === selectedStore;
    
    return matchesSearch && matchesCategory && matchesStore;
  });

  // Get unique categories from products
  const categories = Array.from(new Set([
    ...products.map(p => p.category).filter(Boolean) as string[]
  ])).sort();

  return {
    products: filteredProducts,
    loading,
    stores,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStore,
    setSelectedStore,
    loadProducts,
    getProductsForIngredients,
    productsByIngredient,
    countAvailableProductsForIngredients,
    getMatchedIngredientNames
  };
};
