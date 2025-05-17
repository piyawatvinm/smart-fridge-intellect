
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchStores } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';
import { Product } from '@/components/ProductComponents';
import { ingredientVariations } from '@/types/receipt';

interface Store {
  id: string;
  name: string;
  address: string;
  logo_url?: string;
  location?: string;
}

// Reverse lookup map to quickly find base ingredients
const buildReverseLookup = () => {
  const reverseLookup: Record<string, string> = {};
  Object.entries(ingredientVariations).forEach(([baseIngredient, variations]) => {
    reverseLookup[baseIngredient.toLowerCase()] = baseIngredient;
    variations.forEach(variation => {
      reverseLookup[variation.toLowerCase()] = baseIngredient;
    });
  });
  return reverseLookup;
};

const reverseLookup = buildReverseLookup();

// Function to normalize ingredient name for consistent matching
const normalizeIngredientName = (name: string): string => {
  const lowercaseName = name.toLowerCase().trim();
  
  // Direct match with a base ingredient
  if (reverseLookup[lowercaseName]) {
    return reverseLookup[lowercaseName];
  }
  
  // Check if this is a variation of a base ingredient
  for (const [base, variations] of Object.entries(ingredientVariations)) {
    if (lowercaseName === base) return base;
    
    // Check for exact match with variations
    if (variations.some(v => lowercaseName === v.toLowerCase())) {
      return base;
    }
    
    // Check if the ingredient name contains the base
    if (lowercaseName.includes(base)) {
      return base;
    }
    
    // Check if any variation is contained in the ingredient name
    if (variations.some(v => lowercaseName.includes(v.toLowerCase()))) {
      return base;
    }
  }
  
  // If no match is found, return the original name
  return lowercaseName;
};

// Calculate word similarity score between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  
  let matchCount = 0;
  for (const word of set1) {
    for (const otherWord of set2) {
      // Check if words are identical or one contains the other
      if (word === otherWord || (word.length > 3 && otherWord.includes(word)) || (otherWord.length > 3 && word.includes(otherWord))) {
        matchCount++;
        break;
      }
    }
  }
  
  // Return a similarity score based on word matches relative to total unique words
  const totalUniqueWords = new Set([...set1, ...set2]).size;
  return totalUniqueWords > 0 ? matchCount / totalUniqueWords : 0;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all-categories');
  const [selectedStore, setSelectedStore] = useState<string>('all-stores');
  const [productsByIngredient, setProductsByIngredient] = useState<Record<string, Product[]>>({});
  const [matchedIngredients, setMatchedIngredients] = useState<string[]>([]);
  const [unmatchedIngredients, setUnmatchedIngredients] = useState<string[]>([]);

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
  
  // Improved product matching for ingredients with detailed logs
  const getProductsForIngredients = async (ingredientNames: string[]) => {
    setLoading(true);
    try {
      console.log('Finding products for ingredients:', ingredientNames);
      
      // Load all products first if not already loaded
      if (products.length === 0) {
        await loadProducts();
      }
      
      // Create a map to store products by ingredient name and track matched/unmatched
      const productMap: Record<string, Product[]> = {};
      const matched: string[] = [];
      const unmatched: string[] = [];
      
      // For each ingredient, find matching products with improved matching algorithm
      for (const ingredientName of ingredientNames) {
        // Skip empty ingredient names
        if (!ingredientName.trim()) continue;
        
        // Normalize ingredient name for better matching
        const normalizedName = normalizeIngredientName(ingredientName.toLowerCase().trim());
        console.log(`Normalized "${ingredientName}" to "${normalizedName}"`);
        
        // Check for known variations first
        const baseIngredient = normalizedName;
        const possibleVariations = [
          ingredientName.toLowerCase(),
          normalizedName,
          ...(ingredientVariations[normalizedName] || []).map(v => v.toLowerCase())
        ];
        
        console.log(`Looking for matches with variations:`, possibleVariations);
        
        // Find products that match any of the possible variations
        const matchingProducts = products.filter(product => {
          const productName = product.name.toLowerCase();
          
          // Check for exact matches first
          for (const variation of possibleVariations) {
            if (productName === variation || variation === productName) {
              console.log(`Exact match: "${product.name}" matches "${variation}"`);
              return true;
            }
          }
          
          // Check if product name contains any variation
          for (const variation of possibleVariations) {
            if (productName.includes(variation) || variation.includes(productName)) {
              console.log(`Substring match: "${product.name}" contains or is contained in "${variation}"`);
              return true;
            }
          }
          
          // Word-by-word matching with similarity score
          const similarityScore = Math.max(
            ...possibleVariations.map(variation => calculateSimilarity(variation, productName))
          );
          
          if (similarityScore >= 0.5) { // 50% or more word similarity
            console.log(`Word similarity match: "${product.name}" has ${similarityScore.toFixed(2)} similarity with "${ingredientName}"`);
            return true;
          }
          
          return false;
        }).map(product => ({
          ...product,
          matchingIngredient: ingredientName // Store which ingredient this product matches
        }));
        
        console.log(`Found ${matchingProducts.length} matches for ${ingredientName}`);
        
        // Store in the map
        productMap[ingredientName] = matchingProducts;
        
        // If matches found, add to matched list, otherwise to unmatched
        if (matchingProducts.length > 0) {
          matched.push(ingredientName);
        } else {
          // Try database query as fallback
          console.log(`No matches found locally for ${ingredientName}, trying database query`);
          
          // Create search terms based on the ingredient name and variations
          const searchTerms = [
            ...ingredientName.split(' ').filter(term => term.length > 2),
            ...possibleVariations.flatMap(v => v.split(' ')).filter(term => term.length > 2)
          ].map(term => `%${term.toLowerCase()}%`);
              
          if (searchTerms.length > 0) {
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
              
            if (!error && data && data.length > 0) {
              console.log(`Database query found ${data.length} matches for ${ingredientName}`);
              
              // Add the matching ingredient information
              const dbMatchingProducts = data.map(product => ({
                ...product,
                store_id: product.store_id || null,
                matchingIngredient: ingredientName
              }));
                
              // Store in the map
              productMap[ingredientName] = dbMatchingProducts;
              matched.push(ingredientName);
            } else {
              console.log('Database query returned no results or error:', error);
              unmatched.push(ingredientName);
            }
          } else {
            unmatched.push(ingredientName);
          }
        }
      }
      
      // Log summary of matches
      console.log('Product matches summary:', Object.entries(productMap).map(([ing, prods]) => 
        `${ing}: ${prods.length} products`).join(', '));
      console.log('Matched ingredients:', matched);
      console.log('Unmatched ingredients:', unmatched);
      
      // Update state
      setProductsByIngredient(productMap);
      setMatchedIngredients(matched);
      setUnmatchedIngredients(unmatched);
      
      return productMap;
    } catch (error) {
      console.error('Error loading products for ingredients:', error);
      toast.error('Failed to load matching products');
      return {};
    } finally {
      setLoading(false);
    }
  };
  
  // Count available products for recipe ingredients
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
    return matchedIngredients;
  };
  
  // Get ingredients without product matches
  const getUnmatchedIngredientNames = (): string[] => {
    return unmatchedIngredients;
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
    getMatchedIngredientNames,
    getUnmatchedIngredientNames,
    matchedIngredients,
    unmatchedIngredients
  };
};
