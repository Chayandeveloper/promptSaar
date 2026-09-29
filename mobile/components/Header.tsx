import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useCoinBalance } from '../hooks/useRewards';
import { Theme } from '../constants/Theme';

export const Header: React.FC = () => {
  const router = useRouter();
  const { data: coinData } = useCoinBalance();
  const coins = coinData?.balance ?? 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftBrandRow}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>Prompt Saar</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        {/* Compact Coin Balance Indicator (Section 30) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/rewards')}
          style={styles.coinBadge}
        >
          <Text style={styles.coinIcon}>🪙</Text>
          <Text style={styles.coinCount}>{coins}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.avatarButton}
        >
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>✨</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  leftBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Theme.spacing.sm,
    gap: 12,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.35)',
  },
  coinIcon: {
    fontSize: 14,
  },
  coinCount: {
    color: '#FF7A00',
    fontSize: 13,
    fontWeight: '800',
  },
  avatarButton: {
    padding: 2,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
});
