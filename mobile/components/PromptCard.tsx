import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { PromptSummary } from '../types';
import { useToggleSavePrompt, useSavedPrompts } from '../hooks/usePrompts';
import { adService } from '../services/ads';

interface PromptCardProps {
  prompt: PromptSummary;
  horizontal?: boolean;
  grid?: boolean;
  portrait?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  horizontal = false,
  grid = false,
  portrait = false,
}) => {
  const router = useRouter();
  const toggleSave = useToggleSavePrompt();
  const { data: savedPrompts = [] } = useSavedPrompts();
  const isSaved = Boolean(prompt.is_saved) || savedPrompts.some((p) => p.id === prompt.id);

  const handlePress = () => {
    adService.presentInterstitialOnPromptClick(() => {
      router.push(`/prompt/${prompt.id}` as any);
    });
  };

  const handleSavePress = (e: any) => {
    e.stopPropagation?.();
    toggleSave.mutate({ prompt, isSaved });
  };

  const handleSharePress = async (e: any) => {
    e.stopPropagation?.();
    try {
      await Share.share({
        title: prompt.title,
        message: `Check out this AI Prompt: "${prompt.title}"\nPrompt Saar`,
      });
    } catch (error) {
      console.log('Error sharing prompt:', error);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[
        styles.card,
        horizontal
          ? styles.cardHorizontal
          : grid
            ? styles.cardGrid
            : styles.cardVertical,
      ]}
    >
      {/* Cover Image Container */}
      <View
        style={[
          styles.imageContainer,
          grid && styles.imageContainerGrid,
          portrait && styles.imageContainerPortrait,
        ]}
      >
        <Image
          source={{ uri: prompt.cover_image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Lock Overlay / Badge */}
        <View style={[styles.topBadgeRow, grid && styles.topBadgeRowGrid]}>
          {prompt.is_locked ? (
            <View style={styles.lockPill}>
              <Ionicons name="lock-closed" size={grid ? 10 : 12} color="#FF7A00" />
            </View>
          ) : (
            <View style={styles.unlockedPill}>
              <Ionicons name="checkmark-circle" size={grid ? 8 : 10} color="#10B981" />
              <Text style={[styles.unlockedText, grid && styles.unlockedTextGrid]}>
                Unlocked
              </Text>
            </View>
          )}

          {/* Bookmark Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSavePress}
            style={[
              styles.saveButton,
              grid && styles.saveButtonGrid,
              isSaved && styles.saveButtonActive,
            ]}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={grid ? 12 : 14}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Trending pill */}
        {prompt.is_trending && (
          <View
            style={[
              styles.trendingPill,
              grid && styles.trendingPillGrid,
              portrait && styles.trendingPillPortrait,
            ]}
          >
            <Ionicons name="flame" size={grid ? 8 : 10} color="#FFFFFF" />
            <Text style={[styles.trendingText, grid && styles.trendingTextGrid]}>
              Trending
            </Text>
          </View>
        )}

        {/* Portrait Mode: Bottom Gradient Overlay (fading away above) + Title & Share Button */}
        {portrait && (
          <>
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.45)', 'rgba(15, 23, 42, 0.94)']}
              locations={[0, 0.45, 1]}
              style={styles.portraitGradient}
            />
            <View style={styles.portraitBottomRow}>
              <Text style={styles.portraitTitle} numberOfLines={2}>
                {prompt.title}
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleSharePress}
                style={styles.portraitShareButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={15}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Info Container for non-portrait cards */}
      {!portrait && (
        <View style={[styles.infoContainer, grid && styles.infoContainerGrid]}>
          <View style={styles.categoryRow}>
            <Text
              style={[styles.categoryText, grid && styles.categoryTextGrid]}
              numberOfLines={1}
            >
              {prompt.category?.name || 'AI Prompt'}
            </Text>
            <View style={styles.statsRow}>
              <Ionicons name="eye-outline" size={grid ? 9 : 11} color={Theme.colors.textMuted} />
              <Text style={[styles.statsText, grid && styles.statsTextGrid]}>
                {prompt.views}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, grid && styles.titleGrid]} numberOfLines={2}>
            {prompt.title}
          </Text>

          <View style={styles.footerRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSharePress}
              style={styles.shareButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="share-social-outline"
                size={grid ? 12 : 14}
                color={Theme.colors.primary}
              />
              <Text style={[styles.shareText, grid && styles.shareTextGrid]}>Share</Text>
            </TouchableOpacity>

            <View style={styles.actionPromptText}>
              <Text style={[styles.actionPromptLabel, grid && styles.actionPromptLabelGrid]}>
                {prompt.is_locked ? `🪙 ${prompt.unlock_cost || 30}` : 'Open'}
              </Text>
              <Ionicons
                name={prompt.is_locked ? 'sparkles' : 'arrow-forward'}
                size={grid ? 10 : 12}
                color={prompt.is_locked ? '#FF7A00' : Theme.colors.primary}
              />
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardVertical: {
    marginBottom: Theme.spacing.md,
    width: '100%',
  },
  cardGrid: {
    width: '48.5%',
    marginBottom: 12,
  },
  cardHorizontal: {
    width: 250,
    marginRight: Theme.spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 135,
    position: 'relative',
    backgroundColor: Theme.colors.surfaceElevated,
  },
  imageContainerGrid: {
    height: 110,
  },
  imageContainerPortrait: {
    height: undefined,
    aspectRatio: 9 / 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBadgeRowGrid: {
    top: 6,
    left: 6,
    right: 6,
  },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.82)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.6)',
  },
  lockText: {
    color: '#FF7A00',
    fontSize: 10,
    fontWeight: '700',
  },
  lockTextGrid: {
    fontSize: 9,
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17, 24, 39, 0.82)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  unlockedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  unlockedTextGrid: {
    fontSize: 9,
  },
  saveButton: {
    width: 28,
    height: 28,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: 'rgba(17, 24, 39, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  saveButtonActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  saveButtonGrid: {
    width: 24,
    height: 24,
  },
  trendingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 122, 0, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  trendingPillGrid: {
    bottom: 6,
    left: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  trendingText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  trendingTextGrid: {
    fontSize: 8.5,
  },
  infoContainer: {
    padding: Theme.spacing.sm + 4,
    backgroundColor: '#FFFFFF',
  },
  infoContainerGrid: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: Theme.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryTextGrid: {
    fontSize: 9.5,
    maxWidth: '65%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statsText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  statsTextGrid: {
    fontSize: 9.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  titleGrid: {
    fontSize: 12.5,
    lineHeight: 16,
    height: 32,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: 6,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  shareText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  shareTextGrid: {
    fontSize: 9.5,
  },
  actionPromptText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  actionPromptLabelGrid: {
    fontSize: 9.5,
  },
  trendingPillPortrait: {
    bottom: 52,
  },
  portraitGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 85,
  },
  portraitBottomRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  portraitTitle: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  portraitShareButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});
