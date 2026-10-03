import React from 'react';

interface BannerAdProps {
  placement?: 'bottom' | 'feed' | 'in-feed' | string;
  unitId?: string;
  style?: any;
}

/**
 * Web mock for BannerAd.
 * Prevents importing native-only Google Mobile Ads codegen components on web.
 */
export const BannerAd: React.FC<BannerAdProps> = () => {
  return null;
};
