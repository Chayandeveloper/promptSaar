import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Theme } from '../constants/Theme';
import { Config } from '../constants/Config';
import { useAdConfig } from '../hooks/useAdConfig';

// Safely require react-native-google-mobile-ads so Expo Go / Web doesn't crash
let RNBannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const gma = require('react-native-google-mobile-ads');
  RNBannerAd = gma.BannerAd;
  BannerAdSize = gma.BannerAdSize;
  TestIds = gma.TestIds;
} catch (e) {
  RNBannerAd = null;
}

const GOOGLE_TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

interface BannerAdProps {
  placement?: 'bottom' | 'feed' | 'in-feed' | string;
  unitId?: string;
  style?: any;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  placement = 'bottom',
  unitId,
  style,
}) => {
  const { data: adConfig } = useAdConfig();
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check admin switches
  if (adConfig) {
    if (!adConfig.ads_enabled) {
      return null;
    }
    const isFeed = placement === 'feed' || placement === 'in-feed';
    if (isFeed && !adConfig.feed_ad_enabled) {
      return null;
    }
    if (!isFeed && !adConfig.banner_ads_enabled) {
      return null;
    }
  }

  // If both live ID and fallback failed, cleanly hide container
  if (hasError) {
    return null;
  }

  const isFeed = placement === 'feed' || placement === 'in-feed';
  const configuredId =
    unitId ||
    (isFeed ? adConfig?.feed_ad_unit_id : adConfig?.banner_ad_unit_id) ||
    adConfig?.banner_ad_unit_id ||
    Config.ADMOB.BANNER_ID ||
    'ca-app-pub-9010050634863664/4429647201';

  // If the live AdMob ID returns NO_FILL or error (e.g. AdMob status is still "Not applicable"),
  // automatically fall back to Google Test Banner ID so the ad space displays and works!
  const adUnitId = useFallback
    ? (TestIds?.BANNER || GOOGLE_TEST_BANNER_ID)
    : configuredId;

  // In native Android/iOS APK where Google Mobile Ads SDK is installed
  if (Platform.OS !== 'web' && RNBannerAd && BannerAdSize) {
    const selectedSize = isFeed
      ? BannerAdSize.BANNER
      : BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

    return (
      <View style={[styles.container, style]}>
        <RNBannerAd
          key={adUnitId}
          unitId={adUnitId}
          size={selectedSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error: any) => {
            console.warn(`[AdMob Banner - ${placement}] Failed to load (${adUnitId}):`, error?.message || error);
            if (!useFallback && configuredId !== GOOGLE_TEST_BANNER_ID) {
              setUseFallback(true);
            } else {
              setHasError(true);
            }
          }}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
    minHeight: 50,
  },
});
