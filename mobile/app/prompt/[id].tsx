import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { UnlockState } from '../../components/UnlockButton';
import { PromptViewer } from '../../components/PromptViewer';
import { AIActionButtons } from '../../components/AIActionButton';
import { BannerAd } from '../../components/BannerAd';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton, PromptCardSkeleton } from '../../components/Skeleton';
import { PromptCard } from '../../components/PromptCard';
import {
  usePrompt,
  useToggleSavePrompt,
  usePrompts,
  useRecentPrompts,
} from '../../hooks/usePrompts';
import { useCoinBalance, useUnlockWithCoins, useUnlockWithAd, useRewardConfig } from '../../hooks/useRewards';
import { adService } from '../../services/ads';
import { Theme } from '../../constants/Theme';

export default function PromptDetailsScreen() {
  const { id } = useLocalSearchParams();
  const promptId = parseInt(id as string, 10);
  const router = useRouter();
  const scrollRef = React.useRef<ScrollView>(null);

  const { data: prompt, isLoading, error, refetch } = usePrompt(promptId);
  const toggleSave = useToggleSavePrompt();

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [promptId]);

  // More Prompts Queries
  const { data: categoryPromptsData, isLoading: isCategoryLoading } = usePrompts(
    prompt?.category_id ? { category_id: prompt.category_id } : undefined
  );
  const { data: fallbackRecent, isLoading: isRecentLoading } = useRecentPrompts();

  const rawCatPrompts = (categoryPromptsData?.data || []).filter((item) => item.id !== promptId);
  const fallbackPrompts = (fallbackRecent || []).filter((item) => item.id !== promptId);
  const morePrompts = rawCatPrompts.length >= 2 ? rawCatPrompts.slice(0, 6) : fallbackPrompts.slice(0, 6);
  const isMoreLoading = isCategoryLoading || (rawCatPrompts.length < 2 && isRecentLoading);

  // Coin & Unlock hooks
  const { data: coinData } = useCoinBalance();
  const { data: rewardConfig } = useRewardConfig();
  const unlockCoinsMutation = useUnlockWithCoins();
  const unlockAdMutation = useUnlockWithAd();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [adUnlockState, setAdUnlockState] = useState<UnlockState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coinErrorMessage, setCoinErrorMessage] = useState<string | null>(null);

  const userCoins = coinData?.balance ?? 0;
  const promptCost = prompt?.unlock_cost ?? rewardConfig?.default_prompt_cost ?? 20;
  const hasEnoughCoins = userCoins >= promptCost;
  const deficit = Math.max(0, promptCost - userCoins);

  const handleSaveToggle = () => {
    if (prompt) {
      toggleSave.mutate({ prompt: prompt as any, isSaved: Boolean(prompt.is_saved) });
    }
  };

  const handleShare = async () => {
    if (!prompt) return;
    try {
      await Share.share({
        message: `Check out "${prompt.title}" on Prompt Saar! A curated AI prompt for ${prompt.category?.name || 'creators'}.`,
        title: prompt.title,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  // Option 1 — Spend coins to unlock immediately
  const handleCoinUnlockFlow = async () => {
    setCoinErrorMessage(null);
    try {
      await unlockCoinsMutation.mutateAsync(promptId);
      setShowUnlockModal(false);
    } catch (err: any) {
      const msg = err?.data?.message || err.message || 'Failed to unlock with coins.';
      setCoinErrorMessage(msg);
    }
  };

  // Option 2 — Watch rewarded advertisement
  const handleAdUnlockFlow = async () => {
    setAdUnlockState('loading_ad');
    setErrorMessage(null);

    try {
      await adService.presentRewardedAd({
        onAdLoaded: () => {
          setAdUnlockState('watching_ad');
        },
        onRewardEarned: async () => {
          setAdUnlockState('unlocking');
          try {
            await unlockAdMutation.mutateAsync({ promptId });
            setAdUnlockState('success');
            setTimeout(() => {
              setShowUnlockModal(false);
            }, 1200);
          } catch (err: any) {
            setErrorMessage(err.message || 'Server failed to record ad unlock.');
            setAdUnlockState('error');
          }
        },
        onAdDismissedEarly: () => {
          setAdUnlockState('early_close');
        },
        onAdFailedToLoad: (err) => {
          setErrorMessage(err || "Couldn't load ad.");
          setAdUnlockState('error');
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Ad playback encountered an error.');
      setAdUnlockState('error');
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <View style={{ width: '100%', aspectRatio: 4 / 5, borderRadius: Theme.borderRadius.xl, overflow: 'hidden' }}>
            <Skeleton width="100%" height="100%" />
          </View>
          <View style={{ marginTop: 20, gap: 10 }}>
            <Skeleton width="30%" height={16} />
            <Skeleton width="80%" height={26} />
            <Skeleton width="100%" height={50} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (error || !prompt) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Could not load prompt details. It may have been unpublished or removed."
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  const isUnlocked = !prompt.is_locked && Boolean(prompt.prompt_text);

  return (
    <ScreenContainer noPadding>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cover Image Container */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: prompt.cover_image }} style={styles.coverImage} resizeMode="cover" />

          {/* Action Overlay */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={styles.circleActionButton}
            >
              <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveToggle}
              style={styles.circleActionButton}
            >
              <Ionicons
                name={prompt.is_saved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={prompt.is_saved ? Theme.colors.primaryLight : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
          {/* Category & Stats Row */}
          <View style={styles.categoryStatsRow}>
            {prompt.category && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/category/${prompt.category?.slug}` as any)}
                style={styles.categoryPill}
              >
                <Text style={styles.categoryText}>{prompt.category.name}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.statsBadges}>
              <View style={styles.statBadge}>
                <Ionicons name="eye-outline" size={13} color={Theme.colors.textMuted} />
                <Text style={styles.statBadgeText}>{prompt.views} views</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{prompt.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{prompt.description}</Text>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {prompt.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* UNLOCKED vs LOCKED STATE */}
          {isUnlocked ? (
            <View style={styles.unlockedSection}>
              {/* Unlocked status badge */}
              <View style={styles.unlockedStatusPill}>
                <Ionicons name="checkmark-circle" size={16} color="#34D399" />
                <Text style={styles.unlockedStatusText}>Unlocked & Ready to Use</Text>
              </View>

              {/* Full prompt viewer */}
              <PromptViewer promptText={prompt.prompt_text!} />

              {/* Action buttons (Copy, ChatGPT, Gemini) */}
              <AIActionButtons promptText={prompt.prompt_text!} />
            </View>
          ) : (
            <View style={styles.lockedSection}>
              {/* Single Unified Unlock Card */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setShowUnlockModal(true)}
                style={styles.singleUnlockCard}
              >
                <View style={styles.singleCardHeader}>
                  <View style={styles.lockIconCircle}>
                    <Ionicons name="lock-closed" size={24} color="#FBBF24" />
                  </View>
                  <View style={styles.singleCardTitleWrap}>
                    <Text style={styles.lockCardTitle}>Prompt Locked</Text>
                    <Text style={styles.lockCardSubtitle}>
                      Tap to unlock with coins or watch a free ad
                    </Text>
                  </View>
                </View>

                {/* Coin & Cost Info Strip */}
                <View style={styles.infoStrip}>
                  <View style={styles.infoStripItem}>
                    <Text style={styles.infoStripLabel}>Unlock Cost</Text>
                    <Text style={styles.infoStripValue}>🪙 {promptCost} Coins</Text>
                  </View>
                  <View style={styles.infoStripDivider} />
                  <View style={styles.infoStripItem}>
                    <Text style={styles.infoStripLabel}>Your Balance</Text>
                    <Text style={[styles.infoStripValue, { color: hasEnoughCoins ? '#34D399' : '#FDE68A' }]}>
                      🪙 {userCoins} Coins
                    </Text>
                  </View>
                </View>

                {/* Unlock trigger button */}
                <View style={styles.unlockTriggerBtn}>
                  <Ionicons name="flash" size={16} color="#080B11" />
                  <Text style={styles.unlockTriggerBtnText}>
                    Unlock Prompt • Choose Option
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#080B11" />
                </View>

                <Text style={styles.cardHintText}>
                  ✨ Tap to choose: Spend coins, watch free ad, or add coins
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* AdMob Banner Placement */}
          <BannerAd placement="prompt_detail_bottom" />

          {/* More Prompts Section */}
          <View style={styles.morePromptsSection}>
            <View style={styles.morePromptsHeader}>
              <View style={styles.morePromptsTitleRow}>
                <Text style={styles.morePromptsEmoji}>✨</Text>
                <Text style={styles.morePromptsTitle}>More Prompts</Text>
              </View>
              <Text style={styles.morePromptsSub}>
                {prompt.category?.name ? `In ${prompt.category.name}` : 'You may also like'}
              </Text>
            </View>

            {isMoreLoading ? (
              <View style={styles.gridRow}>
                <PromptCardSkeleton grid />
                <PromptCardSkeleton grid />
                <PromptCardSkeleton grid />
                <PromptCardSkeleton grid />
              </View>
            ) : morePrompts.length > 0 ? (
              <View style={styles.gridRow}>
                {morePrompts.map((item) => (
                  <PromptCard key={item.id} prompt={item} grid />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Small Unlock Options Modal with Small Rectangular Boxes */}
      <Modal
        visible={showUnlockModal && !isUnlocked}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUnlockModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowUnlockModal(false)}
          style={styles.smallModalBackdrop}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.smallModalCard}
          >
            {/* Modal Header */}
            <View style={styles.smallModalHeader}>
              <View style={styles.smallModalHeaderLeft}>
                <Ionicons name="lock-open" size={17} color="#FBBF24" />
                <Text style={styles.smallModalTitle}>Unlock Prompt</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowUnlockModal(false)}
                style={styles.smallModalCloseBtn}
              >
                <Ionicons name="close" size={16} color={Theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.smallModalPromptName} numberOfLines={1}>
              {prompt.title}
            </Text>

            {/* Small Rectangular Box 1: Use Coins */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={unlockCoinsMutation.isPending}
              onPress={() => {
                if (hasEnoughCoins) {
                  handleCoinUnlockFlow();
                } else {
                  setShowUnlockModal(false);
                  router.push('/rewards');
                }
              }}
              style={[
                styles.rectangularBox,
                hasEnoughCoins ? styles.boxCoinReady : styles.boxCoinDeficit,
              ]}
            >
              <View style={styles.boxIconWrap}>
                <Text style={styles.boxCoinIcon}>🪙</Text>
              </View>

              <View style={styles.boxContent}>
                <Text style={styles.boxTitle}>
                  Use {promptCost} Coins
                </Text>
                <Text style={styles.boxSubtitle}>
                  {hasEnoughCoins
                    ? `Balance: ${userCoins} coins`
                    : `Need ${deficit} more (Balance: ${userCoins})`}
                </Text>
              </View>

              <View style={styles.boxActionRight}>
                {unlockCoinsMutation.isPending ? (
                  <ActivityIndicator size="small" color="#F59E0B" />
                ) : hasEnoughCoins ? (
                  <View style={styles.boxActionPillActive}>
                    <Text style={styles.boxActionPillActiveText}>Unlock</Text>
                    <Ionicons name="flash" size={11} color="#080B11" />
                  </View>
                ) : (
                  <View style={styles.boxActionPillOutline}>
                    <Text style={styles.boxActionPillOutlineText}>+ Add</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {coinErrorMessage && (
              <Text style={styles.boxInlineError}>{coinErrorMessage}</Text>
            )}

            {/* Small Rectangular Box 2: Watch Ad */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={
                adUnlockState === 'loading_ad' ||
                adUnlockState === 'watching_ad' ||
                adUnlockState === 'unlocking'
              }
              onPress={handleAdUnlockFlow}
              style={[styles.rectangularBox, styles.boxAd]}
            >
              <View style={[styles.boxIconWrap, styles.boxIconAd]}>
                <Ionicons name="play" size={14} color="#06B6D4" />
              </View>

              <View style={styles.boxContent}>
                <Text style={styles.boxTitle}>Watch Short Video</Text>
                <Text style={styles.boxSubtitle}>
                  {adUnlockState === 'loading_ad'
                    ? 'Preparing ad...'
                    : adUnlockState === 'watching_ad'
                      ? 'Playing video...'
                      : adUnlockState === 'unlocking'
                        ? 'Verifying...'
                        : '100% Free • No coins needed'}
                </Text>
              </View>

              <View style={styles.boxActionRight}>
                {adUnlockState === 'loading_ad' ||
                  adUnlockState === 'watching_ad' ||
                  adUnlockState === 'unlocking' ? (
                  <ActivityIndicator size="small" color="#06B6D4" />
                ) : adUnlockState === 'success' ? (
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                ) : (
                  <View style={styles.boxFreeBadge}>
                    <Text style={styles.boxFreeBadgeText}>FREE</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {(errorMessage || adUnlockState === 'early_close') && (
              <Text style={styles.boxInlineError}>
                {adUnlockState === 'early_close'
                  ? 'Video dismissed early. Watch full ad to unlock.'
                  : errorMessage}
              </Text>
            )}

            {/* Small Rectangular Box 3: Add / Earn Coins */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setShowUnlockModal(false);
                router.push('/rewards');
              }}
              style={[styles.rectangularBox, styles.boxAddCoins]}
            >
              <View style={[styles.boxIconWrap, styles.boxIconAddCoins]}>
                <Ionicons name="wallet-outline" size={14} color="#818CF8" />
              </View>

              <View style={styles.boxContent}>
                <Text style={styles.boxTitle}>Add / Earn Coins</Text>
                <Text style={styles.boxSubtitle}>Scratch cards & free bonuses</Text>
              </View>

              <View style={styles.boxActionRight}>
                <Ionicons name="chevron-forward" size={15} color={Theme.colors.textMuted} />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Theme.spacing.md,
  },
  scroll: {
    paddingBottom: Theme.spacing.xxl + 24,
  },
  coverWrapper: {
    width: '100%',
    aspectRatio: 4 / 5,
    position: 'relative',
    backgroundColor: Theme.colors.surfaceElevated,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  topActionsRow: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleActionButton: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(8, 11, 17, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  contentBody: {
    padding: Theme.spacing.md,
  },
  categoryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primaryLight,
    textTransform: 'uppercase',
  },
  statsBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textMuted,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Theme.spacing.md,
  },
  tagBadge: {
    backgroundColor: Theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  tagText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  unlockedSection: {
    marginBottom: Theme.spacing.md,
  },
  unlockedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  unlockedStatusText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  lockedSection: {
    marginBottom: Theme.spacing.lg,
  },
  singleUnlockCard: {
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  singleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  lockIconCircle: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  singleCardTitleWrap: {
    flex: 1,
  },
  lockCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FDE68A',
    marginBottom: 2,
  },
  lockCardSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 7, 13, 0.5)',
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  infoStripItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoStripDivider: {
    width: 1,
    height: 24,
    backgroundColor: Theme.colors.border,
  },
  infoStripLabel: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoStripValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  unlockTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 13,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  unlockTriggerBtnText: {
    color: '#080B11',
    fontSize: 14,
    fontWeight: '800',
  },
  cardHintText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
  smallModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 13, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  smallModalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 12,
  },
  smallModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  smallModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  smallModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  smallModalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  smallModalPromptName: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 14,
  },
  rectangularBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  boxCoinReady: {
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  boxCoinDeficit: {
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  boxAd: {
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  boxAddCoins: {
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: 0,
  },
  boxIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  boxCoinIcon: {
    fontSize: 15,
  },
  boxIconAd: {
    backgroundColor: 'rgba(6, 182, 212, 0.14)',
  },
  boxIconAddCoins: {
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
  },
  boxContent: {
    flex: 1,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  boxSubtitle: {
    fontSize: 10.5,
    color: Theme.colors.textMuted,
  },
  boxActionRight: {
    marginLeft: 8,
  },
  boxActionPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.sm,
  },
  boxActionPillActiveText: {
    color: '#080B11',
    fontSize: 11,
    fontWeight: '800',
  },
  boxActionPillOutline: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  boxActionPillOutlineText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
  },
  boxFreeBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
  },
  boxFreeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06B6D4',
  },
  boxInlineError: {
    color: '#FECDD3',
    fontSize: 11,
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  morePromptsSection: {
    marginTop: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  morePromptsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  morePromptsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  morePromptsEmoji: {
    fontSize: 16,
  },
  morePromptsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  morePromptsSub: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
