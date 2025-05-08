
import React from 'react';

interface RecommendationNoticeProps {
  isVisible: boolean;
}

const RecommendationNotice: React.FC<RecommendationNoticeProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
      <p className="text-blue-800">
        Browse products to find the ingredients you need for your recipe.
        Add them to your cart and confirm your order.
      </p>
    </div>
  );
};

export default RecommendationNotice;
