
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useAuth } from './AuthComponents';
import { addProduct, updateProduct, deleteProduct } from '@/lib/supabaseHelpers';
import { AddToCartButton } from './CartComponents';

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

interface ProductCardProps {
  product: Product;
  onUpdate?: () => void;
  showActions?: boolean;
  isOwner?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onUpdate,
  showActions = true,
  isOwner = false
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        {product.image_url && (
          <div className="h-48 bg-gray-100">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{product.name}</CardTitle>
            <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
          </div>
          {product.category && (
            <div className="text-sm text-gray-500">
              {product.category}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow">
          {product.description && (
            <p className="text-gray-700 text-sm">{product.description}</p>
          )}
        </CardContent>
        
        {showActions && (
          <CardFooter className="flex justify-between">
            {isOwner ? (
              <>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            ) : (
              <AddToCartButton productId={product.id} />
            )}
          </CardFooter>
        )}
      </Card>
      
      {isEditDialogOpen && (
        <ProductEditDialog 
          product={product} 
          onClose={() => setIsEditDialogOpen(false)}
          onUpdate={() => {
            setIsEditDialogOpen(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
      
      {isDeleteDialogOpen && (
        <ProductDeleteDialog
          product={product}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={() => {
            setIsDeleteDialogOpen(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </>
  );
};

interface ProductFormDialogProps {
  onClose: () => void;
  onSubmit: () => void;
  initialData?: Product;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({ 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const { getUser } = useAuth();
  const user = getUser();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price ? initialData.price.toString() : '',
    category: initialData?.category || '',
    imageUrl: initialData?.image_url || ''
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
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
          description: formData.description,
          price,
          category: formData.category,
          image_url: formData.imageUrl
        });
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await addProduct(
          formData.name,
          formData.description,
          price,
          formData.category,
          user.id,
          formData.imageUrl
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
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Update the product details below.' 
              : 'Fill in the details to add a new product.'}
          </DialogDescription>
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
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                  <SelectItem value="Meat">Meat</SelectItem>
                  <SelectItem value="Bakery">Bakery</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ProductEditDialogProps {
  product: Product;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProductEditDialog: React.FC<ProductEditDialogProps> = ({ 
  product, 
  onClose, 
  onUpdate 
}) => {
  return (
    <ProductFormDialog 
      initialData={product}
      onClose={onClose}
      onSubmit={onUpdate}
    />
  );
};

interface ProductDeleteDialogProps {
  product: Product;
  onClose: () => void;
  onDelete: () => void;
}

export const ProductDeleteDialog: React.FC<ProductDeleteDialogProps> = ({ 
  product, 
  onClose, 
  onDelete 
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(product.id);
      toast.success('Product deleted');
      onDelete();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{product.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
