import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdConfig } from '../hooks/useAdConfig';
import { Config } from '../constants/Config';

interface BannerAdProps {
  placement?: 'bottom' | 'feed' | 'in-feed' | 'home_top' | string;
  size?: 'banner' | 'large_banner' | 'medium_rectangle' | 'adaptive';
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
  size,
  unitId,
  style,
}) => {
  const { data: adConfig } = useAdConfig();

  // Respect Admin switches: do not render if config is not loaded, master switch is off, or specific placement is off
  if (!adConfig || !adConfig.ads_enabled || !__DEV__) {
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

  const effectiveId =
    unitId ||
    (isFeed ? adConfig?.feed_ad_unit_id : adConfig?.banner_ad_unit_id) ||
    adConfig?.banner_ad_unit_id ||
    Config.ADMOB.BANNER_ID ||
    'ca-app-pub-9010050634863664/4429647201';

  return (
    <View style={[styles.container, isRectangle && styles.rectangleContainer, style]}>
      <View style={styles.adHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            AdMob {isRectangle ? 'Medium Rectangle Ad' : isFeed ? 'In-Feed Ad' : 'Banner Ad'}
          </Text>
        </View>
        <Text style={styles.placementTag}>[{placement}]</Text>
      </View>

      {isRectangle && (
        <View style={styles.rectContentBox}>
          <View style={styles.rectIconWrap}>
            <Ionicons name="megaphone-outline" size={28} color="#6366F1" />
          </View>
          <Text style={styles.rectTitle}>Sponsored Ad Space (300 × 250)</Text>
          <Text style={styles.rectSubtitle}>High-engagement rectangle banner placement</Text>
        </View>
      )}

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
  rectangleContainer: {
    width: '90%',
    maxWidth: 320,
    alignSelf: 'center',
    minHeight: 210,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: 16,
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  rectContentBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  rectIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 2,
  },
  rectSubtitle: {
    fontSize: 12,
    color: '#64748B',
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
    marginTop: 4,
  },
  noteText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
});
