
import { Layout } from "@/components/LayoutComponents";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthComponents";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  List,
  Store,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { 
  fetchUserShoppingLists, 
  createShoppingList, 
  fetchShoppingListItems, 
  addShoppingListItem,
  updateShoppingListItemStore,
  toggleShoppingListItemPurchased,
  fetchUserStores
} from "@/lib/supabaseHelpers";

interface ShoppingList {
  id: string;
  name: string;
  created_at: string;
}

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  store_id: string | null;
  stores: {
    id: string;
    name: string;
    address: string;
  } | null;
}

interface Store {
  id: string;
  name: string;
  address: string;
}

const ShoppingListPage = () => {
  const { getUser } = useAuth();
  const user = getUser();
  
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [newListDialog, setNewListDialog] = useState(false);
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [assignStoreDialog, setAssignStoreDialog] = useState(false);
  
  // Form states
  const [newListName, setNewListName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("item");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(null);
  
  // Fetch shopping lists and stores
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch shopping lists
        const lists = await fetchUserShoppingLists(user.id);
        setShoppingLists(lists);
        
        // Select first list if exists and none selected
        if (lists.length > 0 && !selectedList) {
          setSelectedList(lists[0]);
        }
        
        // Fetch stores
        const storesData = await fetchUserStores(user.id);
        setStores(storesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load shopping lists and stores");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  // Fetch items when selected list changes
  useEffect(() => {
    const loadItems = async () => {
      if (!selectedList) return;
      
      try {
        setLoading(true);
        const itemsData = await fetchShoppingListItems(selectedList.id);
        setItems(itemsData);
      } catch (error) {
        console.error("Error loading shopping list items:", error);
        toast.error("Failed to load shopping list items");
      } finally {
        setLoading(false);
      }
    };
    
    loadItems();
  }, [selectedList]);
  
  // Create new shopping list
  const handleCreateList = async () => {
    if (!user) {
      toast.error("You must be logged in to create a shopping list");
      return;
    }
    
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    try {
      const newList = await createShoppingList(newListName, user.id);
      setShoppingLists([...shoppingLists, newList]);
      setSelectedList(newList);
      setNewListName("");
      setNewListDialog(false);
      toast.success("Shopping list created");
    } catch (error) {
      console.error("Error creating shopping list:", error);
      toast.error("Failed to create shopping list");
    }
  };
  
  // Add new item to shopping list
  const handleAddItem = async () => {
    if (!selectedList) {
      toast.error("Please select a shopping list first");
      return;
    }
    
    if (!newItemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    
    try {
      const newItem = await addShoppingListItem(
        selectedList.id,
        newItemName,
        newItemQuantity,
        newItemUnit,
        selectedStore
      );
      
      // Reload items to get the full item with store info
      const updatedItems = await fetchShoppingListItems(selectedList.id);
      setItems(updatedItems);
      
      // Reset form
      setNewItemName("");
      setNewItemQuantity(1);
      setNewItemUnit("item");
      setSelectedStore(null);
      setNewItemDialog(false);
      toast.success("Item added to shopping list");
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };
  
  // Toggle item purchased status
  const toggleItemPurchased = async (item: ShoppingListItem) => {
    try {
      await toggleShoppingListItemPurchased(item.id, !item.purchased);
      
      // Update local state
      setItems(items.map(i => 
        i.id === item.id ? { ...i, purchased: !item.purchased } : i
      ));
      
      toast.success(item.purchased ? "Item marked as not purchased" : "Item marked as purchased");
    } catch (error) {
      console.error("Error updating item status:", error);
      toast.error("Failed to update item status");
    }
  };
  
  // Assign store to item
  const openAssignStoreDialog = (item: ShoppingListItem) => {
    setSelectedItem(item);
    setSelectedStore(item.store_id);
    setAssignStoreDialog(true);
  };
  
  const handleAssignStore = async () => {
    if (!selectedItem) return;
    
    try {
      await updateShoppingListItemStore(selectedItem.id, selectedStore);
      
      // Reload items to get updated store info
      if (selectedList) {
        const updatedItems = await fetchShoppingListItems(selectedList.id);
        setItems(updatedItems);
      }
      
      setAssignStoreDialog(false);
      toast.success("Store assigned to item");
    } catch (error) {
      console.error("Error assigning store:", error);
      toast.error("Failed to assign store");
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Lists</h1>
            <p className="text-gray-600 mt-1">Manage your shopping lists and link items to stores</p>
          </div>
          
          <Button onClick={() => setNewListDialog(true)} className="bg-fridge-blue hover:bg-fridge-blue-light">
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Shopping Lists Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <List className="h-5 w-5 mr-2" />
                Your Lists
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && shoppingLists.length === 0 ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 animate-pulse rounded"></div>
                ))
              ) : shoppingLists.length === 0 ? (
                <p className="text-sm text-gray-500">No shopping lists yet. Create one to get started.</p>
              ) : (
                shoppingLists.map(list => (
                  <Button
                    key={list.id}
                    variant={selectedList?.id === list.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedList(list)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {list.name}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Shopping List Items */}
          <Card className="md:col-span-3">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedList ? selectedList.name : "Select a list"}
                </CardTitle>
                <CardDescription>
                  {selectedList ? `${items.length} items` : "Choose a shopping list from the sidebar"}
                </CardDescription>
              </div>
              
              {selectedList && (
                <Button 
                  onClick={() => setNewItemDialog(true)}
                  className="bg-fridge-blue hover:bg-fridge-blue-light"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              )}
            </CardHeader>
            
            <CardContent>
              {!selectedList ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a shopping list or create a new one</p>
                </div>
              ) : loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded mb-2"></div>
                ))
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">This list is empty. Add some items!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow 
                        key={item.id} 
                        className={item.purchased ? "bg-gray-50" : ""}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={item.purchased} 
                            onCheckedChange={() => toggleItemPurchased(item)}
                          />
                        </TableCell>
                        <TableCell className={item.purchased ? "line-through text-gray-500" : ""}>
                          {item.name}
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>
                          {item.stores ? (
                            <Badge className="bg-fridge-blue">
                              <Store className="h-3 w-3 mr-1" />
                              {item.stores.name}
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAssignStoreDialog(item)}
                            >
                              <Store className="h-3 w-3 mr-1" />
                              Assign Store
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openAssignStoreDialog(item)}>
                                {item.stores ? "Change Store" : "Assign Store"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleItemPurchased(item)}>
                                {item.purchased ? "Mark as Unpurchased" : "Mark as Purchased"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* New Shopping List Dialog */}
      <Dialog open={newListDialog} onOpenChange={setNewListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shopping List</DialogTitle>
            <DialogDescription>
              Give your shopping list a name to get started.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                placeholder="Weekly Groceries"
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Item Dialog */}
      <Dialog open={newItemDialog} onOpenChange={setNewItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to List</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="Milk"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={e => setNewItemQuantity(Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="gallon"
                  value={newItemUnit}
                  onChange={e => setNewItemUnit(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store">Store (Optional)</Label>
              <Select value={selectedStore || ""} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No store</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Store Dialog */}
      <Dialog open={assignStoreDialog} onOpenChange={setAssignStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Store</DialogTitle>
            <DialogDescription>
              Select a store to assign to {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign-store">Store</Label>
              <Select value={selectedStore || ""} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No store</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignStoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignStore}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ShoppingListPage;
