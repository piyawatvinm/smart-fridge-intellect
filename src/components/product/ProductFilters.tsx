
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  categories: string[];
  stores: Store[];
}

interface Store {
  id: string;
  name: string;
  address: string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStore,
  setSelectedStore,
  categories,
  stores
}) => {
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleStoreChange = (value: string) => {
    setSelectedStore(value);
  };

  return (
    <div className="mb-6">
      <div className="flex mb-4 space-x-2 border-b">
        <button className="px-4 py-2 font-medium border-b-2 border-fridge-blue text-fridge-blue">
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
  );
};

export default ProductFilters;
