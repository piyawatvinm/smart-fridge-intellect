
import React from 'react';
import { ProductCard, Product } from '@/components/ProductComponents';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingCart } from 'lucide-react';

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
  highlightIngredients?: string[];
  showAddAllToCart?: boolean;
  onAddAllToCart?: () => void;
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
  stores = [],
  highlightIngredients = [],
  showAddAllToCart = false,
  onAddAllToCart
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

  // Check if any products match the highlighted ingredients
  const hasHighlightedIngredients = highlightIngredients.length > 0 && products.some(product => 
    highlightIngredients.some(ingredient => 
      product.name.toLowerCase().includes(ingredient.toLowerCase())
    )
  );

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

      {showAddAllToCart && hasHighlightedIngredients && onAddAllToCart && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-blue-700">
              <span className="font-medium">Recipe ingredients found!</span> Add all needed ingredients to your cart at once.
            </p>
            <Button 
              onClick={onAddAllToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add All to Cart
            </Button>
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
              highlighted={highlightIngredients.some(ing => 
                product.name.toLowerCase().includes(ing.toLowerCase())
              )}
            />
          ))}
        </div>
      ) : (
        // Group products by store
        Object.entries(productsByStore).map(([storeId, storeProducts]) => {
          // Check if this store has any highlighted ingredients
          const hasHighlighted = highlightIngredients.length > 0 && 
            storeProducts.some(product => 
              highlightIngredients.some(ing => 
                product.name.toLowerCase().includes(ing.toLowerCase())
              )
            );

          return (
            <div key={storeId} className={`mb-10 ${hasHighlighted ? 'p-4 bg-blue-50 border border-blue-200 rounded-lg' : ''}`}>
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Store className="h-5 w-5 mr-2" />
                {storeNames[storeId] || 'Unknown Store'}
                <Badge className="ml-2">{storeProducts.length} products</Badge>
                {hasHighlighted && (
                  <Badge className="ml-2 bg-blue-600">Contains Recipe Ingredients</Badge>
                )}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {storeProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onUpdate={onUpdate}
                    isOwner={userId === product.user_id}
                    highlighted={highlightIngredients.some(ing => 
                      product.name.toLowerCase().includes(ing.toLowerCase())
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProductList;
