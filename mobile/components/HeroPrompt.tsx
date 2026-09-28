import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PromptSummary } from '../types';
import { Theme } from '../constants/Theme';

interface HeroPromptProps {
  prompt?: PromptSummary;
  onExplorePress?: () => void;
}

export const HeroPrompt: React.FC<HeroPromptProps> = ({ prompt, onExplorePress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (prompt) {
      router.push(`/prompt/${prompt.id}` as any);
    } else if (onExplorePress) {
      onExplorePress();
    }
  };

  const bgImage =
    prompt?.cover_image ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80';

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity activeOpacity={0.92} onPress={handlePress} style={styles.card}>
        {/* Background Image */}
        <Image source={{ uri: bgImage }} style={styles.image} resizeMode="cover" />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(9, 13, 22, 0.4)', 'rgba(9, 13, 22, 0.95)']}
          style={styles.gradient}
        />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={11} color="#C7D2FE" />
              <Text style={styles.badgeText}>
                {prompt ? 'FEATURED PROMPT' : 'CREATE BETTER WITH AI'}
              </Text>
            </View>

            {prompt?.is_locked && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={11} color="#FBBF24" />
                <Text style={styles.lockBadgeText}>Ad Reward</Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {prompt ? prompt.title : 'Discover powerful prompts for ChatGPT, Gemini and more.'}
          </Text>

          <View style={styles.ctaRow}>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>
                {prompt ? 'View & Unlock' : 'Explore Prompts'}
              </Text>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </View>
            {prompt?.category && (
              <Text style={styles.categoryTag}>{prompt.category.name}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  card: {
    height: 240,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    elevation: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.4)',
  },
  badgeText: {
    color: '#E0E7FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  lockBadgeText: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
    lineHeight: 23,
    marginBottom: Theme.spacing.sm + 2,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.md,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTag: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
