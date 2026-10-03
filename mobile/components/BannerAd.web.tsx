import React from 'react';

interface BannerAdProps {
  placement?: string;
}

/**
 * Web mock for BannerAd.
 * Prevents importing native-only Google Mobile Ads codegen components on web.
 */
export const BannerAd: React.FC<BannerAdProps> = () => {
  return null;
};
