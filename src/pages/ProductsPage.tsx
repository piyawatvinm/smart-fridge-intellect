
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard, ProductFormDialog } from '@/components/ProductComponents';
import { useAuth } from '@/components/AuthComponents';
import { fetchProducts, fetchUserProducts } from '@/lib/supabaseHelpers';
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  created_at?: string;
  user_id?: string;
}

const ProductsPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-products'>('all');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await fetchProducts();
      setProducts(allProducts);
      
      if (user) {
        const myProducts = await fetchUserProducts(user.id);
        setUserProducts(myProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const filteredProducts = (activeTab === 'all' ? products : userProducts).filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesCategory = selectedCategory === '' || 
      product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products
  const categories = Array.from(new Set([
    ...products.map(p => p.category).filter(Boolean) as string[]
  ])).sort();

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
        
        <div className="mb-6">
          <div className="flex mb-4 space-x-2 border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'all' 
                  ? 'border-b-2 border-fridge-blue text-fridge-blue' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Products
            </button>
            
            {user && (
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'my-products' 
                    ? 'border-b-2 border-fridge-blue text-fridge-blue' 
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('my-products')}
              >
                My Products
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            {activeTab === 'my-products' && (
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
        />
      )}
    </Layout>
  );
};

export default ProductsPage;
