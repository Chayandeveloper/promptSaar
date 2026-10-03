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
  BackHandler,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { UnlockStorage } from '../../services/storage';
import { promptsService } from '../../services/prompts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../components/ScreenContainer';
import { UnlockState } from '../../components/UnlockButton';
import { PromptViewer } from '../../components/PromptViewer';
import { LockedPromptViewer } from '../../components/LockedPromptViewer';
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
  useSavedPrompts,
} from '../../hooks/usePrompts';
import { useCoinBalance, useUnlockWithCoins, useUnlockWithAd, useRewardConfig } from '../../hooks/useRewards';
import { useAdConfig } from '../../hooks/useAdConfig';
import { adService } from '../../services/ads';
import { Theme } from '../../constants/Theme';

export default function PromptDetailsScreen() {
  const { id } = useLocalSearchParams();
  const promptId = parseInt(id as string, 10);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);

  const { data: prompt, isLoading, error, refetch } = usePrompt(promptId);
  const toggleSave = useToggleSavePrompt();
  const { data: savedPrompts = [] } = useSavedPrompts();
  const { data: adConfig } = useAdConfig();
  const canShowAdUnlock = adConfig ? adConfig.ads_enabled && adConfig.rewarded_prompt_unlock : true;
  const isSaved = Boolean(prompt?.is_saved) || savedPrompts.some((p) => p.id === promptId);

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
  const queryClient = useQueryClient();
  const { data: coinData } = useCoinBalance();
  const { data: rewardConfig } = useRewardConfig();
  const unlockCoinsMutation = useUnlockWithCoins();
  const unlockAdMutation = useUnlockWithAd();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [adUnlockState, setAdUnlockState] = useState<UnlockState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coinErrorMessage, setCoinErrorMessage] = useState<string | null>(null);

  // Track session-only unlock state so leaving the screen relocks the prompt
  const [sessionUnlockedText, setSessionUnlockedText] = useState<string | null>(null);
  const [wasUnlockedDuringSession, setWasUnlockedDuringSession] = useState(false);
  const isLeavingRef = React.useRef(false);

  // Full back handler: Re-locks prompt and shows interstitial ad if unlocked
  const handleGoBack = React.useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;

    // 1. Re-lock this prompt so next time user clicks it, it must be unlocked again
    UnlockStorage.removeUnlockedPrompt(promptId).catch(() => {});
    promptsService.relockPrompt(promptId).catch(() => {});
    queryClient.removeQueries({ queryKey: ['prompt', promptId] });
    queryClient.invalidateQueries({ queryKey: ['prompts'] });

    // 2. Show interstitial ad on prompt back if enabled in admin panel
    adService.presentInterstitialOnPromptBack(() => {
      router.back();
    });
  }, [promptId, router, queryClient]);

  // Intercept Android hardware back press / gesture
  React.useEffect(() => {
    const onHardwareBack = () => {
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [handleGoBack]);

  const userCoins = coinData?.balance ?? 0;
  const promptCost = prompt?.unlock_cost ?? rewardConfig?.default_prompt_cost ?? 20;
  const hasEnoughCoins = userCoins >= promptCost;
  const deficit = Math.max(0, promptCost - userCoins);

  const handleSaveToggle = () => {
    if (prompt) {
      toggleSave.mutate({ prompt: prompt as any, isSaved });
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
      const res = await unlockCoinsMutation.mutateAsync(promptId);
      if (res?.prompt_text) {
        setSessionUnlockedText(res.prompt_text);
      }
      setWasUnlockedDuringSession(true);
      setShowUnlockModal(false);
    } catch (err: any) {
      const msg = err?.data?.message || err.message || 'Failed to unlock with coins.';
      setCoinErrorMessage(msg);
      Alert.alert('Unlock Error', msg);
    }
  };

  // Option 2 — Watch rewarded advertisement
  const handleAdUnlockFlow = async () => {
    setAdUnlockState('loading_ad');
    setErrorMessage(null);

    try {
      await adService.presentRewardedAd(
        {
          onAdLoaded: () => {
            setAdUnlockState('watching_ad');
          },
          onRewardEarned: async () => {
            setAdUnlockState('unlocking');
            try {
              const res = await unlockAdMutation.mutateAsync({ promptId });
              if (res?.prompt_text) {
                setSessionUnlockedText(res.prompt_text);
              }
              setWasUnlockedDuringSession(true);
              setAdUnlockState('success');
              setTimeout(() => {
                setShowUnlockModal(false);
              }, 1200);
            } catch (err: any) {
              setErrorMessage(err.message || 'Server failed to record ad unlock.');
              setAdUnlockState('error');
              Alert.alert('Unlock Error', err.message || 'Server failed to record ad unlock.');
            }
          },
          onAdDismissedEarly: () => {
            setAdUnlockState('early_close');
            Alert.alert('Incomplete Video', 'Please watch the complete video to unlock this prompt.');
          },
          onAdFailedToLoad: (err) => {
            setErrorMessage(err || "Couldn't load ad.");
            setAdUnlockState('error');
            Alert.alert('Ad Unavailable', 'Rewarded ad could not be loaded at the moment. Please try again shortly or earn coins from Rewards.');
          },
        },
        false,
        'prompt_unlock'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Ad playback encountered an error.');
      setAdUnlockState('error');
      Alert.alert('Ad Error', 'Failed to play rewarded ad.');
    }
  };

  // Auto-Unlock Flow: If coins are available, use coins automatically; if not, use the rewarded ad!
  const handleAutoUnlock = async () => {
    if (
      unlockCoinsMutation.isPending ||
      adUnlockState === 'loading_ad' ||
      adUnlockState === 'watching_ad' ||
      adUnlockState === 'unlocking'
    ) {
      return;
    }

    if (hasEnoughCoins) {
      await handleCoinUnlockFlow();
    } else {
      await handleAdUnlockFlow();
    }
  };

  const isUnlocking =
    unlockCoinsMutation.isPending ||
    adUnlockState === 'loading_ad' ||
    adUnlockState === 'watching_ad' ||
    adUnlockState === 'unlocking';

  if (isLoading) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoBack}
            style={styles.loadingBackButton}
          >
            <Ionicons name="arrow-back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
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
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={{ paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.sm }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoBack}
            style={styles.loadingBackButton}
          >
            <Ionicons name="arrow-back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
        </View>
        <ErrorState
          message="Could not load prompt details. It may have been unpublished or removed."
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  const isUnlocked = Boolean(sessionUnlockedText) || (!prompt.is_locked && Boolean(prompt.prompt_text));
  const activePromptText = sessionUnlockedText || prompt.prompt_text || '';

  return (
    <ScreenContainer noPadding edges={['left', 'right', 'bottom']}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cover Image Container */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: prompt.cover_image }} style={styles.coverImage} resizeMode="cover" />

          {/* Action & Navigation Overlay */}
          <View style={[styles.topActionsRow, { top: Math.max(insets.top, 14) + 6 }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGoBack}
              style={styles.circleActionButton}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.topRightActions}>
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
                style={[
                  styles.circleActionButton,
                  isSaved && styles.circleActionButtonActive,
                ]}
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isSaved ? '#FFC83D' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
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
                <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
                <Text style={styles.unlockedStatusText}>Unlocked & Ready to Use</Text>
              </View>

              {/* Full prompt viewer */}
              <PromptViewer promptText={activePromptText} />

              {/* Action buttons (Copy, ChatGPT, Gemini) */}
              <AIActionButtons promptText={activePromptText} />
            </View>
          ) : (
            <LockedPromptViewer
              promptCost={promptCost}
              userCoins={userCoins}
              hasEnoughCoins={hasEnoughCoins}
              onUnlockPress={handleAutoUnlock}
              isUnlocking={isUnlocking}
              promptTitle={prompt.title}
              categoryName={prompt.category?.name}
            />
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
                <PromptCardSkeleton grid portrait />
                <PromptCardSkeleton grid portrait />
                <PromptCardSkeleton grid portrait />
                <PromptCardSkeleton grid portrait />
              </View>
            ) : morePrompts.length > 0 ? (
              <View style={styles.gridRow}>
                {morePrompts.map((item) => (
                  <PromptCard key={item.id} prompt={item} grid portrait />
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
                <Ionicons name="lock-open" size={17} color="#FFC83D" />
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
                  <ActivityIndicator size="small" color="#FFC83D" />
                ) : hasEnoughCoins ? (
                  <View style={styles.boxActionPillActive}>
                    <Text style={styles.boxActionPillActiveText}>Unlock</Text>
                    <Ionicons name="flash" size={11} color="#FFFFFF" />
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

            {/* Small Rectangular Box 2: Watch Ad (Controlled via Admin Panel) */}
            {canShowAdUnlock && (
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
                  <Ionicons name="play" size={14} color={Theme.colors.success} />
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
                    <ActivityIndicator size="small" color={Theme.colors.success} />
                  ) : adUnlockState === 'success' ? (
                    <Ionicons name="checkmark-circle" size={18} color={Theme.colors.success} />
                  ) : (
                    <View style={styles.boxFreeBadge}>
                      <Text style={styles.boxFreeBadgeText}>FREE</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}

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
                <Ionicons name="wallet-outline" size={14} color={Theme.colors.primary} />
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
  loadingBackButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
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
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleActionButton: {
    width: 38,
    height: 38,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circleActionButtonActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
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
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  unlockedStatusText: {
    color: Theme.colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  lockedSection: {
    marginBottom: Theme.spacing.lg,
  },
  singleUnlockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
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
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
  },
  singleCardTitleWrap: {
    flex: 1,
  },
  lockCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
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
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#E11D48',
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: 13,
    shadowColor: '#E11D48',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  unlockTriggerBtnText: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  smallModalCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: '#F8F9FA',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  boxCoinReady: {
    borderColor: 'rgba(255, 122, 0, 0.4)',
  },
  boxCoinDeficit: {
    borderColor: 'rgba(255, 122, 0, 0.2)',
  },
  boxAd: {
    borderColor: 'rgba(225, 29, 72, 0.25)',
  },
  boxAddCoins: {
    borderColor: '#E5E7EB',
    marginBottom: 0,
  },
  boxIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  boxCoinIcon: {
    fontSize: 15,
  },
  boxIconAd: {
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
  },
  boxIconAddCoins: {
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
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
    backgroundColor: '#FF7A00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.sm,
  },
  boxActionPillActiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  boxActionPillOutline: {
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.35)',
  },
  boxActionPillOutlineText: {
    color: '#FF7A00',
    fontSize: 11,
    fontWeight: '700',
  },
  boxFreeBadge: {
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.25)',
  },
  boxFreeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E11D48',
  },
  boxInlineError: {
    color: '#E11D48',
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
