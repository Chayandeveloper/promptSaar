import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Theme } from '../constants/Theme';

export const Skeleton: React.FC<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}> = ({ width = '100%', height = 20, borderRadius = Theme.borderRadius.md, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <View style={styles.heroSkeleton}>
      <Skeleton width="100%" height={230} borderRadius={Theme.borderRadius.xl} />
    </View>
  );
};

export const PromptCardSkeleton: React.FC<{ grid?: boolean }> = ({ grid = false }) => {
  return (
    <View style={[styles.cardSkeleton, grid && styles.cardSkeletonGrid]}>
      <Skeleton width="100%" height={grid ? 110 : 130} borderRadius={Theme.borderRadius.md} />
      <View style={{ marginTop: 8, gap: 5 }}>
        <Skeleton width="40%" height={10} />
        <Skeleton width="85%" height={14} />
      </View>
    </View>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <View style={styles.categorySkeleton}>
      <Skeleton width={18} height={18} borderRadius={Theme.borderRadius.full} />
      <Skeleton width={64} height={14} borderRadius={Theme.borderRadius.sm} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Theme.colors.surfaceElevated,
  },
  heroSkeleton: {
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  cardSkeleton: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardSkeletonGrid: {
    width: '48.5%',
    marginBottom: 12,
  },
  categorySkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 104,
    height: 40,
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
});
