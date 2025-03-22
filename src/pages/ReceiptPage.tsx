
import { Layout } from "@/components/LayoutComponents";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Check, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ReceiptPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [extractedItems, setExtractedItems] = useState<Array<{name: string; quantity: number; price: number}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
        { name: "Milk", quantity: 1, price: 2.99 },
        { name: "Eggs", quantity: 12, price: 3.49 },
        { name: "Bread", quantity: 1, price: 2.29 },
        { name: "Cheese", quantity: 1, price: 4.99 },
        { name: "Tomatoes", quantity: 4, price: 2.79 },
      ];
      
      setExtractedItems(mockExtractedItems);
      setIsProcessing(false);
      setIsProcessed(true);
      toast.success("Receipt processed successfully!");
    }, 2000);
  };

  const saveToIngredients = () => {
    // In a real app, this would save to a database
    toast.success("Items added to your ingredients list!");
    setTimeout(() => {
      navigate('/ingredients');
    }, 1500);
  };

  const cancelProcessing = () => {
    setFile(null);
    setPreview(null);
    setIsProcessed(false);
    setExtractedItems([]);
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
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
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
                disabled={extractedItems.length === 0 || isProcessing}
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
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input id="item-name" placeholder="e.g., Milk" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" defaultValue="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input id="expiry-date" type="date" />
                </div>
              </div>
              
              <Button type="button" className="bg-fridge-blue hover:bg-fridge-blue-light">
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
