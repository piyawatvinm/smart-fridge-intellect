
import React from 'react';
import { ProductCard, Product } from '@/components/ProductComponents';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onOpenAddDialog: () => void;
  onUpdate: () => void;
  isUserLoggedIn: boolean;
  userId?: string;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  loading, 
  onOpenAddDialog, 
  onUpdate,
  isUserLoggedIn,
  userId
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

  return (
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
  );
};

export default ProductList;
