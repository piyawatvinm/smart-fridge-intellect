
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new MyOrders page
    navigate('/my-orders');
  }, [navigate]);
  
  return <div>Redirecting to My Orders...</div>;
};

export default CartPage;
