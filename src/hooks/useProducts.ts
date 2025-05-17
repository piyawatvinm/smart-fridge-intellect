
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
      
      // For each ingredient, find matching products with improved matching algorithm
      for (const ingredientName of ingredientNames) {
        // Normalize ingredient name for better matching
        const normalizedName = ingredientName.toLowerCase().trim();
        
        // Match products using more flexible criteria
        const matchingProducts = products.filter(product => {
          const productName = product.name.toLowerCase();
          
          // Direct match (product name contains ingredient name or vice versa)
          if (productName.includes(normalizedName) || normalizedName.includes(productName)) {
            return true;
          }
          
          // Word-by-word matching (any word in ingredient name matches any word in product name)
          const ingredientWords = normalizedName.split(/\s+/).filter(word => word.length > 2);
          const productWords = productName.split(/\s+/);
          
          return ingredientWords.some(ingWord => 
            productWords.some(prodWord => 
              prodWord.includes(ingWord) || ingWord.includes(prodWord)
            )
          );
        });
        
        // Store in the map
        productMap[ingredientName] = matchingProducts;
        
        // If no matches found with the improved algorithm, try a database query with ILIKE
        if (matchingProducts.length === 0) {
          // Create search terms based on the ingredient name
          const searchTerms = ingredientName
            .split(' ')
            .filter(term => term.length > 2) // Only terms with length > 2
            .map(term => `%${term.toLowerCase()}%`);
            
          if (searchTerms.length > 0) {
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
              // Enhance products with store information
              const dbMatchingProducts = data.map(product => ({
                ...product,
                store_id: product.store_id || null
              }));
              
              // Store in the map
              productMap[ingredientName] = dbMatchingProducts;
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
