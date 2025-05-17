
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface FridgeCategoryChartProps {
  fridgeStats: {
    totalIngredients: number;
    expiringSoon: number;
    expired: number;
    categories: Record<string, number>;
  };
}

export const FridgeCategoryChart: React.FC<FridgeCategoryChartProps> = ({ fridgeStats }) => {
  // Define colors for different categories
  const COLORS = {
    'Vegetables': '#4ade80', // green
    'Fruits': '#fb923c',     // orange
    'Meat': '#f87171',       // red
    'Dairy': '#60a5fa',      // blue
    'Grains': '#fcd34d',     // yellow
    'Herbs': '#a3e635',      // lime
    'Beverages': '#a78bfa',  // purple
    'Condiments': '#e879f9', // pink
    'Snacks': '#fb7185',     // rose
    'Seafood': '#22d3ee',    // cyan
    'Other': '#94a3b8',      // gray
  };

  const DEFAULT_COLOR = '#94a3b8'; // Default gray for unknown categories

  // Transform categories data into chart format
  const categoryData = Object.entries(fridgeStats.categories || {})
    .map(([name, value]) => ({
      name,
      value,
      color: (COLORS as Record<string, string>)[name] || DEFAULT_COLOR
    }))
    .filter(item => item.value > 0);

  // If no categories, show a placeholder
  if (categoryData.length === 0) {
    categoryData.push({ name: 'No items', value: 1, color: '#94a3b8' });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Food Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} items`, 'Count']}
                contentStyle={{ borderRadius: '0.375rem', border: '1px solid #e2e8f0' }} 
              />
              <Legend 
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
