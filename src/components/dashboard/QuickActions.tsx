
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions: React.FC = () => {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/ingredients"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="/lovable-uploads/7bdceca8-ab1b-4b15-9380-3f882c3dcd0a.png"
              alt="Ingredients"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-sm font-medium">Manage Ingredients</span>
          </a>
          
          <a
            href="/recommendations"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="/lovable-uploads/03b0a8ee-b8be-4393-9dfb-da609f65d624.png"
              alt="Recommendations"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-sm font-medium">Recipe Recommendations</span>
          </a>
          
          <a
            href="/products"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="/lovable-uploads/9cadcb73-4e65-49e3-ac69-e45f3f42bc1f.png"
              alt="Products"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-sm font-medium">Browse Products</span>
          </a>
          
          <a
            href="/my-orders"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="/lovable-uploads/20043334-4b13-492a-86ca-3d31d67ca0b3.png"
              alt="Orders"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-sm font-medium">My Orders</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
