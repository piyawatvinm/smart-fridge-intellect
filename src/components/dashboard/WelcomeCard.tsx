
import React from 'react';

export const WelcomeCard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4">Welcome to ChefMate</h2>
      <p className="text-gray-600 mb-4">
        Your intelligent kitchen management system. Keep track of your ingredients,
        get recipe recommendations, and efficiently manage your grocery shopping.
      </p>
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Track ingredients and expiry dates</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Get personalized recipe recommendations</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span className="text-sm">Order missing ingredients quickly</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
          <span className="text-sm">Reduce food waste and save money</span>
        </div>
      </div>
    </div>
  );
};
