
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from '@/components/ProductComponents';
import { useAuth } from '@/components/AuthComponents';
import { PlusCircle, Store } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductFilters from '@/components/product/ProductFilters';
import ProductList from '@/components/product/ProductList';
import RecommendationNotice from '@/components/product/RecommendationNotice';
import { supabase } from '@/integrations/supabase/client';

const ProductsPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [searchParams] = useSearchParams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { 
    products, 
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
  } = useProducts();

  // No more automatic initialization of app data when the page loads
  // We removed the initializeAppData call that was here previously

  // Check if coming from recommendations or another source
  useEffect(() => {
    const fromRecommendation = searchParams.get('from') === 'recommendation';
    if (fromRecommendation) {
      document.title = 'Order Missing Ingredients - Smart Fridge';
    }
  }, [searchParams]);

  const isFromRecommendation = searchParams.get('from') === 'recommendation';

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
        
        <RecommendationNotice isVisible={isFromRecommendation} />
        
        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          categories={categories}
          stores={stores}
        />
        
        <ProductList
          products={products}
          loading={loading}
          onOpenAddDialog={() => setIsAddDialogOpen(true)}
          onUpdate={loadProducts}
          isUserLoggedIn={!!user}
          userId={user?.id}
          showStoreFilter={true}
          selectedStore={selectedStore}
          onStoreSelect={setSelectedStore}
          stores={stores}
        />
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
