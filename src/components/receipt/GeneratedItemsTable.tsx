
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { GeneratedItem } from "@/types/receipt";

interface GeneratedItemsTableProps {
  generatedItems: GeneratedItem[];
  isLoading: boolean;
  onUpdateItem: (id: string, field: string, value: any) => void;
}

export const GeneratedItemsTable: React.FC<GeneratedItemsTableProps> = ({
  generatedItems,
  isLoading,
  onUpdateItem,
}) => {
  const units = ["pcs", "g", "ml", "kg", "l", "oz", "lb", "cup", "tbsp", "tsp", "pack", "bottle", "can", "box"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Items</CardTitle>
        <CardDescription>
          These items were generated from your image
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-fridge-blue animate-spin mb-4" />
            <p className="text-gray-600">Generating items...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
          </div>
        ) : generatedItems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generatedItems.map((item) => (
                  <TableRow key={item.id} className={item.isEdited ? "bg-blue-50" : ""}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="w-24 h-9"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.unit} 
                        onValueChange={(value) => onUpdateItem(item.id, "unit", value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <p className="text-gray-600">No items generated yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Upload an image and click "Generate Items" to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
