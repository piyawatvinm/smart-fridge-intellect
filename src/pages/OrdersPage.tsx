
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { useAuth } from '@/components/AuthComponents';
import { fetchOrders, fetchOrderDetails } from '@/lib/supabaseHelpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

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
  };
}

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const OrdersPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

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

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : orders.length > 0 ? (
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
                      <CardTitle>Order #{formatOrderId(order.id)}</CardTitle>
                      <CardDescription>{formatDate(order.created_at)}</CardDescription>
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
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your order history will appear here once you place orders.
            </p>
            <Button
              onClick={() => window.location.href = '/products'}
              className="mt-6 bg-fridge-blue hover:bg-blue-700"
            >
              Browse Products
            </Button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[600px]">
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
                
                <h3 className="font-medium mb-2">Items</h3>
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
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.products.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">${selectedOrder.total_amount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default OrdersPage;
