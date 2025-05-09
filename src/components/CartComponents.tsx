
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from './AuthComponents';
import { addToCart, removeFromCart, updateCartItemQuantity, fetchCartItems } from '@/lib/supabaseHelpers';
import { PlusCircle, MinusCircle, Trash2, ShoppingCart, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

// Add the CartIcon component that's being imported in LayoutComponents.tsx
export const CartIcon = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const loadCartCount = async () => {
    if (!user) return;
    try {
      const items = await fetchCartItems(user.id);
      setCartCount(items ? items.length : 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  return (
    <div className="relative" onClick={() => navigate('/my-orders')} style={{ cursor: 'pointer' }}>
      <ShoppingCart className="h-5 w-5 text-gray-500" />
      {cartCount > 0 && (
        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
          {cartCount}
        </Badge>
      )}
    </div>
  );
};

export const AddToCartButton = ({ productId, variant = 'default', size = 'default' }) => {
  const { getUser } = useAuth();
  const user = getUser();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await addToCart(user.id, productId);
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={loading}
      variant={variant}
      size={size}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};

// Define interface for store group
interface StoreGroup {
  storeName: string;
  storeId: string | null;
  items: any[];
  subtotal: number;
}

export const CartDisplay = ({ onOrderPlaced, onConfirmPurchase }) => {
  const { getUser } = useAuth();
  const user = getUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await fetchCartItems(user.id);
      setCartItems(items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    
    try {
      await updateCartItemQuantity(itemId, quantity);
      loadCart(); // Reload cart after update
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
      loadCart(); // Reload cart after removal
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.products?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Group cart items by store
  const groupItemsByStore = (): StoreGroup[] => {
    const groups: Record<string, StoreGroup> = {};
    
    cartItems.forEach(item => {
      const storeId = item.products?.store_id || 'no-store';
      const storeName = item.products?.store?.name || 'General Store';
      
      if (!groups[storeId]) {
        groups[storeId] = {
          storeName,
          storeId: storeId === 'no-store' ? null : storeId,
          items: [],
          subtotal: 0
        };
      }
      
      groups[storeId].items.push(item);
      groups[storeId].subtotal += (item.products?.price || 0) * item.quantity;
    });
    
    return Object.values(groups);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please log in to view your cart
        </p>
        <Button onClick={() => navigate('/login')} className="mt-6">
          Log In
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add items to your cart to see them here
        </p>
        <Button onClick={() => navigate('/products')} className="mt-6">
          Browse Products
        </Button>
      </div>
    );
  }

  const storeGroups = groupItemsByStore();
  const total = calculateTotal();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
      
      <div className="space-y-6">
        {storeGroups.map((group, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2 text-gray-500" />
                {group.storeName}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {group.items.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center">
                    {item.products?.image_url && (
                      <img 
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{item.products?.name}</div>
                      <div className="text-sm text-gray-500">
                        ${item.products?.price?.toFixed(2)} per {item.products?.unit || 'unit'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <div className="font-medium">
                        ${((item.products?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex items-center border rounded">
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1) {
                            handleUpdateQuantity(item.id, val);
                          }
                        }}
                        className="w-12 h-8 text-center border-0 p-0"
                        min="1"
                      />
                      
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-right">
                <div className="text-gray-600">Subtotal: ${group.subtotal.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-lg font-bold">
            <div>Order Total:</div>
            <div>${total.toFixed(2)}</div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4 pt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
          
          <Button 
            onClick={onConfirmPurchase} 
            className="bg-fridge-blue hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Complete Purchase
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
