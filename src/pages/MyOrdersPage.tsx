
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { useAuth } from '@/components/AuthComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CartDisplay } from '@/components/CartComponents';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOrders, fetchOrderDetails, addIngredientsFromCart } from '@/lib/supabaseHelpers';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Package, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    description?: string;
    price: number;
    store_id?: string;
    store?: {
      id: string;
      name: string;
    };
  };
}

interface OrderWithItems extends Order {
  items: OrderItem[];
}

// Group items by store for display
interface StoreGroup {
  storeName: string;
  storeId: string | null;
  items: OrderItem[];
  subtotal: number;
}

const MyOrdersPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cart');
  const [confirmOrderDialogOpen, setConfirmOrderDialogOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await fetchOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (orderId: string) => {
    setOrderDetailsLoading(true);
    try {
      const orderDetails = await fetchOrderDetails(orderId);
      setSelectedOrder(orderDetails as OrderWithItems);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleConfirmPurchase = () => {
    setConfirmOrderDialogOpen(true);
  };

  const processPurchase = async () => {
    if (!user) return;
    
    setProcessingOrder(true);
    try {
      // Add cart items to ingredients
      await addIngredientsFromCart(user.id);
      
      // Refresh orders after purchase
      await loadOrders();
      
      setOrderSuccessMessage('Your order has been processed successfully! Items have been added to your ingredients.');
      setConfirmOrderDialogOpen(false);
      
      // Show success message
      toast.success('Order confirmed! Items added to your ingredients');
      
      // Automatically switch to history tab after successful order
      setTimeout(() => {
        setActiveTab('history');
      }, 1500);
      
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process your order');
    } finally {
      setProcessingOrder(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const formatOrderId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // Group order items by store
  const groupItemsByStore = (items: OrderItem[]): StoreGroup[] => {
    const storeGroups: Record<string, StoreGroup> = {};
    
    items.forEach(item => {
      const storeId = item.products.store_id || 'no-store';
      const storeName = item.products.store?.name || 'General Store';
      
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          storeId: storeId === 'no-store' ? null : storeId,
          storeName,
          items: [],
          subtotal: 0
        };
      }
      
      storeGroups[storeId].items.push(item);
      storeGroups[storeId].subtotal += item.price * item.quantity;
    });
    
    return Object.values(storeGroups);
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        {orderSuccessMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              {orderSuccessMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="cart">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Current Cart
            </TabsTrigger>
            <TabsTrigger value="history">
              <Package className="h-4 w-4 mr-2" />
              Order History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cart">
            <CartDisplay 
              onOrderPlaced={() => {
                loadOrders();
                setActiveTab('history');
              }}
              onConfirmPurchase={handleConfirmPurchase}
            />
          </TabsContent>
          
          <TabsContent value="history">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : orders.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Past Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <Card 
                        key={order.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <CardHeader className="py-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-lg">Order #{formatOrderId(order.id)}</CardTitle>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">${order.total_amount.toFixed(2)}</div>
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                order.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your order history will appear here once you place orders.
                </p>
                <Button
                  onClick={() => setActiveTab('cart')}
                  className="mt-6 bg-fridge-blue hover:bg-blue-700"
                >
                  Back to Cart
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{formatOrderId(selectedOrder.id)}</DialogTitle>
              <DialogDescription>
                Placed on {formatDate(selectedOrder.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            {orderDetailsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div>
                <div className="mb-4 flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className={`inline-block px-2 py-1 rounded-full text-sm ${
                      selectedOrder.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Group items by store */}
                {groupItemsByStore(selectedOrder.items).map((storeGroup, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="font-medium mb-2 flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {storeGroup.storeName}
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storeGroup.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.products.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                          <TableCell className="text-right font-medium">${storeGroup.subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ))}

                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold border-t">Order Total</TableCell>
                  <TableCell className="text-right font-bold border-t">${selectedOrder.total_amount.toFixed(2)}</TableCell>
                </TableRow>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Purchase Dialog */}
      <Dialog open={confirmOrderDialogOpen} onOpenChange={setConfirmOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Purchase</DialogTitle>
            <DialogDescription>
              Once confirmed, items will be added to your ingredients.
            </DialogDescription>
          </DialogHeader>
          
          <p className="text-gray-700">
            This will simulate a purchase from the stores and automatically add the items to your ingredients list.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmOrderDialogOpen(false)}
              disabled={processingOrder}
            >
              Cancel
            </Button>
            <Button 
              onClick={processPurchase}
              disabled={processingOrder}
              className="bg-fridge-blue hover:bg-blue-700"
            >
              {processingOrder ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MyOrdersPage;
