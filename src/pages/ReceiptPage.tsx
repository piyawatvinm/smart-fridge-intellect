
import { Layout } from "@/components/LayoutComponents";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthComponents";
import { getCategoryForItem } from "@/lib/supabaseHelpers";
import { Product, GeneratedItem, ManualItem } from "@/types/receipt";
import { ImageUploader } from "@/components/receipt/ImageUploader";
import { GeneratedItemsTable } from "@/components/receipt/GeneratedItemsTable";
import { ManualItemForm } from "@/components/receipt/ManualItemForm";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowRight } from "lucide-react";

const ReceiptPage = () => {
  // State for receipt upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const user = getUser();

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error("Failed to load products");
      }
    };
    
    fetchProducts();
  }, []);

  // Handle file upload
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
      
      // Clear previous items when a new image is uploaded
      setGeneratedItems([]);
    }
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
      
      // Clear previous items when a new image is uploaded
      setGeneratedItems([]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setGeneratedItems([]);
  };

  // Generate random items from products
  const generateItems = () => {
    if (products.length === 0) {
      toast.error("No products available to generate items");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      try {
        // Generate random number of items (3-5)
        const numItems = Math.floor(Math.random() * 3) + 3;
        
        // Shuffle products and take the first numItems
        const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
        const selectedProducts = shuffledProducts.slice(0, numItems);
        
        // Generate items from selected products
        const items = selectedProducts.map(product => ({
          id: product.id,
          name: product.name,
          quantity: Math.floor(Math.random() * 5) + 1, // Random quantity 1-5
          unit: product.unit || getRandomUnit(),
          isEdited: false
        }));
        
        setGeneratedItems(items);
        toast.success(`Generated ${items.length} items`);
      } catch (error) {
        console.error('Error generating items:', error);
        toast.error("Failed to generate items");
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const getRandomUnit = () => {
    const units = ['pcs', 'g', 'ml', 'kg', 'l'];
    return units[Math.floor(Math.random() * units.length)];
  };

  // Handle item update
  const updateGeneratedItem = (id: string, field: string, value: any) => {
    setGeneratedItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, [field]: value, isEdited: true } 
          : item
      )
    );
  };

  // Handle adding a manual item
  const addManualItem = (item: ManualItem) => {
    setManualItems([...manualItems, item]);
    toast.success("Manual item added");
  };

  // Remove manual item
  const removeManualItem = (index: number) => {
    setManualItems(items => items.filter((_, i) => i !== index));
  };

  // Save all items to ingredients
  const saveToIngredients = async () => {
    if (!user) {
      toast.error("You must be logged in to save ingredients");
      return;
    }

    if (generatedItems.length === 0 && manualItems.length === 0) {
      toast.error("No items to save");
      return;
    }

    setIsSaving(true);

    try {
      // Map generated items to the format expected by the ingredients table
      const generatedIngredients = generatedItems.map(item => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 14); // Default 14 days expiry
        
        return {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          expiry_date: expiryDate.toISOString().split('T')[0],
          category: getCategoryForItem(item.name),
          user_id: user.id,
          product_id: item.id
        };
      });

      // Map manual items to the same format
      const mappedManualItems = manualItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: item.expiryDate,
        category: getCategoryForItem(item.name),
        user_id: user.id
      }));

      // Combine both arrays
      const allIngredients = [...generatedIngredients, ...mappedManualItems];

      // Insert into Supabase
      const { error } = await supabase
        .from('ingredients')
        .insert(allIngredients);

      if (error) throw error;

      toast.success("Items saved to ingredients");
      
      // Add a short delay before navigating
      setTimeout(() => {
        setIsSaving(false);
        navigate('/ingredients');
      }, 500);
    } catch (error) {
      console.error('Error saving ingredients:', error);
      toast.error("Failed to save ingredients");
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Food Image</h1>
          <p className="text-gray-600 mt-1">Upload any food image to generate ingredients for your inventory</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageUploader
            file={file}
            preview={preview}
            isLoading={isLoading}
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onReset={resetUpload}
            onGenerate={generateItems}
          />
          
          <GeneratedItemsTable
            generatedItems={generatedItems}
            isLoading={isLoading}
            onUpdateItem={updateGeneratedItem}
          />
        </div>
        
        <ManualItemForm 
          onAddItem={addManualItem}
          manualItems={manualItems}
          onRemoveItem={removeManualItem}
        />
        
        <div className="flex justify-end">
          <Button
            onClick={saveToIngredients}
            disabled={generatedItems.length === 0 && manualItems.length === 0 || isSaving || !user}
            className="bg-fridge-blue hover:bg-fridge-blue-light"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save to Ingredients
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ReceiptPage;
