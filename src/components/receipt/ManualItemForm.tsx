
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { ManualItem } from "@/types/receipt";

interface ManualItemFormProps {
  onAddItem: (item: ManualItem) => void;
  manualItems: ManualItem[];
  onRemoveItem: (index: number) => void;
}

export const ManualItemForm: React.FC<ManualItemFormProps> = ({
  onAddItem,
  manualItems,
  onRemoveItem,
}) => {
  const [item, setItem] = useState<ManualItem>({
    name: '',
    quantity: 1,
    unit: 'pcs',
    expiryDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setItem({
      ...item,
      [id]: id === 'quantity' ? Number(value) : value
    });
  };

  const handleUnitChange = (value: string) => {
    setItem({
      ...item,
      unit: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.name) return;
    
    onAddItem(item);
    
    // Reset form
    setItem({
      name: '',
      quantity: 1,
      unit: 'pcs',
      expiryDate: new Date().toISOString().split('T')[0]
    });
  };

  const units = ["pcs", "g", "ml", "kg", "l", "oz", "lb", "cup", "tbsp", "tsp", "pack", "bottle", "can", "box"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Manual Items</CardTitle>
        <CardDescription>
          Add items manually to your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Apples" 
                value={item.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="1" 
                value={item.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={item.unit} onValueChange={handleUnitChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input 
                id="expiryDate" 
                type="date" 
                value={item.expiryDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </form>

        {manualItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Manual Items</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.expiryDate}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
