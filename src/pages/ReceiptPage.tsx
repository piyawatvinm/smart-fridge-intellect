
import { Layout } from "@/components/LayoutComponents";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthComponents";
import { getCategoryForItem } from "@/lib/supabaseHelpers";
import { Store, ReceiptItem, ManualItem } from "@/types/receipt";
import { ReceiptUploadCard } from "@/components/receipt/ReceiptUploadCard";
import { ExtractedItemsCard } from "@/components/receipt/ExtractedItemsCard";
import { ManualEntryCard } from "@/components/receipt/ManualEntryCard";

const ReceiptPage = () => {
  // State for receipt upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ReceiptItem[]>([]);
  
  // State for store selection
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [newStoreName, setNewStoreName] = useState<string>("");
  const [newStoreAddress, setNewStoreAddress] = useState<string>("");
  const [showNewStoreInput, setShowNewStoreInput] = useState(false);
  
  // State for saving process
  const [isSavingIngredients, setSavingIngredients] = useState(false);
  
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const user = getUser();

  // Load user's stores
  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          setStores(data as Store[]);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };
    
    fetchStores();
  }, [user]);

  // File handling functions
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
    // This function is passed to the component
  };

  // Receipt handling functions
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

  const cancelProcessing = () => {
    setFile(null);
    setPreview(null);
    setIsProcessed(false);
    setExtractedItems([]);
  };

  // Store handling functions
  const saveNewStore = async () => {
    try {
      if (!newStoreName || !newStoreAddress || !user) {
        toast.error("Please provide both store name and address");
        return;
      }
      
      // Create a new store
      const { data, error } = await supabase
        .from('stores')
        .insert([
          { 
            name: newStoreName, 
            address: newStoreAddress,
            user_id: user.id,
          }
        ])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add new store to list
        setStores([...stores, data[0] as Store]);
        setSelectedStore(data[0].id);
        setShowNewStoreInput(false);
        setNewStoreName("");
        setNewStoreAddress("");
        toast.success("New store added!");
      }
    } catch (error) {
      console.error('Error adding store:', error);
      toast.error("Failed to add new store");
    }
  };

  // Save to ingredients functions
  const saveToIngredients = async () => {
    try {
      if (extractedItems.length === 0 || !user) {
        toast.error("No items to save or you must be logged in");
        return;
      }
      
      setSavingIngredients(true);
      
      // First, create a receipt record
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert([
          {
            store_id: selectedStore || null,
            total_amount: extractedItems.reduce((sum, item) => sum + item.price, 0),
            user_id: user.id,
            purchase_date: new Date().toISOString()
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
        
        // Use setTimeout with a promise to ensure we complete before navigating
        await new Promise(resolve => {
          setTimeout(() => {
            setSavingIngredients(false);
            resolve(true);
            navigate('/ingredients');
          }, 1500);
        });
      }
    } catch (error) {
      console.error('Error saving to ingredients:', error);
      toast.error("Failed to save items");
      setSavingIngredients(false);
    }
  };

  // Manual entry handling
  const addManualItem = async (item: ManualItem) => {
    try {
      if (!item.name || !item.expiryDate || !user) {
        toast.error("Please fill all fields");
        return;
      }

      const { error } = await supabase
        .from('ingredients')
        .insert([
          {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            expiry_date: item.expiryDate,
            category: getCategoryForItem(item.name),
            user_id: user.id
          }
        ]);

      if (error) throw error;

      toast.success("Item added successfully!");
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
          <ReceiptUploadCard
            file={file}
            preview={preview}
            isProcessing={isProcessing}
            isProcessed={isProcessed}
            stores={stores}
            selectedStore={selectedStore}
            showNewStoreInput={showNewStoreInput}
            newStoreName={newStoreName}
            newStoreAddress={newStoreAddress}
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTriggerFileInput={triggerFileInput}
            onCancelProcessing={cancelProcessing}
            onProcessReceipt={processReceipt}
            onSetSelectedStore={setSelectedStore}
            onSetShowNewStoreInput={setShowNewStoreInput}
            onSetNewStoreName={setNewStoreName}
            onSetNewStoreAddress={setNewStoreAddress}
            onSaveNewStore={saveNewStore}
          />
          
          <ExtractedItemsCard
            isProcessing={isProcessing}
            extractedItems={extractedItems}
            isSavingIngredients={isSavingIngredients}
            user={user}
            onSaveToIngredients={saveToIngredients}
          />
        </div>
        
        <ManualEntryCard 
          user={user}
          onAddManualItem={addManualItem}
        />
      </div>
    </Layout>
  );
};

export default ReceiptPage;
