
import React, { useState } from 'react';
import { Layout } from '@/components/LayoutComponents';
import { useAuth } from '@/components/AuthComponents';
import { FridgeStats } from '@/components/dashboard/FridgeStats';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useFridgeStats } from '@/hooks/useFridgeStats';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const { getUser } = useAuth();
  const user = getUser();
  
  // Track if this component has already initialized data
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Initialize data only once
  if (user?.id && !hasInitialized) {
    useDashboardData(user.id);
    setHasInitialized(true);
  }
  
  // Get fridge statistics
  const { fridgeStats, fridgeFullnessPercentage, loading } = useFridgeStats(user?.id);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fridge Status Card */}
          <FridgeStats 
            fridgeStats={fridgeStats} 
            fridgeFullnessPercentage={fridgeFullnessPercentage} 
          />
          
          {/* Welcome Card */}
          <WelcomeCard />
        </div>

        <div className="mt-6">
          {/* Quick Actions Card */}
          <QuickActions />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
