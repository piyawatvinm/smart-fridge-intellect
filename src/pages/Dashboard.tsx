
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { useAuth } from '@/components/AuthComponents';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { FridgeStats } from '@/components/dashboard/FridgeStats';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ChefSuggestion } from '@/components/dashboard/ChefSuggestion';
import { FridgeCategoryChart } from '@/components/dashboard/FridgeCategoryChart';
import { ExpiringIngredients } from '@/components/dashboard/ExpiringIngredients';
import { CookableRecipes } from '@/components/dashboard/CookableRecipes';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useFridgeStats } from '@/hooks/useFridgeStats';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Always call hooks at the top level - no conditions
  const { dataInitialized } = useDashboardData(user?.id);
  const { fridgeStats, fridgeFullnessPercentage, loading } = useFridgeStats(user?.id);
  
  // Use useEffect for any conditional logic
  useEffect(() => {
    if (user?.id && !hasInitialized && dataInitialized) {
      setHasInitialized(true);
      console.log('Dashboard data initialized');
    }
  }, [user?.id, hasInitialized, dataInitialized]);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DashboardCards 
            fridgeStats={fridgeStats} 
            fridgeFullnessPercentage={fridgeFullnessPercentage} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Left column */}
          <div className="col-span-2 space-y-6">
            <ExpiringIngredients />
            <ChefSuggestion />
            <CookableRecipes />
          </div>
          
          {/* Right column */}
          <div className="col-span-1 space-y-6">
            <FridgeCategoryChart fridgeStats={fridgeStats} />
            <RecentActivity />
            <QuickActions />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
