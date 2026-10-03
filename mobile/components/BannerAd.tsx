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

interface BannerAdProps {
  placement?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ placement = 'feed' }) => {
  const { data: adConfig } = useAdConfig();
  const [hasError, setHasError] = useState(false);

  // If ads are disabled in admin settings
  if (adConfig && (!adConfig.ads_enabled || !adConfig.banner_ads_enabled)) {
    return null;
  }

  // If the ad failed to load, cleanly hide container
  if (hasError) {
    return null;
  }

  // Priority: Backend remote config -> Config.ts -> TestIds.BANNER -> Default Google Test Banner ID
  const adUnitId =
    adConfig?.banner_ad_unit_id ||
    Config.ADMOB.BANNER_ID ||
    'ca-app-pub-9010050634863664/4429647201';

  // In native Android/iOS APK where Google Mobile Ads SDK is installed
  if (Platform.OS !== 'web' && RNBannerAd && BannerAdSize) {
    return (
      <View style={styles.container}>
        <RNBannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error: any) => {
            console.warn(`[AdMob Banner - ${placement}] Failed to load:`, error?.message || error);
            setHasError(true);
          }}
        />
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
    minHeight: 50,
  },
});

