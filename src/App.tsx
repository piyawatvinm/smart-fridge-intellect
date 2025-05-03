
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ReceiptPage from "./pages/ReceiptPage";
import IngredientsPage from "./pages/IngredientsPage";
import StoresPage from "./pages/StoresPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import WelcomePage from "./pages/WelcomePage";
import ShoppingListPage from "./pages/ShoppingListPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./components/AuthComponents";
import { useState } from "react";

const App = () => {
  // Create a new QueryClient instance within the component function
  // This ensures it's created in the correct React context
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/receipt" element={<ReceiptPage />} />
                <Route path="/ingredients" element={<IngredientsPage />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/shopping-list" element={<ShoppingListPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
