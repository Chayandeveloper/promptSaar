import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/ScreenContainer';
import { BannerAd } from '../components/BannerAd';
import {
  useCoinBalance,
  useTodayRewards,
  useClaimAdReward,
} from '../hooks/useRewards';
import { adService } from '../services/ads';
import { useAdConfig } from '../hooks/useAdConfig';
import { Theme } from '../constants/Theme';

export default function EarnCoinsScreen() {
  const router = useRouter();

  const { data: coinData, isLoading: isCoinLoading } = useCoinBalance();
  const { data: todayData, isLoading: isTodayLoading } = useTodayRewards();
  const claimRewardMutation = useClaimAdReward();

  const [adState, setAdState] = useState<'idle' | 'loading' | 'playing' | 'claiming' | 'success' | 'early_close' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { data: adConfig } = useAdConfig();
  const isAdFeatureEnabled = adConfig ? (adConfig.ads_enabled && adConfig.rewarded_daily_coins) : true;
  const balance = coinData?.balance ?? 0;
  const adsWatched = todayData?.ads_watched ?? 0;
  const dailyLimit = todayData?.daily_limit ?? 5;
  const coinsPerAd = todayData?.coins_per_ad ?? 10;
  const maxCoinsToday = todayData?.max_coins_today ?? dailyLimit * coinsPerAd;
  const coinsEarnedToday = todayData?.coins_earned_today ?? 0;
  const canWatch = isAdFeatureEnabled && todayData?.can_watch && adsWatched < dailyLimit;

  const handleWatchAd = async () => {
    if (!canWatch) return;

    setAdState('loading');
    setStatusMessage(null);

    try {
      await adService.presentRewardedAd(
        {
          onAdLoaded: () => {
            setAdState('playing');
          },
          onRewardEarned: async () => {
            setAdState('claiming');
            try {
              const res = await claimRewardMutation.mutateAsync();
              setAdState('success');
              setStatusMessage(res.message || `+${coinsPerAd} coins added!`);
            } catch (err: any) {
              setAdState('error');
              setStatusMessage(err.message || 'Server error claiming coins.');
            }
          },
          onAdDismissedEarly: () => {
            setAdState('early_close');
            setStatusMessage('Advertisement not completed. No coins were added.');
          },
          onAdFailedToLoad: (err) => {
            setAdState('error');
            setStatusMessage(err || "Couldn't load ad. Please try again.");
          },
        },
        false,
        'daily_coins'
      );
    } catch (e: any) {
      setAdState('error');
      setStatusMessage(e.message || 'Failed to display ad.');
    }
  };

  const isBusy = adState === 'loading' || adState === 'playing' || adState === 'claiming';

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Earn Free Coins</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Big Balance Card (Section 14) */}
        <LinearGradient
          colors={['#E11D48', '#FF7A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceGlow}>
            <Text style={styles.bigCoinEmoji}>🪙</Text>
          </View>
          <Text style={styles.balanceNumber}>
            {isCoinLoading ? '...' : balance.toLocaleString()}
          </Text>
          <Text style={styles.balanceLabel}>Current Coin Balance</Text>
          <Text style={styles.balanceSubtext}>
            Use your coins to unlock any prompt immediately without waiting for ads.
          </Text>
        </LinearGradient>

        {/* Daily Rewards Section (Section 2, 3, 14) */}
        <View style={styles.rewardCard}>
          <View style={styles.rewardHeader}>
            <View>
              <Text style={styles.sectionTitle}>Daily Rewards</Text>
              <Text style={styles.sectionSubtitle}>
                Watch an advertisement and earn {coinsPerAd} coins.
              </Text>
            </View>
            <View style={styles.coinPill}>
              <Text style={styles.coinPillText}>+{coinsPerAd} 🪙</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Today's Progress</Text>

            {/* Indicator dots: ● ● ● ○ ○ */}
            <View style={styles.dotsRow}>
              {Array.from({ length: dailyLimit }, (_, i) => i < adsWatched).map((done, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    done ? styles.dotCompleted : styles.dotPending,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.dotNumber}>{idx + 1}</Text>
                  )}
                </View>
              ))}
            </View>

            <Text style={styles.progressCountText}>
              {adsWatched} / {dailyLimit} ads completed today
            </Text>
          </View>

          {/* Notices */}
          {statusMessage && (
            <View
              style={[
                styles.noticeBox,
                adState === 'success'
                  ? styles.noticeSuccess
                  : adState === 'early_close'
                  ? styles.noticeWarning
                  : styles.noticeError,
              ]}
            >
              <Ionicons
                name={
                  adState === 'success'
                    ? 'checkmark-circle'
                    : adState === 'early_close'
                    ? 'alert-circle'
                    : 'close-circle'
                }
                size={16}
                color={
                  adState === 'success'
                    ? Theme.colors.success
                    : adState === 'early_close'
                    ? '#FFC83D'
                    : Theme.colors.danger
                }
              />
              <Text
                style={[
                  styles.noticeText,
                  {
                    color:
                      adState === 'success'
                        ? Theme.colors.success
                        : adState === 'early_close'
                        ? '#FFC83D'
                        : '#FFD1D8',
                  },
                ]}
              >
                {statusMessage}
              </Text>
            </View>
          )}

          {/* Watch Ad Action Button */}
          {canWatch ? (
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isBusy}
              onPress={handleWatchAd}
              style={styles.watchAdBtn}
            >
              {isBusy ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.watchAdBtnText}>
                    {adState === 'loading'
                      ? 'Loading Ad...'
                      : adState === 'playing'
                      ? 'Watching Ad...'
                      : 'Claiming Coins...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.btnRow}>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                  <Text style={styles.watchAdBtnText}>
                    Watch Ad & Earn {coinsPerAd} Coins
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ) : !isAdFeatureEnabled ? (
            <View style={styles.limitReachedBox}>
              <Ionicons name="pause-circle-outline" size={24} color="#FFC83D" />
              <Text style={styles.limitTitle}>Daily ad rewards are currently paused.</Text>
              <Text style={styles.limitSub}>
                Rewarded videos are currently disabled. Check back soon for more coin earning opportunities!
              </Text>
            </View>
          ) : (
            /* Limit Reached (Section 3) */
            <View style={styles.limitReachedBox}>
              <Ionicons name="checkmark-done-circle" size={24} color={Theme.colors.success} />
              <Text style={styles.limitTitle}>Daily reward limit reached.</Text>
              <Text style={styles.limitSub}>
                Come back tomorrow to earn more coins. Your quota resets at midnight server time.
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Daily Limit Info (Section 14) */}
          <View style={styles.limitSummaryRow}>
            <View>
              <Text style={styles.limitSummaryHeading}>Daily Earning Limit</Text>
              <Text style={styles.limitSummaryText}>
                You can earn up to {maxCoinsToday} coins today.
              </Text>
            </View>
            <View style={styles.earnedTodayBadge}>
              <Text style={styles.earnedTodayText}>
                {coinsEarnedToday} / {maxCoinsToday} 🪙
              </Text>
            </View>
          </View>
        </View>

        {/* Tip Box */}
        <View style={styles.infoCard}>
          <Ionicons name="sparkles" size={18} color={Theme.colors.primaryLight} />
          <Text style={styles.infoCardText}>
            Coins never expire. Save them up to unlock high-value premium prompts without having to watch advertisements!
          </Text>
        </View>

        {/* Banner Ad */}
        <BannerAd placement="earn_coins_bottom" />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 4,
    paddingBottom: Theme.spacing.xxl + 24,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: Theme.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  balanceCard: {
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    shadowColor: '#E11D48',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  balanceGlow: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bigCoinEmoji: {
    fontSize: 32,
  },
  balanceNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  balanceSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    maxWidth: 280,
  },
  rewardCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  coinPill: {
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.25)',
  },
  coinPillText: {
    color: '#FF7A00',
    fontWeight: '800',
    fontSize: 12,
  },
  progressSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Theme.colors.primary,
  },
  dotPending: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  dotNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textMuted,
  },
  progressCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchAdBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  watchAdBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  limitReachedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.success,
    marginTop: 4,
    marginBottom: 2,
  },
  limitSub: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 12,
  },
  noticeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  noticeWarning: {
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.25)',
  },
  noticeError: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  limitSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  limitSummaryHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  limitSummaryText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  earnedTodayBadge: {
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.2)',
  },
  earnedTodayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF7A00',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(225, 29, 72, 0.05)',
    borderColor: 'rgba(225, 29, 72, 0.15)',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  infoCardText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 17,
    flex: 1,
  },
});
