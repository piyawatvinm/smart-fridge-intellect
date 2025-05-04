
import React, { useState, useEffect } from 'react';
import { 
  fetchCartItems, 
  addToCart as addToCartHelper, 
  removeFromCart, 
  updateCartQuantity,
  fetchProductDetails,
  placeOrder
} from '@/lib/supabaseHelpers';
import { useAuth } from './AuthComponents';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  Store,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    category?: string;
    store_id?: string;
    store?: {
      id: string;
      name: string;
    };
  };
}

interface StoreGroup {
  storeName: string;
  storeId: string | null;
  items: CartItem[];
  subtotal: number;
}

interface CartDisplayProps {
  onOrderPlaced?: () => void;
  onConfirmPurchase?: () => void;
}

export const CartDisplay: React.FC<CartDisplayProps> = ({ 
  onOrderPlaced,
  onConfirmPurchase
}) => {
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  const fetchCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await fetchCartItems(user.id);
      
      // Fetch product details for each cart item
      const itemsWithProductDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await fetchProductDetails(item.product_id);
            return {
              ...item,
              product: product || { 
                id: item.product_id,
                name: 'Unknown Product',
                price: 0
              }
            };
          } catch (err) {
            console.error(`Error fetching product ${item.product_id}:`, err);
            return {
              ...item,
              product: { 
                id: item.product_id,
                name: 'Unknown Product',
                price: 0
              }
            };
          }
        })
      );
      
      setCartItems(itemsWithProductDetails);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCart();
  }, [user]);
  
  const handleRemoveFromCart = async (cartItemId: string) => {
    if (!user) return;
    
    try {
      await removeFromCart(cartItemId);
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item');
    }
  };
  
  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;
    
    try {
      await updateCartQuantity(cartItemId, newQuantity);
      setCartItems(cartItems.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0) return;
    
    setPlacingOrder(true);
    try {
      await placeOrder(user.id);
      toast.success('Order placed successfully!');
      setCartItems([]);
      
      if (onOrderPlaced) {
        onOrderPlaced();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleConfirmPurchase = () => {
    if (!cartItems.length) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (onConfirmPurchase) {
      onConfirmPurchase();
    }
  };
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Group cart items by store for display
  const groupItemsByStore = (): StoreGroup[] => {
    const storeGroups: Record<string, StoreGroup> = {};
    
    cartItems.forEach(item => {
      const storeId = item.product.store_id || 'no-store';
      const storeName = item.product.store?.name || 'General Store';
      
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          storeId: storeId === 'no-store' ? null : storeId,
          storeName,
          items: [],
          subtotal: 0
        };
      }
      
      storeGroups[storeId].items.push(item);
      storeGroups[storeId].subtotal += item.product.price * item.quantity;
    });
    
    return Object.values(storeGroups);
  };
  
  const storeGroups = groupItemsByStore();
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Please log in to view your cart.</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Shopping Cart {totalItems > 0 && `(${totalItems} items)`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Your cart is empty.</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/products?from=my-orders')}
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Show items grouped by store */}
            {storeGroups.map((storeGroup, index) => (
              <div key={index} className="mb-6">
                <div className="flex items-center mb-2">
                  <Store className="h-4 w-4 mr-2 text-gray-600" />
                  <h3 className="font-medium">{storeGroup.storeName}</h3>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeGroup.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            {item.product.category && (
                              <div className="text-xs text-gray-500">
                                {item.product.category}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>${item.product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-5 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Subtotal:
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${storeGroup.subtotal.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="font-bold">Order Total:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => navigate('/products?from=my-orders')}
                >
                  Add More Items
                </Button>
                <Button
                  className="bg-fridge-blue hover:bg-blue-700"
                  disabled={placingOrder || cartItems.length === 0}
                  onClick={handleConfirmPurchase}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Purchase
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  className?: string;
  showIcon?: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  quantity = 1,
  className = '',
  showIcon = true
}) => {
  const { getUser } = useAuth();
  const user = getUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      await addToCartHelper(user.id, productId, quantity);
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
      className={className || "bg-fridge-blue hover:bg-blue-700"}
    >
      {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
};
