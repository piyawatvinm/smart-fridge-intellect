import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/AuthComponents';

import WelcomePage from '@/pages/WelcomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Dashboard from '@/pages/Dashboard';
import IngredientsPage from '@/pages/IngredientsPage';
import ShoppingListPage from '@/pages/ShoppingListPage';
import ReceiptPage from '@/pages/ReceiptPage';
import ProductsPage from '@/pages/ProductsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import MyOrdersPage from '@/pages/MyOrdersPage';
import StoresPage from '@/pages/StoresPage';
import OrdersPage from '@/pages/OrdersPage';
import CartPage from '@/pages/CartPage';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import our recipe generator pages
import GenerateRecipePage from '@/pages/GenerateRecipePage';
import AIRecipesPage from '@/pages/AIRecipesPage';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ingredients" element={<IngredientsPage />} />
                <Route path="/shopping-list" element={<ShoppingListPage />} />
                <Route path="/receipt" element={<ReceiptPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/generate-recipe" element={<GenerateRecipePage />} />
                
                {/* Add the new AI Recipes route */}
                <Route path="/ai-recipes" element={<AIRecipesPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
