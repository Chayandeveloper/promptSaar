import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
  placement?: 'bottom' | 'feed' | 'in-feed' | 'home_top' | string;
  size?: 'banner' | 'large_banner' | 'medium_rectangle' | 'adaptive';
  unitId?: string;
  style?: any;
}

export const BannerAd: React.FC<BannerAdProps> = ({
  placement = 'bottom',
  size,
  unitId,
  style,
}) => {
  const { data: adConfig } = useAdConfig();
  const [useFallback, setUseFallback] = useState(false);

  // Check admin switches: do not render if config is not loaded, master switch is off, or specific placement is off
  if (!adConfig || !adConfig.ads_enabled) {
    return null;
  }
  const isFeed = placement === 'feed' || placement === 'in-feed';
  if (isFeed && !adConfig.feed_ad_enabled) {
    return null;
  }
  if (!isFeed && !adConfig.banner_ads_enabled) {
    return null;
  }

  const isRectangle = size === 'medium_rectangle' || placement === 'home_top' || isFeed;

  const configuredId =
    unitId ||
    (isRectangle ? adConfig?.feed_ad_unit_id : adConfig?.banner_ad_unit_id) ||
    adConfig?.banner_ad_unit_id ||
    Config.ADMOB.BANNER_ID ||
    'ca-app-pub-9010050634863664/4429647201';

  // Try live ID first; if AdMob returns NO_FILL, fall back to Google Test ID so space is not blank
  const adUnitId = useFallback
    ? (TestIds?.BANNER || GOOGLE_TEST_BANNER_ID)
    : configuredId;

  const [loadFailed, setLoadFailed] = useState(false);

  // In native Android/iOS APK where Google Mobile Ads SDK is installed
  if (Platform.OS !== 'web' && RNBannerAd && BannerAdSize) {
    // If ad failed to fill/load in production, collapse cleanly (no empty gap)
    if (!__DEV__ && loadFailed) {
      return null;
    }

    const selectedSize = isRectangle
      ? BannerAdSize.MEDIUM_RECTANGLE
      : isFeed
      ? BannerAdSize.BANNER
      : BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

    return (
      <View style={[styles.container, isRectangle && styles.rectangleContainer, style]}>
        <RNBannerAd
          key={`${adUnitId}-${selectedSize}`}
          unitId={adUnitId}
          size={selectedSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error: any) => {
            console.warn(`[AdMob Banner - ${placement}] Failed to load (${adUnitId}):`, error?.message || error);
            if (__DEV__ && !useFallback && configuredId !== GOOGLE_TEST_BANNER_ID) {
              setUseFallback(true);
            } else {
              setLoadFailed(true);
            }
          }}
        />
      </View>
    );
  }

  // Strictly for development / Expo Go preview - NEVER show test badge in production release
  if (!RNBannerAd) {
    if (!__DEV__) {
      return null;
    }

    return (
      <View style={[styles.devContainer, isRectangle && styles.devRectangleContainer, style]}>
        <View style={styles.devBadge}>
          <Text style={styles.devBadgeText}>📢 ADMOB TEST BANNER</Text>
        </View>
        <Text style={styles.devText}>Placement: {placement}</Text>
        <Text style={styles.devSubtext}>Switch is ACTIVE in Admin</Text>
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
  rectangleContainer: {
    width: '90%',
    maxWidth: 320,
    alignSelf: 'center',
    minHeight: 250,
    marginVertical: Theme.spacing.md,
  },
  devContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  devRectangleContainer: {
    width: '90%',
    maxWidth: 320,
    alignSelf: 'center',
    minHeight: 180,
    marginVertical: Theme.spacing.md,
  },
  devBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    marginBottom: 4,
  },
  devBadgeText: {
    color: '#818CF8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  devText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  devSubtext: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
