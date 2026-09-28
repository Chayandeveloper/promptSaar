import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';
import { PromptSummary } from '../types';
import { useToggleSavePrompt } from '../hooks/usePrompts';

interface PromptCardProps {
  prompt: PromptSummary;
  horizontal?: boolean;
  grid?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  horizontal = false,
  grid = false,
}) => {
  const router = useRouter();
  const toggleSave = useToggleSavePrompt();

  const handlePress = () => {
    router.push(`/prompt/${prompt.id}` as any);
  };

  const handleSavePress = (e: any) => {
    e.stopPropagation?.();
    toggleSave.mutate({ prompt, isSaved: Boolean(prompt.is_saved) });
  };

  const handleSharePress = async (e: any) => {
    e.stopPropagation?.();
    try {
      await Share.share({
        title: prompt.title,
        message: `Check out this AI Prompt: "${prompt.title}"\nPromptCraft AI`,
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
      <View style={[styles.imageContainer, grid && styles.imageContainerGrid]}>
        <Image
          source={{ uri: prompt.cover_image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Lock Overlay / Badge */}
        <View style={[styles.topBadgeRow, grid && styles.topBadgeRowGrid]}>
          {prompt.is_locked ? (
            <View style={styles.lockPill}>
              <Ionicons name="lock-closed" size={grid ? 8 : 10} color="#FBBF24" />
              <Text style={[styles.lockText, grid && styles.lockTextGrid]}>
                🪙 {prompt.unlock_cost || 30}
              </Text>
            </View>
          ) : (
            <View style={styles.unlockedPill}>
              <Ionicons name="checkmark-circle" size={grid ? 8 : 10} color="#34D399" />
              <Text style={[styles.unlockedText, grid && styles.unlockedTextGrid]}>
                Unlocked
              </Text>
            </View>
          )}

          {/* Bookmark Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSavePress}
            style={[styles.saveButton, grid && styles.saveButtonGrid]}
          >
            <Ionicons
              name={prompt.is_saved ? 'bookmark' : 'bookmark-outline'}
              size={grid ? 12 : 14}
              color={prompt.is_saved ? Theme.colors.primaryLight : '#E2E8F0'}
            />
          </TouchableOpacity>
        </View>

        {/* Trending pill */}
        {prompt.is_trending && (
          <View style={[styles.trendingPill, grid && styles.trendingPillGrid]}>
            <Ionicons name="flame" size={grid ? 8 : 10} color="#F87171" />
            <Text style={[styles.trendingText, grid && styles.trendingTextGrid]}>
              Trending
            </Text>
          </View>
        )}
      </View>

      {/* Info Container */}
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
              color={Theme.colors.primaryLight}
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
              color={prompt.is_locked ? '#FBBF24' : Theme.colors.success}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
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
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  lockText: {
    color: '#FDE68A',
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
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  unlockedText: {
    color: '#A7F3D0',
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  trendingPillGrid: {
    bottom: 6,
    left: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  trendingText: {
    color: '#FECACA',
    fontSize: 9,
    fontWeight: '700',
  },
  trendingTextGrid: {
    fontSize: 8.5,
  },
  infoContainer: {
    padding: Theme.spacing.sm + 4,
  },
  infoContainerGrid: {
    padding: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: Theme.colors.primaryLight,
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
});
