
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/AuthComponents';
import { toast } from 'sonner';
import { addProduct, updateProduct } from '@/lib/supabaseHelpers';
import { Product } from './ProductComponents';

interface Store {
  id: string;
  name: string;
  address?: string;
}

interface ProductFormDialogProps {
  onClose: () => void;
  onSubmit: () => void;
  initialData?: Product;
  stores?: Store[];
}

const PRODUCT_UNITS = [
  'unit', 'kg', 'g', 'liter', 'ml', 'pack', 'box', 'bottle', 
  'can', 'bunch', 'piece', 'slice', 'cup', 'bag', 'loaf', 'dozen'
];

const PRODUCT_CATEGORIES = [
  'Dairy', 'Meat', 'Seafood', 'Vegetables', 'Fruits', 'Bakery', 
  'Condiments', 'Beverages', 'Snacks', 'Frozen Foods', 'Canned Goods',
  'Grains', 'Breakfast', 'Vegetarian', 'Other'
];

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({ 
  onClose, 
  onSubmit, 
  initialData,
  stores = []
}) => {
  const { getUser } = useAuth();
  const user = getUser();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price ? initialData.price.toString() : '',
    category: initialData?.category || '',
    imageUrl: initialData?.image_url || '',
    storeId: initialData?.store_id || '',
    unit: initialData?.unit || 'unit'
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You need to be logged in to create products');
      return;
    }
    
    // Basic validation
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }
    
    setLoading(true);
    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        setLoading(false);
        return;
      }
      
      if (initialData) {
        // Update existing product
        await updateProduct(initialData.id, {
          name: formData.name,
          description: formData.description || null,
          price,
          category: formData.category || null,
          image_url: formData.imageUrl || null,
          store_id: formData.storeId || null
        });
        toast.success('Product updated successfully');
      } else {
        // Add new product
        await addProduct(
          formData.name,
          formData.description,
          price,
          formData.category,
          user.id,
          formData.imageUrl,
          formData.storeId || null
        );
        toast.success('Product added successfully');
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => handleSelectChange('unit', value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_UNITS.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store">Store</Label>
            <Select 
              value={formData.storeId} 
              onValueChange={(value) => handleSelectChange('storeId', value)}
            >
              <SelectTrigger id="store">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No store</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
