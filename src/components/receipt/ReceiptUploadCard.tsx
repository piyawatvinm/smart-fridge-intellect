
import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X, Loader2, PlusCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { Store } from "@/types/receipt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReceiptUploadCardProps {
  file: File | null;
  preview: string | null;
  isProcessing: boolean;
  isProcessed: boolean;
  stores: Store[];
  selectedStore: string;
  showNewStoreInput: boolean;
  newStoreName: string;
  newStoreAddress: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onTriggerFileInput: () => void;
  onCancelProcessing: () => void;
  onProcessReceipt: () => void;
  onSetSelectedStore: (value: string) => void;
  onSetShowNewStoreInput: (show: boolean) => void;
  onSetNewStoreName: (name: string) => void;
  onSetNewStoreAddress: (address: string) => void;
  onSaveNewStore: () => void;
}

export const ReceiptUploadCard: React.FC<ReceiptUploadCardProps> = ({
  file,
  preview,
  isProcessing,
  isProcessed,
  stores,
  selectedStore,
  showNewStoreInput,
  newStoreName,
  newStoreAddress,
  onFileChange,
  onDragOver,
  onDrop,
  onTriggerFileInput,
  onCancelProcessing,
  onProcessReceipt,
  onSetSelectedStore,
  onSetShowNewStoreInput,
  onSetNewStoreName,
  onSetNewStoreAddress,
  onSaveNewStore,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    onTriggerFileInput();
  };

  return (
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
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={onCancelProcessing}
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
                onChange={onFileChange}
              />
            </>
          )}
        </div>
        
        {isProcessed && (
          <div className="mt-4">
            <Label htmlFor="store">Select Store</Label>
            <div className="flex items-center gap-2 mt-2">
              {showNewStoreInput ? (
                <div className="flex-1 flex flex-col gap-2">
                  <Input 
                    placeholder="Enter store name" 
                    value={newStoreName} 
                    onChange={(e) => onSetNewStoreName(e.target.value)} 
                  />
                  <Input 
                    placeholder="Enter store address" 
                    value={newStoreAddress} 
                    onChange={(e) => onSetNewStoreAddress(e.target.value)} 
                  />
                  <div className="flex gap-2">
                    <Button onClick={onSaveNewStore}>Save</Button>
                    <Button variant="outline" onClick={() => onSetShowNewStoreInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Select value={selectedStore} onValueChange={onSetSelectedStore}>
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
                    onClick={() => onSetShowNewStoreInput(true)}
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
          onClick={onCancelProcessing}
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
            onClick={onProcessReceipt}
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
  );
};
