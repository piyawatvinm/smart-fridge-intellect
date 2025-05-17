
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { ReceiptItem } from "@/types/receipt";

interface ExtractedItemsCardProps {
  isProcessing: boolean;
  extractedItems: ReceiptItem[];
  isSavingIngredients: boolean;
  user: any;
  onSaveToIngredients: () => void;
}

export const ExtractedItemsCard: React.FC<ExtractedItemsCardProps> = ({
  isProcessing,
  extractedItems,
  isSavingIngredients,
  user,
  onSaveToIngredients,
}) => {
  return (
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
          onClick={onSaveToIngredients}
          disabled={extractedItems.length === 0 || isProcessing || isSavingIngredients || !user}
          className="bg-fridge-blue hover:bg-fridge-blue-light"
        >
          {isSavingIngredients ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Add to Ingredients
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
