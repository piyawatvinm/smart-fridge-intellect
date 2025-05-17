
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthComponents';
import { 
  Home, 
  ShoppingBag, 
  Receipt, 
  List, 
  ChefHat, 
  LogOut, 
  Menu, 
  X, 
  User,
  Search,
  Tag,
  ShoppingCart,
  Package,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { NotificationIcon } from './NotificationComponents';
import { CartIcon } from './CartComponents';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, getUser } = useAuth();
  const user = getUser();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Get the first initial of the user's name or use a fallback
  const getUserInitial = () => {
    if (user?.name && typeof user.name === 'string') {
      return user.name.charAt(0);
    }
    
    if (user?.email && typeof user.email === 'string') {
      return user.email.charAt(0);
    }
    
    return 'U'; // Default fallback
  };

  // Get display name with fallbacks
  const getDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    
    if (user?.email) {
      // Extract name part from email
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <ChefHat className="h-6 w-6 mr-2 text-fridge-blue" />
              <span className="text-xl font-bold text-fridge-blue">ChefMate</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Notification Icon */}
              <NotificationIcon />
              
              {/* Cart Icon */}
              <CartIcon />
              
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-fridge-blue text-white">
                  {getUserInitial()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{getDisplayName()}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-fridge-blue"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="sr-only md:not-sr-only">Logout</span>
            </Button>
          </div>
          
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-fridge-blue text-white">
                    {getUserInitial()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{getDisplayName()}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Mobile Notification Icon */}
                <NotificationIcon />
                
                {/* Mobile Cart Icon */}
                <CartIcon />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </div>
            
            <MobileNavItem
              to="/dashboard"
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              isActive={location.pathname === '/dashboard'}
            />
            <MobileNavItem
              to="/receipt"
              icon={<Receipt className="h-5 w-5" />}
              label="Upload Receipt"
              isActive={location.pathname === '/receipt'}
            />
            <MobileNavItem
              to="/ingredients"
              icon={<List className="h-5 w-5" />}
              label="Ingredients"
              isActive={location.pathname === '/ingredients'}
            />
            <MobileNavItem
              to="/stores"
              icon={<ShoppingBag className="h-5 w-5" />}
              label="Stores"
              isActive={location.pathname === '/stores'}
            />
            <MobileNavItem
              to="/recommendations"
              icon={<ChefHat className="h-5 w-5" />}
              label="Recommendations"
              isActive={location.pathname === '/recommendations'}
            />
            <MobileNavItem
              to="/my-orders"
              icon={<ShoppingCart className="h-5 w-5" />}
              label="My Orders"
              isActive={location.pathname === '/my-orders'}
            />
            <MobileNavItem
              to="/ai-recipes"
              icon={<Sparkles className="h-5 w-5" />}
              label="AI Recipes"
              isActive={location.pathname === '/ai-recipes'}
            />
            
            {location.pathname === '/products' && (
              <MobileNavItem
                to="/products"
                icon={<Tag className="h-5 w-5" />}
                label="Products"
                isActive={true}
              />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

interface MobileNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const MobileNavItem = ({ to, icon, label, isActive }: MobileNavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'bg-fridge-blue text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navItems, setNavItems] = useState([
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/receipt', label: 'Upload Receipt', icon: Receipt },
    { path: '/ingredients', label: 'Ingredients', icon: List },
    { path: '/stores', label: 'Stores', icon: ShoppingBag },
    { path: '/recommendations', label: 'Recommendations', icon: ChefHat },
    { path: '/my-orders', label: 'My Orders', icon: ShoppingCart },
    { path: '/ai-recipes', label: 'AI Recipes', icon: Sparkles },
  ]);
  const [categories, setCategories] = useState<string[]>([]);
  const { getUser } = useAuth();
  const user = getUser();
  
  useEffect(() => {
    // Here we fetch unique categories from the ingredients table
    const fetchCategories = async () => {
      if (!user) return;
      
      try {
        // Fetch all ingredients 
        const { data, error } = await supabase
          .from('ingredients')
          .select('category');
        
        if (error) {
          console.error('Error fetching ingredients categories:', error);
        } else if (data && data.length > 0) {
          // Extract unique categories, handling the case where category might be missing
          const uniqueCategories = [...new Set(
            data
              .filter(item => item.category) // Make sure category exists
              .map(item => item.category)
          )];
          
          console.log('Unique categories:', uniqueCategories);
          setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, [user]);

  // Check if we arrived from recommendations page and should show products
  const fromRecommendations = location.pathname === '/products' && 
                             document.referrer.includes('/recommendations');
                             
  const showProductsLink = fromRecommendations || location.pathname === '/products';
  
  return (
    <div className="hidden md:flex flex-col h-screen bg-white border-r border-gray-200 w-64 sticky top-0">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-shrink-0 px-4 flex items-center">
          <ChefHat className="h-6 w-6 mr-2 text-fridge-blue" />
          <h1 className="text-xl font-bold text-fridge-blue">ChefMate</h1>
        </div>
        <nav className="mt-8 flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            // Skip the Products link unless we're showing it
            if (item.path === '/products' && !showProductsLink) return null;
            
            const Icon = item.icon;
            return (
              <SidebarItem
                key={item.path}
                to={item.path}
                icon={<Icon className="h-5 w-5" />}
                label={item.label}
                isActive={location.pathname === item.path}
              />
            );
          })}
          
          {/* Show products link conditionally */}
          {showProductsLink && (
            <SidebarItem
              to="/products"
              icon={<Tag className="h-5 w-5" />}
              label="Products"
              isActive={location.pathname === '/products'}
            />
          )}
          
          {categories.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <h2 className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  Categories
                </h2>
              </div>
              
              {categories.map(category => (
                <SidebarItem
                  key={`category-${category}`}
                  to={`/ingredients?category=${encodeURIComponent(category)}`}
                  icon={<Tag className="h-5 w-5" />}
                  label={category}
                  isActive={location.pathname === '/ingredients' && location.search.includes(`category=${encodeURIComponent(category)}`)}
                />
              ))}
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarItem = ({ to, icon, label, isActive }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-fridge-blue text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
