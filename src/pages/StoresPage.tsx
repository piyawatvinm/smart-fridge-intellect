import { Layout } from "@/components/LayoutComponents";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Star, MapPin, ShoppingBag, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthComponents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface Store {
  id: string;
  name: string;
  type?: 'grocery' | 'supermarket' | 'convenience' | 'specialty';
  distance?: number;
  rating?: number;
  address: string;
  logo?: string;
  featured?: boolean;
  openHours?: string;
  promotions?: string[];
  user_id: string | null;
}

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getUser } = useAuth();
  const user = getUser();
  
  const form = useForm({
    defaultValues: {
      name: '',
      address: '',
    }
  });
  
  // Fetch stores from Supabase
  useEffect(() => {
    const fetchStores = async () => {      
      try {
        // Fetch all stores without filtering by user_id
        const { data, error } = await supabase
          .from('stores')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          // Transform data to include mock properties for UI
          const enhancedStores: Store[] = data.map(store => ({
            ...store,
            type: getRandomStoreType(),
            distance: parseFloat((Math.random() * 5).toFixed(1)),
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            featured: Math.random() > 0.7,
            openHours: getRandomOpenHours()
          }));
          
          setStores(enhancedStores);
          setFilteredStores(enhancedStores);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to load stores');
      } finally {
        setLoading(false);
      }
    };
    
    setLoading(true);
    fetchStores();
  }, []);
  
  // Helper functions for mock data generation
  const getRandomStoreType = (): 'grocery' | 'supermarket' | 'convenience' | 'specialty' => {
    const types: ('grocery' | 'supermarket' | 'convenience' | 'specialty')[] = [
      'grocery', 'supermarket', 'convenience', 'specialty'
    ];
    return types[Math.floor(Math.random() * types.length)];
  };
  
  const getRandomOpenHours = (): string => {
    const hours = [
      '8:00 AM - 9:00 PM',
      '7:00 AM - 10:00 PM',
      '6:00 AM - 11:00 PM',
      '8:00 AM - 8:00 PM',
      '9:00 AM - 7:00 PM',
    ];
    return hours[Math.floor(Math.random() * hours.length)];
  };
  
  // Filter stores when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStores(stores);
    } else {
      const filtered = stores.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.type && store.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStores(filtered);
    }
  }, [searchTerm, stores]);
  
  const handleAddStore = async (data: { name: string; address: string }) => {
    if (!user) {
      toast.error('You must be logged in to add a store');
      return;
    }
    
    try {
      const { data: newStore, error } = await supabase
        .from('stores')
        .insert({
          name: data.name,
          address: data.address,
          user_id: null // Make it visible to all users
        })
        .select();
      
      if (error) throw error;
      
      if (newStore && newStore.length > 0) {
        // Add random properties for UI display
        const enhancedStore: Store = {
          ...newStore[0],
          type: getRandomStoreType(),
          distance: parseFloat((Math.random() * 5).toFixed(1)),
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          featured: false,
          openHours: getRandomOpenHours()
        };
        
        setStores(prev => [...prev, enhancedStore]);
        setFilteredStores(prev => [...prev, enhancedStore]);
        toast.success('Store added successfully!');
        form.reset();
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding store:', error);
      toast.error('Failed to add store');
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'grocery':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Grocery</Badge>;
      case 'supermarket':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Supermarket</Badge>;
      case 'convenience':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Convenience</Badge>;
      case 'specialty':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Specialty</Badge>;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-fridge-yellow text-fridge-yellow" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <span className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-fridge-yellow text-fridge-yellow" />
          </span>
        </span>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return <div className="flex">{stars}</div>;
  };

  const visitStore = (store: Store) => {
    // In a real app, this would navigate to the store's website or app
    toast.success(`Visiting ${store.name}...`);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nearby Stores</h1>
            <p className="text-gray-600 mt-1">Find stores and special offers based on your ingredients</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-fridge-blue hover:bg-fridge-blue-light">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Find Stores</CardTitle>
                <CardDescription>
                  {filteredStores.length} stores near your location
                </CardDescription>
              </div>
              
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search stores by name or location..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="h-44 shimmer rounded-lg"></div>
                  ))}
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No stores found matching your search.</p>
                  <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <>
                  {/* Featured Stores */}
                  {filteredStores.some(store => store.featured) && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-medium">Featured Stores</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredStores
                          .filter(store => store.featured)
                          .map((store) => (
                            <div 
                              key={store.id}
                              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
                                      <ShoppingBag className="h-6 w-6 text-fridge-blue" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium">{store.name}</h3>
                                      <div className="flex items-center mt-1 space-x-2">
                                        {getTypeLabel(store.type)}
                                        <span className="text-sm text-gray-500">
                                          {store.distance.toFixed(1)} miles away
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {renderStars(store.rating)}
                                    <span className="ml-1 text-sm text-gray-600">{store.rating.toFixed(1)}</span>
                                  </div>
                                </div>
                                
                                <div className="text-sm text-gray-600 mb-2 flex items-start">
                                  <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                  <span>{store.address}</span>
                                </div>
                                
                                <div className="text-sm text-gray-600 mb-3">
                                  <span className="font-medium">Hours:</span> {store.openHours}
                                </div>
                                
                                {store.promotions && store.promotions.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium mb-2">Current Promotions:</h4>
                                    <div className="space-y-1">
                                      {store.promotions.map((promo, index) => (
                                        <div 
                                          key={index}
                                          className="text-sm bg-yellow-50 text-yellow-800 px-3 py-1 rounded-md"
                                        >
                                          {promo}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => visitStore(store)}
                                    className="bg-fridge-blue hover:bg-fridge-blue-light"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Visit Store
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* All Other Stores */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium">All Stores</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {filteredStores
                        .filter(store => !store.featured)
                        .map((store) => (
                          <div 
                            key={store.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-fridge-blue" />
                              </div>
                              <div>
                                <h3 className="font-medium">{store.name}</h3>
                                <div className="flex items-center mt-1">
                                  {renderStars(store.rating)}
                                  <span className="ml-1 text-xs text-gray-600">{store.rating.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex">
                                {getTypeLabel(store.type)}
                                <span className="ml-2 text-gray-500">
                                  {store.distance.toFixed(1)} miles
                                </span>
                              </div>
                              <div className="text-gray-600 flex items-start">
                                <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{store.address}</span>
                              </div>
                              <div className="text-gray-600">
                                <span className="font-medium">Hours:</span> {store.openHours}
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => visitStore(store)}
                              className="w-full text-sm bg-fridge-blue hover:bg-fridge-blue-light"
                              size="sm"
                            >
                              Visit Store
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Store Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>
              Enter the details of the store you want to add.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleAddStore)}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  placeholder="Enter store name"
                  {...form.register('name', { required: 'Store name is required' })}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Store Address</Label>
                <Input
                  id="address"
                  placeholder="Enter store address"
                  {...form.register('address', { required: 'Store address is required' })}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Store</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StoresPage;
