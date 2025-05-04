
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthComponents';
import { 
  fetchCartItems, 
  removeFromCart, 
  updateCartItemQuantity,
  createOrder
} from '@/lib/supabaseHelpers';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Cart item type
export interface CartItem {
  id: string;
  quantity: number;
  user_id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
  };
}

export const CartDisplay = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCartItems();
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await fetchCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    
    setProcessing(true);
    try {
      const totalAmount = calculateTotal();
      await createOrder(user.id, totalAmount);
      
      toast.success('Order placed successfully!');
      setCartItems([]);
      navigate('/dashboard');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => 
      sum + (item.quantity * item.products.price), 0
    );
  };
  
  const isCartEmpty = cartItems.length === 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
      </div>
    );
  }

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2" />
          Your Cart
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isCartEmpty ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div className="flex-1">
                  <h3 className="font-medium">{item.products.name}</h3>
                  <p className="text-sm text-gray-500">${item.products.price.toFixed(2)} each</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center">{item.quantity}</span>
                  
                  <button 
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <div className="w-full flex justify-between py-4">
          <span className="font-medium">Total:</span>
          <span className="font-bold">${calculateTotal().toFixed(2)}</span>
        </div>
        
        <Button 
          className="w-full bg-fridge-blue hover:bg-blue-700"
          disabled={isCartEmpty || processing}
          onClick={handleCheckout}
        >
          {processing ? 'Processing...' : 'Checkout'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const CartIcon = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [itemCount, setItemCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      loadCartCount();
    }
  }, [user]);
  
  const loadCartCount = async () => {
    if (!user) return;
    
    try {
      const items = await fetchCartItems(user.id);
      setItemCount(items.length);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };
  
  const handleClick = () => {
    navigate('/cart');
  };
  
  return (
    <button 
      onClick={handleClick} 
      className="relative p-2 hover:bg-gray-100 rounded-full"
    >
      <ShoppingCart className="h-5 w-5 text-gray-600" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-fridge-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </button>
  );
};

// Add to Cart component
interface AddToCartProps {
  productId: string;
}

export const AddToCartButton: React.FC<AddToCartProps> = ({ productId }) => {
  const { getUser } = useAuth();
  const user = getUser();
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('You need to be logged in to add items to cart');
      return;
    }
    
    setLoading(true);
    try {
      const { addToCart } = await import('@/lib/supabaseHelpers');
      await addToCart(user.id, productId, 1);
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleAddToCart}
      disabled={loading}
      variant="outline"
      size="sm"
      className="ml-auto"
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};
