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
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  adBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  adPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.primaryLight,
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
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
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
