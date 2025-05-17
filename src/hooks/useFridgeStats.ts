
import { useState, useEffect } from 'react';
import { fetchUserIngredients } from '@/lib/supabaseHelpers';

export interface FridgeStatsData {
  totalIngredients: number;
  expiringSoon: number;
  expired: number;
  categories: Record<string, number>;
}

export const useFridgeStats = (userId: string | undefined) => {
  const [fridgeStats, setFridgeStats] = useState<FridgeStatsData>({
    totalIngredients: 0,
    expiringSoon: 0,
    expired: 0,
    categories: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadFridgeStats = async () => {
      setLoading(true);
      try {
        const ingredients = await fetchUserIngredients(userId);
        
        // Calculate stats
        const now = new Date();
        const categoryCounts: Record<string, number> = {};
        let expiringSoonCount = 0;
        let expiredCount = 0;

        ingredients.forEach(ingredient => {
          // Count by category
          if (ingredient.category) {
            categoryCounts[ingredient.category] = (categoryCounts[ingredient.category] || 0) + 1;
          }

          // Check expiration
          if (ingredient.expiry_date) {
            const expiryDate = new Date(ingredient.expiry_date);
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
              expiredCount++;
            } else if (daysUntilExpiry <= 3) {
              expiringSoonCount++;
            }
          }
        });

        setFridgeStats({
          totalIngredients: ingredients.length,
          expiringSoon: expiringSoonCount,
          expired: expiredCount,
          categories: categoryCounts
        });

      } catch (error) {
        console.error('Error loading fridge stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFridgeStats();
  }, [userId]);

  // Calculate fridge fullness (example calculation)
  const fridgeFullnessPercentage = Math.min(100, Math.max(0, 
    fridgeStats.totalIngredients > 0 ? Math.round((fridgeStats.totalIngredients / 50) * 100) : 0
  ));

  return {
    fridgeStats,
    fridgeFullnessPercentage,
    loading
  };
};
