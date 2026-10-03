import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAdConfig } from '../hooks/useAdConfig';
import { Config } from '../constants/Config';

interface BannerAdProps {
  placement?: 'bottom' | 'feed' | 'in-feed' | string;
  unitId?: string;
  style?: any;
}

/**
 * Web preview for BannerAd.
 * On real Android/iOS APK, Google Mobile Ads renders the native banner.
 * On Web, this displays a visual preview so you can verify placements and Admin toggles.
 */
export const BannerAd: React.FC<BannerAdProps> = ({
  placement = 'bottom',
  unitId,
  style,
}) => {
  const { data: adConfig } = useAdConfig();

  // Respect Admin switches
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

  const isFeed = placement === 'feed' || placement === 'in-feed';
  const effectiveId =
    unitId ||
    (isFeed ? adConfig?.feed_ad_unit_id : adConfig?.banner_ad_unit_id) ||
    adConfig?.banner_ad_unit_id ||
    Config.ADMOB.BANNER_ID ||
    'ca-app-pub-9010050634863664/4429647201';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.adHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AdMob {isFeed ? 'In-Feed Ad' : 'Banner Ad'}</Text>
        </View>
        <Text style={styles.placementTag}>[{placement}]</Text>
      </View>
      <Text style={styles.idText} numberOfLines={1}>
        Unit ID: {effectiveId}
      </Text>
      <Text style={styles.noteText}>
        (Preview mode on web — live Google ads display on Android APK)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  placementTag: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '600',
  },
  idText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 3,
  },
  noteText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
