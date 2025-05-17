
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManualEntryCardProps {
  user: any;
  onAddManualItem: (item: ManualItem) => Promise<void>;
}

interface ManualItem {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
}

export const ManualEntryCard: React.FC<ManualEntryCardProps> = ({
  user,
  onAddManualItem,
}) => {
  const [manualItem, setManualItem] = useState<ManualItem>({
    name: '',
    quantity: 1,
    unit: 'piece',
    expiryDate: ''
  });

  const handleManualItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setManualItem({
      ...manualItem,
      [id]: id === 'quantity' ? Number(value) : value
    });
  };

  const handleUnitChange = (value: string) => {
    setManualItem({
      ...manualItem,
      unit: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddManualItem(manualItem);
    setManualItem({
      name: '',
      quantity: 1,
      unit: 'piece',
      expiryDate: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Entry</CardTitle>
        <CardDescription>
          You can also add items manually if you don't have a receipt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
  );
};
