
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchStores } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';
import { generateMockProducts, generateMockStores } from '@/utils/seedData';
import { Product } from '@/components/ProductComponents';

interface Store {
  id: string;
  name: string;
  address: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all-categories');
  const [selectedStore, setSelectedStore] = useState<string>('all-stores');

  // Make sure mock data exists
  useEffect(() => {
    const ensureMockData = async () => {
      try {
        console.log("Ensuring mock data exists on Products Page...");
        await generateMockStores(null);
        await generateMockProducts(null);
        console.log("Mock data check completed");
      } catch (error) {
        console.error("Error ensuring mock data:", error);
      }
    };
    
    ensureMockData();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log('Fetching products...');
      
      // Fetch all products without filtering by user_id
      let { data: productData, error } = await supabase
        .from('products')
        .select(`
          *,
          store:store_id (
            id,
            name,
            address
          )
        `);
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched:', productData?.length || 0);
      
      if (!productData || productData.length === 0) {
        console.log('No products found, generating mock data...');
        await generateMockStores(null);
        await generateMockProducts(null);
        
        // Try fetching again
        const { data: refreshedProducts, error: refreshError } = await supabase
          .from('products')
          .select(`
            *,
            store:store_id (
              id,
              name,
              address
            )
          `);
          
        if (refreshError) {
          console.error('Error fetching products after generation:', refreshError);
          throw refreshError;
        }
        
        productData = refreshedProducts || [];
        console.log('Products after generation:', productData.length);
      }
      
      // Fetch store data for products
      const storeList = await fetchStores();
      setStores(storeList);
      console.log('Stores fetched:', storeList?.length || 0);

      // Enhance products with store information when available
      const productsWithStoreInfo = productData.map(product => {
        // Make sure each product has the store_id property, even if it's null
        const enhancedProduct: Product = {
          ...product,
          store_id: product.store_id || null
        };
        
        if (enhancedProduct.store_id) {
          const store = storeList.find(s => s.id === enhancedProduct.store_id);
          return {
            ...enhancedProduct,
            store: store ? { id: store.id, name: store.name, address: store.address } : undefined
          };
        }
        return enhancedProduct;
      });
      
      console.log('Enhanced products:', productsWithStoreInfo.length);
      setProducts(productsWithStoreInfo);
      
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
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
    loadProducts
  };
};
