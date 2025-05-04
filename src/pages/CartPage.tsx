
import React from 'react';
import { Layout } from '@/components/LayoutComponents';
import { CartDisplay } from '@/components/CartComponents';
import { GeminiDemo } from '@/components/GeminiDemo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CartPage = () => {
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>
        
        <Tabs defaultValue="cart" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="cart">Shopping Cart</TabsTrigger>
            <TabsTrigger value="ai">Gemini AI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cart">
            <CartDisplay />
          </TabsContent>
          
          <TabsContent value="ai">
            <GeminiDemo />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CartPage;
