
import React from 'react';
import { ProductCard, Product } from '@/components/ProductComponents';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onOpenAddDialog: () => void;
  onUpdate: () => void;
  isUserLoggedIn: boolean;
  userId?: string;
  showStoreFilter?: boolean;
  selectedStore?: string;
  onStoreSelect?: (storeId: string) => void;
  stores?: any[];
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  loading, 
  onOpenAddDialog, 
  onUpdate,
  isUserLoggedIn,
  userId,
  showStoreFilter = false,
  selectedStore = 'all-stores',
  onStoreSelect,
  stores = []
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No products found</p>
        {isUserLoggedIn && (
          <Button 
            onClick={onOpenAddDialog}
            variant="outline"
            className="mt-4"
          >
            Add Your First Product
          </Button>
        )}
      </div>
    );
  }
  
  // Group products by store for better organization
  const productsByStore: Record<string, Product[]> = {};
  const storeNames: Record<string, string> = {};
  
  products.forEach(product => {
    const storeId = product.store_id || 'unknown';
    if (!productsByStore[storeId]) {
      productsByStore[storeId] = [];
    }
    productsByStore[storeId].push(product);
    
    if (product.store?.name) {
      storeNames[storeId] = product.store.name;
    }
  });

  return (
    <div>
      {showStoreFilter && stores.length > 0 && onStoreSelect && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Filter by Store:</h3>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedStore === 'all-stores' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onStoreSelect('all-stores')}
            >
              All Stores
            </Badge>
            
            {stores.map(store => (
              <Badge 
                key={store.id}
                variant={selectedStore === store.id ? "default" : "outline"}
                className="cursor-pointer flex items-center gap-1"
                onClick={() => onStoreSelect(store.id)}
              >
                <Store className="h-3 w-3" />
                {store.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {selectedStore !== 'all-stores' ? (
        // Show products for selected store
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
              onUpdate={onUpdate}
              isOwner={userId === product.user_id}
            />
          ))}
        </div>
      ) : (
        // Group products by store
        Object.entries(productsByStore).map(([storeId, storeProducts]) => (
          <div key={storeId} className="mb-10">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Store className="h-5 w-5 mr-2" />
              {storeNames[storeId] || 'Unknown Store'}
              <Badge className="ml-2">{storeProducts.length} products</Badge>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {storeProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onUpdate={onUpdate}
                  isOwner={userId === product.user_id}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductList;
