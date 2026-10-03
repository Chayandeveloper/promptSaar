import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SocialChannels } from '../../components/SocialChannels';
import { UnlockStorage, SavedStorage, getDeviceId } from '../../services/storage';
import { useCoinBalance, useCoinTransactions } from '../../hooks/useRewards';
import { Theme } from '../../constants/Theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [deviceId, setDeviceId] = useState<string>('');

  const { data: coinData } = useCoinBalance();
  const { data: txData } = useCoinTransactions();
  const transactions = txData?.data ?? [];

  const loadStats = async () => {
    const ids = await UnlockStorage.getUnlockedIds();
    setUnlockedCount(ids.length);

    const saved = await SavedStorage.getSavedPrompts();
    setSavedCount(saved.length);

    const id = await getDeviceId();
    setDeviceId(id);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Prompt Saar — Discover and unlock curated AI prompts for ChatGPT, Leonardo, Midjourney & more!',
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.screenHeading}>My Account</Text>

        {/* Member Card with App Logo */}
        <View style={styles.userCard}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>Prompt Saar</Text>
          <Text style={styles.brandSubtitle}>Curated AI Prompts &amp; Tools</Text>
        </View>

        {/* Official Social Channels Card (Connected to Admin Panel) */}
        <View style={styles.socialCard}>
          <View style={styles.socialHeader}>
            <View style={styles.socialIconWrap}>
              <Ionicons name="chatbubbles" size={17} color="#E11D48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.socialTitle}>Official Channels</Text>
              <Text style={styles.socialSubtitle}>
                WhatsApp, Instagram &amp; Telegram
              </Text>
            </View>
          </View>
          <SocialChannels noPadding />
        </View>

        {/* Rewards Section (Section 31) */}
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsCardHeader}>
            <View>
              <Text style={styles.rewardsCardSubtitle}>YOUR REWARDS</Text>
              <View style={styles.coinBalanceRow}>
                <Text style={styles.coinEmoji}>🪙</Text>
                <Text style={styles.coinBalanceText}>
                  {(coinData?.balance ?? 0).toLocaleString()} Coins
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/rewards')}
              style={styles.earnCoinsBtn}
            >
              <Text style={styles.earnCoinsBtnText}>Earn Coins</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.rewardsStatsRow}>
            <View style={styles.rewardsStatBox}>
              <Text style={styles.rewardsStatNumber}>
                {(coinData?.total_earned ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.rewardsStatLabel}>Total Earned</Text>
            </View>
            <View style={styles.rewardsDivider} />
            <View style={styles.rewardsStatBox}>
              <Text style={styles.rewardsStatNumber}>
                {(coinData?.total_spent ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.rewardsStatLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        {/* Coin Transaction History Section (Section 20) */}
        <View style={styles.menuSection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionHeader}>COIN HISTORY</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/rewards')}
            >
              <Text style={styles.getMoreCoinsLink}>+ Get More</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyTxBox}>
              <Text style={styles.emptyTxText}>
                No coin transactions yet. Watch a rewarded video in "Earn Coins" to earn your first coins!
              </Text>
            </View>
          ) : (
            transactions.slice(0, 8).map((t) => {
              const isPositive = t.amount > 0;
              return (
                <View key={t.id} style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <View
                      style={[
                        styles.txBadge,
                        isPositive ? styles.txBadgePositive : styles.txBadgeNegative,
                      ]}
                    >
                      <Text
                        style={[
                          styles.txAmountText,
                          isPositive ? styles.txTextPositive : styles.txTextNegative,
                        ]}
                      >
                        {isPositive ? `+${t.amount}` : t.amount} 🪙
                      </Text>
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={1}>
                        {t.description}
                      </Text>
                      <Text style={styles.txTime}>
                        {new Date(t.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {new Date(t.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Library Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>LIBRARY</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/saved')}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="bookmark-outline" size={20} color={Theme.colors.primaryLight} />
              <Text style={styles.menuTitle}>Saved Prompts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShareApp}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="share-social-outline" size={20} color={Theme.colors.textSecondary} />
              <Text style={styles.menuTitle}>Share Prompt Saar App</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Application Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>APPLICATION</Text>


          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/settings/privacy')}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Theme.colors.primary} />
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/settings/terms')}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={20} color={Theme.colors.primary} />
              <Text style={styles.menuTitle}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/settings/about')}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="information-circle-outline" size={20} color={Theme.colors.textSecondary} />
              <Text style={styles.menuTitle}>About Prompt Saar</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl + 24,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: Theme.spacing.md,
  },
  userCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  appLogo: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: 10,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  rewardsCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.25)',
    marginBottom: Theme.spacing.md,
  },
  rewardsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Theme.spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  rewardsCardSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  coinBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  coinEmoji: {
    fontSize: 20,
  },
  coinBalanceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF7A00',
  },
  earnCoinsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.md,
  },
  earnCoinsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  rewardsStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Theme.spacing.sm + 4,
  },
  rewardsStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  rewardsStatNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  rewardsStatLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  rewardsDivider: {
    width: 1,
    height: 24,
    backgroundColor: Theme.colors.border,
  },
  menuSection: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  getMoreCoinsLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7A00',
  },
  emptyTxBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyTxText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  txRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.md,
    minWidth: 54,
    alignItems: 'center',
  },
  txBadgePositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  txBadgeNegative: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
  },
  txAmountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  txTextPositive: {
    color: '#10B981',
  },
  txTextNegative: {
    color: '#E11D48',
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  txTime: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  socialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  socialIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  socialSubtitle: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
});
