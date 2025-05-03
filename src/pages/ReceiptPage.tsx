
import { Layout } from "@/components/LayoutComponents";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Check, X, Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthComponents";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Store {
  id: string;
  name: string;
  address: string | null;
  user_id: string;
  created_at?: string;
}

interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

const ReceiptPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ReceiptItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [newStoreName, setNewStoreName] = useState<string>("");
  const [showNewStoreInput, setShowNewStoreInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { getUser } = useAuth();
  const user = getUser();

  // Load user's stores
  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      
      try {
        // Using a properly typed from method for stores table
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          // Convert data to Store type
          const storesData: Store[] = data.map(store => ({
            id: store.id,
            name: store.name,
            address: store.address || null,
            user_id: store.user_id
          }));
          setStores(storesData);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };
    
    fetchStores();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      setIsProcessed(false);
      setExtractedItems([]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
      
      setIsProcessed(false);
      setExtractedItems([]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processReceipt = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Simulate receipt processing with OCR
    setTimeout(() => {
      // Mock OCR result
      const mockExtractedItems = [
        { name: "Milk", quantity: 1, unit: "carton", price: 2.99 },
        { name: "Eggs", quantity: 12, unit: "piece", price: 3.49 },
        { name: "Bread", quantity: 1, unit: "loaf", price: 2.29 },
        { name: "Cheese", quantity: 1, unit: "pack", price: 4.99 },
        { name: "Tomatoes", quantity: 4, unit: "piece", price: 2.79 },
      ];
      
      setExtractedItems(mockExtractedItems);
      setIsProcessing(false);
      setIsProcessed(true);
      toast.success("Receipt processed successfully!");
    }, 2000);
  };

  const saveNewStore = async () => {
    try {
      if (!newStoreName || !user) return;
      
      // Create a new store with the minimum required fields
      const { data, error } = await supabase
        .from('stores')
        .insert([
          { 
            name: newStoreName, 
            user_id: user.id,
            address: null // Provide a default value for address
          }
        ])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Create a proper Store object
        const newStore: Store = {
          id: data[0].id,
          name: data[0].name,
          address: data[0].address || null,
          user_id: data[0].user_id,
          created_at: data[0].created_at
        };
        
        setStores([...stores, newStore]);
        setSelectedStore(newStore.id);
        setShowNewStoreInput(false);
        setNewStoreName("");
        toast.success("New store added!");
      }
    } catch (error) {
      console.error('Error adding store:', error);
      toast.error("Failed to add new store");
    }
  };

  const saveToIngredients = async () => {
    try {
      if (extractedItems.length === 0 || !user) {
        toast.error("No items to save or you must be logged in");
        return;
      }
      
      // First, create a receipt record
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert([
          {
            store_id: selectedStore || null,
            total_amount: extractedItems.reduce((sum, item) => sum + item.price, 0),
            user_id: user.id,
            receipt_date: new Date().toISOString().split('T')[0]  // Add required receipt_date
          }
        ])
        .select();
      
      if (receiptError) throw receiptError;
      
      if (receiptData && receiptData.length > 0) {
        const receiptId = receiptData[0].id;
        
        // Then, create receipt items
        const receiptItems = extractedItems.map(item => ({
          receipt_id: receiptId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price
        }));
        
        const { error: itemsError } = await supabase
          .from('receipt_items')
          .insert(receiptItems);
        
        if (itemsError) throw itemsError;
        
        // Finally, add items to ingredients
        const ingredients = extractedItems.map(item => {
          // Calculate expiry date (example: 7 days from now)
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7);
          
          return {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            expiry_date: expiryDate.toISOString().split('T')[0],
            category: getCategoryForItem(item.name),
            user_id: user.id
          };
        });
        
        const { error: ingredientsError } = await supabase
          .from('ingredients')
          .insert(ingredients);
        
        if (ingredientsError) throw ingredientsError;
        
        toast.success("Items added to your ingredients list!");
        setTimeout(() => {
          navigate('/ingredients');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving to ingredients:', error);
      toast.error("Failed to save items");
    }
  };

  // Helper function to determine a likely category based on item name
  const getCategoryForItem = (name: string): string => {
    name = name.toLowerCase();
    
    if (name.includes('milk') || name.includes('yogurt') || name.includes('cheese')) {
      return 'Dairy';
    } else if (name.includes('bread') || name.includes('bun') || name.includes('cake')) {
      return 'Bakery';
    } else if (name.includes('apple') || name.includes('banana') || name.includes('orange') ||
              name.includes('fruit')) {
      return 'Fruits';
    } else if (name.includes('tomato') || name.includes('potato') || name.includes('onion') ||
              name.includes('carrot') || name.includes('lettuce')) {
      return 'Vegetables';
    } else if (name.includes('beef') || name.includes('chicken') || name.includes('pork') ||
              name.includes('steak')) {
      return 'Meat';
    } else {
      return 'Other';
    }
  };

  const cancelProcessing = () => {
    setFile(null);
    setPreview(null);
    setIsProcessed(false);
    setExtractedItems([]);
  };

  // Manual entry state
  const [manualItem, setManualItem] = useState({
    name: '',
    quantity: 1,
    unit: 'piece',
    expiryDate: ''
  });

  const handleManualItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setManualItem({
      ...manualItem,
      [id]: value
    });
  };

  const handleUnitChange = (value: string) => {
    setManualItem({
      ...manualItem,
      unit: value
    });
  };

  const addManualItem = async () => {
    try {
      if (!manualItem.name || !manualItem.expiryDate || !user) {
        toast.error("Please fill all fields");
        return;
      }

      const { error } = await supabase
        .from('ingredients')
        .insert([
          {
            name: manualItem.name,
            quantity: manualItem.quantity,
            unit: manualItem.unit,
            expiry_date: manualItem.expiryDate,
            category: getCategoryForItem(manualItem.name),
            user_id: user.id
          }
        ]);

      if (error) throw error;

      toast.success("Item added successfully!");
      setManualItem({
        name: '',
        quantity: 1,
        unit: 'piece',
        expiryDate: ''
      });

    } catch (error) {
      console.error('Error adding manual item:', error);
      toast.error("Failed to add item");
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Receipt</h1>
          <p className="text-gray-600 mt-1">Scan or upload your grocery receipt to add items to your inventory</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Receipt</CardTitle>
              <CardDescription>
                Upload a photo of your receipt to automatically add items to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center h-64 ${
                  !preview ? "border-gray-300 bg-gray-50" : "border-transparent"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={preview}
                      alt="Receipt preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={cancelProcessing}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    >
                      <X className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop your receipt image here
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      or click to browse for a file
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileInput}
                    >
                      Browse Files
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>
              
              {isProcessed && (
                <div className="mt-4">
                  <Label htmlFor="store">Select Store</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {showNewStoreInput ? (
                      <div className="flex-1 flex gap-2">
                        <Input 
                          placeholder="Enter new store name" 
                          value={newStoreName} 
                          onChange={(e) => setNewStoreName(e.target.value)} 
                        />
                        <Button onClick={saveNewStore}>Save</Button>
                        <Button variant="outline" onClick={() => setShowNewStoreInput(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setShowNewStoreInput(true)}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={cancelProcessing}
                disabled={!file || isProcessing}
              >
                Cancel
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={triggerFileInput}
                  variant="outline"
                  disabled={isProcessing}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  New Photo
                </Button>
                <Button
                  onClick={processReceipt}
                  disabled={!file || isProcessing || isProcessed}
                  className="bg-fridge-blue hover:bg-fridge-blue-light"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isProcessed ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Processed
                    </>
                  ) : (
                    "Process Receipt"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Extracted Items</CardTitle>
              <CardDescription>
                Review the items extracted from your receipt
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="h-64 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-fridge-blue animate-spin mb-4" />
                  <p className="text-gray-600">Analyzing your receipt...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
                </div>
              ) : extractedItems.length > 0 ? (
                <div className="space-y-4">
                  {extractedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} {item.unit}</p>
                      </div>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-600">No items have been extracted yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Upload and process a receipt to see extracted items
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={saveToIngredients}
                disabled={extractedItems.length === 0 || isProcessing || !user}
                className="bg-fridge-blue hover:bg-fridge-blue-light"
              >
                <Check className="h-4 w-4 mr-2" />
                Add to Ingredients
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription>
              You can also add items manually if you don't have a receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addManualItem(); }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Milk" 
                    value={manualItem.name}
                    onChange={handleManualItemChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="1" 
                    value={manualItem.quantity}
                    onChange={handleManualItemChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={manualItem.unit} onValueChange={handleUnitChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">Gram</SelectItem>
                      <SelectItem value="l">Liter</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="carton">Carton</SelectItem>
                      <SelectItem value="bottle">Bottle</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input 
                  id="expiryDate" 
                  type="date" 
                  value={manualItem.expiryDate}
                  onChange={handleManualItemChange}
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-fridge-blue hover:bg-fridge-blue-light"
                disabled={!user}
              >
                Add Item
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReceiptPage;
