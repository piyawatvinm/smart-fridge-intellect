import { Layout } from "@/components/LayoutComponents";
import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Plus, Trash2, Pencil, Tag, Calendar, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthComponents";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
  category: string;
  purchaseDate: Date;
  daysLeft: number;
  status: 'fresh' | 'expiring-soon' | 'expired';
}

const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 1,
    unit: 'piece',
    category: 'Dairy',
    expiryDate: ''
  });
  
  const { getUser } = useAuth();
  const user = getUser();
  
  // Load ingredients from database
  const loadIngredients = async () => {
    setLoading(true);
    
    try {
      // Fetch ingredients from Supabase
      const { data, error } = await supabase
        .from('ingredients')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Transform DB data into the Ingredient interface
        const transformedData: Ingredient[] = data.map(item => {
          const expiryDate = new Date(item.expiry_date);
          const purchaseDate = item.created_at ? new Date(item.created_at) : new Date();
          const today = new Date();
          
          // Calculate days left until expiry
          const diffTime = expiryDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Determine status based on days left
          let status: 'fresh' | 'expiring-soon' | 'expired';
          if (daysLeft <= 0) {
            status = 'expired';
          } else if (daysLeft <= 3) {
            status = 'expiring-soon';
          } else {
            status = 'fresh';
          }
          
          return {
            id: item.id,
            name: item.name,
            quantity: Number(item.quantity),
            unit: item.unit,
            expiryDate,
            // Since there's no category column yet, we'll use a mock one
            category: 'Dairy', // Temporary default
            purchaseDate,
            daysLeft: daysLeft > 0 ? daysLeft : 0,
            status
          };
        });
        
        setIngredients(transformedData);
        setFilteredIngredients(transformedData);
      } else {
        // If no data, load mock data
        loadMockData();
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast.error("Failed to load ingredients. Using mock data.");
      loadMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Load mock data as fallback
  const loadMockData = () => {
    const mockIngredients: Ingredient[] = [
      {
        id: '1',
        name: 'Milk',
        quantity: 1,
        unit: 'carton',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        category: 'Dairy',
        purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        daysLeft: 2,
        status: 'expiring-soon'
      },
      {
        id: '2',
        name: 'Eggs',
        quantity: 12,
        unit: 'pieces',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        category: 'Dairy',
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        daysLeft: 7,
        status: 'fresh'
      },
      {
        id: '3',
        name: 'Bread',
        quantity: 1,
        unit: 'loaf',
        expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        category: 'Bakery',
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        daysLeft: 0,
        status: 'expired'
      },
      {
        id: '4',
        name: 'Tomatoes',
        quantity: 5,
        unit: 'pieces',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        category: 'Vegetables',
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        daysLeft: 3,
        status: 'fresh'
      },
      {
        id: '5',
        name: 'Chicken',
        quantity: 1,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        category: 'Meat',
        purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        daysLeft: 1,
        status: 'expiring-soon'
      },
      {
        id: '6',
        name: 'Cheese',
        quantity: 1,
        unit: 'pack',
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        category: 'Dairy',
        purchaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        daysLeft: 14,
        status: 'fresh'
      },
      {
        id: '7',
        name: 'Yogurt',
        quantity: 4,
        unit: 'cups',
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        category: 'Dairy',
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        daysLeft: 5,
        status: 'fresh'
      },
      {
        id: '8',
        name: 'Apples',
        quantity: 6,
        unit: 'pieces',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        category: 'Fruits',
        purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        daysLeft: 10,
        status: 'fresh'
      },
      {
        id: '9',
        name: 'Pasta',
        quantity: 1,
        unit: 'pack',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        category: 'Pantry',
        purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        daysLeft: 90,
        status: 'fresh'
      },
      {
        id: '10',
        name: 'Ground Beef',
        quantity: 500,
        unit: 'g',
        expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        category: 'Meat',
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        daysLeft: 0,
        status: 'expired'
      }
    ];
    
    setIngredients(mockIngredients);
    setFilteredIngredients(mockIngredients);
  };
  
  useEffect(() => {
    loadIngredients();
  }, []);
  
  // Filter ingredients when search term or category filter changes
  useEffect(() => {
    let filtered = [...ingredients];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    setFilteredIngredients(filtered);
  }, [searchTerm, filterCategory, ingredients]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'fresh':
        return <Badge className="bg-fridge-green text-white">Fresh</Badge>;
      case 'expiring-soon':
        return <Badge className="bg-fridge-orange text-white">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-fridge-red text-white">Expired</Badge>;
      default:
        return null;
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setIngredients(ingredients.filter(item => item.id !== id));
      toast.success("Ingredient removed successfully");
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error("Failed to remove ingredient");
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewIngredient({
      ...newIngredient,
      [id]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    setNewIngredient({
      ...newIngredient,
      [id]: value
    });
  };
  
  // Save new ingredient
  const saveIngredient = async () => {
    try {
      if (!newIngredient.name) {
        toast.error("Please enter a name for the ingredient");
        return;
      }
      
      if (!newIngredient.expiryDate) {
        toast.error("Please enter an expiry date");
        return;
      }
      
      // Check if user is authenticated
      if (!user) {
        toast.error("You must be logged in to save ingredients");
        return;
      }
      
      const { data, error } = await supabase
        .from('ingredients')
        .insert([
          {
            name: newIngredient.name,
            quantity: newIngredient.quantity,
            unit: newIngredient.unit,
            expiry_date: newIngredient.expiryDate,
            user_id: user.id
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success("New ingredient added successfully");
      setDialogOpen(false);
      
      // Reset form
      setNewIngredient({
        name: '',
        quantity: 1,
        unit: 'piece',
        category: 'Dairy',
        expiryDate: ''
      });
      
      // Reload ingredients
      loadIngredients();
      
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast.error("Failed to save ingredient");
    }
  };

  // Extract unique categories for the filter dropdown
  const categories = ['all', ...new Set(ingredients.map(item => item.category))];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredients List</h1>
          <p className="text-gray-600 mt-1">Manage all ingredients in your inventory</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Your Ingredients</CardTitle>
                <CardDescription>
                  {filteredIngredients.length} {filteredIngredients.length === 1 ? 'item' : 'items'} in your inventory
                </CardDescription>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search ingredients..."
                    className="pl-8 w-full md:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-fridge-blue hover:bg-fridge-blue-light">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Ingredient</DialogTitle>
                        <DialogDescription>
                          Enter the details for the new ingredient
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input 
                            id="name" 
                            placeholder="e.g., Milk" 
                            className="col-span-3" 
                            value={newIngredient.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="quantity" className="text-right">
                            Quantity
                          </Label>
                          <Input 
                            id="quantity" 
                            type="number" 
                            defaultValue="1" 
                            min="1" 
                            className="col-span-3"
                            value={newIngredient.quantity}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="unit" className="text-right">
                            Unit
                          </Label>
                          <Select 
                            value={newIngredient.unit}
                            onValueChange={(value) => handleSelectChange('unit', value)}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="piece">Piece</SelectItem>
                              <SelectItem value="kg">Kg</SelectItem>
                              <SelectItem value="g">Gram</SelectItem>
                              <SelectItem value="l">Liter</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="pack">Pack</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="category" className="text-right">
                            Category
                          </Label>
                          <Select 
                            value={newIngredient.category}
                            onValueChange={(value) => handleSelectChange('category', value)}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dairy">Dairy</SelectItem>
                              <SelectItem value="Meat">Meat</SelectItem>
                              <SelectItem value="Vegetables">Vegetables</SelectItem>
                              <SelectItem value="Fruits">Fruits</SelectItem>
                              <SelectItem value="Bakery">Bakery</SelectItem>
                              <SelectItem value="Pantry">Pantry</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="expiryDate" className="text-right">
                            Expiry Date
                          </Label>
                          <Input 
                            id="expiryDate" 
                            type="date" 
                            className="col-span-3"
                            value={newIngredient.expiryDate}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="button" 
                          className="bg-fridge-blue hover:bg-fridge-blue-light"
                          onClick={saveIngredient}
                        >
                          Save Ingredient
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="fresh">Fresh</TabsTrigger>
                <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {loading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, index) => (
                      <div key={index} className="h-16 shimmer rounded-md"></div>
                    ))}
                  </div>
                ) : filteredIngredients.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No ingredients found.</p>
                    <p className="text-gray-400 text-sm mt-1">Try changing your search or filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIngredients.map((ingredient) => (
                      <div 
                        key={ingredient.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start sm:items-center space-x-4 mb-2 sm:mb-0">
                          <div 
                            className={`w-3 h-12 rounded-full flex-shrink-0 ${
                              ingredient.status === 'fresh' 
                                ? 'bg-fridge-green' 
                                : ingredient.status === 'expiring-soon' 
                                ? 'bg-fridge-orange' 
                                : 'bg-fridge-red'
                            }`}
                          ></div>
                          <div>
                            <h3 className="font-medium mb-1">{ingredient.name}</h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Tag className="h-3.5 w-3.5 mr-1" />
                                {ingredient.category}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {formatDate(ingredient.expiryDate)}
                              </span>
                              <span className="flex items-center">
                                <Info className="h-3.5 w-3.5 mr-1" />
                                {ingredient.quantity} {ingredient.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between sm:justify-end items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {ingredient.daysLeft > 0 
                                ? `${ingredient.daysLeft} day${ingredient.daysLeft !== 1 ? 's' : ''} left` 
                                : 'Expired'}
                            </span>
                          </div>
                          {getStatusBadge(ingredient.status)}
                          <div className="flex space-x-1">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-fridge-red"
                              onClick={() => deleteIngredient(ingredient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="fresh">
                {loading ? (
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={index} className="h-16 shimmer rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIngredients
                      .filter(item => item.status === 'fresh')
                      .map((ingredient) => (
                        <div 
                          key={ingredient.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start sm:items-center space-x-4 mb-2 sm:mb-0">
                            <div className="w-3 h-12 rounded-full bg-fridge-green"></div>
                            <div>
                              <h3 className="font-medium mb-1">{ingredient.name}</h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Tag className="h-3.5 w-3.5 mr-1" />
                                  {ingredient.category}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {formatDate(ingredient.expiryDate)}
                                </span>
                                <span className="flex items-center">
                                  <Info className="h-3.5 w-3.5 mr-1" />
                                  {ingredient.quantity} {ingredient.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between sm:justify-end items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {ingredient.daysLeft} day{ingredient.daysLeft !== 1 ? 's' : ''} left
                              </span>
                            </div>
                            {getStatusBadge(ingredient.status)}
                            <div className="flex space-x-1">
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-fridge-red"
                                onClick={() => deleteIngredient(ingredient.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="expiring">
                {loading ? (
                  <div className="space-y-3">
                    {Array(2).fill(0).map((_, index) => (
                      <div key={index} className="h-16 shimmer rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIngredients
                      .filter(item => item.status === 'expiring-soon')
                      .map((ingredient) => (
                        <div 
                          key={ingredient.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start sm:items-center space-x-4 mb-2 sm:mb-0">
                            <div className="w-3 h-12 rounded-full bg-fridge-orange"></div>
                            <div>
                              <h3 className="font-medium mb-1">{ingredient.name}</h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Tag className="h-3.5 w-3.5 mr-1" />
                                  {ingredient.category}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {formatDate(ingredient.expiryDate)}
                                </span>
                                <span className="flex items-center">
                                  <Info className="h-3.5 w-3.5 mr-1" />
                                  {ingredient.quantity} {ingredient.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between sm:justify-end items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-fridge-orange" />
                              <span className="text-sm text-fridge-orange font-medium">
                                {ingredient.daysLeft} day{ingredient.daysLeft !== 1 ? 's' : ''} left
                              </span>
                            </div>
                            {getStatusBadge(ingredient.status)}
                            <div className="flex space-x-1">
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-fridge-red"
                                onClick={() => deleteIngredient(ingredient.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="expired">
                {loading ? (
                  <div className="space-y-3">
                    {Array(2).fill(0).map((_, index) => (
                      <div key={index} className="h-16 shimmer rounded-md"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIngredients
                      .filter(item => item.status === 'expired')
                      .map((ingredient) => (
                        <div 
                          key={ingredient.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start sm:items-center space-x-4 mb-2 sm:mb-0">
                            <div className="w-3 h-12 rounded-full bg-fridge-red"></div>
                            <div>
                              <h3 className="font-medium mb-1">{ingredient.name}</h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Tag className="h-3.5 w-3.5 mr-1" />
                                  {ingredient.category}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {formatDate(ingredient.expiryDate)}
                                </span>
                                <span className="flex items-center">
                                  <Info className="h-3.5 w-3.5 mr-1" />
                                  {ingredient.quantity} {ingredient.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between sm:justify-end items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-fridge-red" />
                              <span className="text-sm text-fridge-red font-medium">
                                Expired
                              </span>
                            </div>
                            {getStatusBadge(ingredient.status)}
                            <div className="flex space-x-1">
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-fridge-red"
                                onClick={() => deleteIngredient(ingredient.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IngredientsPage;
