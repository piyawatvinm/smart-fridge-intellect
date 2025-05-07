
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard, ProductFormDialog, Product } from '@/components/ProductComponents';
import { useAuth } from '@/components/AuthComponents';
import { fetchProducts, fetchStores } from '@/lib/supabaseHelpers';
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Store } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Store {
  id: string;
  name: string;
  address: string;
}

const ProductsPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all-categories');
  const [selectedStore, setSelectedStore] = useState<string>('all-stores');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all'>('all');
  const [stores, setStores] = useState<Store[]>([]);

  // Check if coming from recommendations or another source
  useEffect(() => {
    const fromRecommendation = searchParams.get('from') === 'recommendation';
    // If user refreshes, we want to preserve the "from" parameter
    if (fromRecommendation) {
      document.title = 'Order Missing Ingredients - Smart Fridge';
    }
  }, [searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      console.log('Fetching products...');
      
      // Fetch all products without filtering by user_id
      const { data: allProducts, error } = await supabase
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
      
      console.log('Products fetched:', allProducts?.length || 0);
      
      // Fetch store data for products
      const storeList = await fetchStores();
      setStores(storeList);
      console.log('Stores fetched:', storeList?.length || 0);

      // Enhance products with store information when available
      const productsWithStoreInfo = allProducts?.map(product => {
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

  // Handle store filter change
  const handleStoreChange = (value: string) => {
    setSelectedStore(value);
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          
          {user && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-fridge-blue hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
        
        {searchParams.get('from') === 'recommendation' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-blue-800">
              Browse products to find the ingredients you need for your recipe.
              Add them to your cart and confirm your order.
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex mb-4 space-x-2 border-b">
            <button
              className="px-4 py-2 font-medium border-b-2 border-fridge-blue text-fridge-blue"
            >
              All Products
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedStore} onValueChange={handleStoreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-stores">All Stores</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64">
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onUpdate={loadProducts}
                isOwner={user?.id === product.user_id}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No products found</p>
            {user && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                Add Your First Product
              </Button>
            )}
          </div>
        )}
      </div>
      
      {isAddDialogOpen && (
        <ProductFormDialog
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={() => {
            setIsAddDialogOpen(false);
            loadProducts();
          }}
          stores={stores}
        />
      )}
    </Layout>
  );
};

export default ProductsPage;
