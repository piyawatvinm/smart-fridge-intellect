
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface FridgeStatsProps {
  fridgeStats: {
    totalIngredients: number;
    expiringSoon: number;
    expired: number;
    categories: Record<string, number>;
  };
  fridgeFullnessPercentage: number;
}

export const FridgeStats: React.FC<FridgeStatsProps> = ({ fridgeStats, fridgeFullnessPercentage }) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Fridge Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Fridge Fullness</span>
              <span className="text-sm text-gray-500">{fridgeFullnessPercentage}%</span>
            </div>
            <Progress value={fridgeFullnessPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Card className="bg-gray-50">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Items</p>
                  <p className="text-xl font-bold">{fridgeStats.totalIngredients}</p>
                </div>
                <Check className="h-5 w-5 text-green-500" />
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Expiring Soon</p>
                  <p className="text-xl font-bold">{fridgeStats.expiringSoon}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </CardContent>
            </Card>
            
            <Card className="bg-red-50">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Expired</p>
                  <p className="text-xl font-bold">{fridgeStats.expired}</p>
                </div>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </CardContent>
            </Card>
          </div>

          {fridgeStats.expired > 0 && (
            <div className="bg-red-50 p-3 mt-3 rounded-md border border-red-200">
              <p className="text-sm text-red-700 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                You have {fridgeStats.expired} expired ingredients that should be removed
              </p>
              <button 
                className="text-xs text-red-700 underline mt-1"
                onClick={() => navigate('/ingredients')}
              >
                Go to ingredients
              </button>
            </div>
          )}

          {fridgeStats.expiringSoon > 0 && fridgeStats.expired === 0 && (
            <div className="bg-amber-50 p-3 mt-3 rounded-md border border-amber-200">
              <p className="text-sm text-amber-700 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {fridgeStats.expiringSoon} ingredients are expiring in the next 3 days
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
