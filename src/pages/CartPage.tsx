
import React from 'react';
import { Layout } from '@/components/LayoutComponents';
import { CartDisplay } from '@/components/CartComponents';

const CartPage = () => {
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>
        <CartDisplay />
      </div>
    </Layout>
  );
};

export default CartPage;
