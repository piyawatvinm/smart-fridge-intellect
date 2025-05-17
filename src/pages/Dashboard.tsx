
import React, { useState, useEffect } from 'react';
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
