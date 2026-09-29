import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { Config } from '../constants/Config';

interface BannerAdProps {
  placement?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ placement = 'feed' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.adBadgeRow}>
        <View style={styles.adPill}>
          <Text style={styles.adPillText}>SPONSORED</Text>
        </View>
        <Text style={styles.adUnitId}>
          AdMob Test #{Config.ADMOB.BANNER_ID.slice(-6)}
        </Text>
      </View>

      <View style={styles.bannerContent}>
        <View style={styles.iconBox}>
          <Ionicons name="sparkles" size={18} color={Theme.colors.primary} />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.title}>Supercharge Your Creative Workflow</Text>
          <Text style={styles.subtitle}>
            Try state-of-the-art AI tooling with automated prompt refinement.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  adBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  adPill: {
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FF7A00',
    letterSpacing: 0.5,
  },
  adUnitId: {
    fontSize: 9,
    color: Theme.colors.textMuted,
    fontFamily: 'System',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 14,
  },
});
