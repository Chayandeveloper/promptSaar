import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PromptSummary, Banner } from '../types';
import { Theme } from '../constants/Theme';

interface HeroPromptProps {
  banners?: Banner[];
  banner?: Banner | null;
  prompt?: PromptSummary;
  onExplorePress?: () => void;
}

type HeroItem =
  | { type: 'banner'; data: Banner }
  | { type: 'prompt'; data: PromptSummary };

export const HeroPrompt: React.FC<HeroPromptProps> = ({
  banners,
  banner,
  prompt,
  onExplorePress,
}) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;

  // Build items array
  let items: HeroItem[] = [];
  if (banners && banners.length > 0) {
    items = banners.map((b) => ({ type: 'banner', data: b }));
  } else if (banner) {
    items = [{ type: 'banner', data: banner }];
  } else if (prompt) {
    items = [{ type: 'prompt', data: prompt }];
  }

  // Auto-advance carousel every 4.5 seconds if multiple items
  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % items.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [items.length]);

  const handlePress = (item: HeroItem) => {
    if (item.type === 'banner') {
      const b = item.data;
      const targetPrompt = b.prompt;
      if (b.action_type === 'prompt' && (b.prompt_id || targetPrompt?.id)) {
        router.push(`/prompt/${b.prompt_id || targetPrompt?.id}` as any);
      } else if (b.action_type === 'category' && b.category_slug) {
        router.push(`/category/${b.category_slug}` as any);
      } else if (b.action_type === 'url' && b.target_url) {
        Linking.openURL(b.target_url).catch(() => {});
      } else if (targetPrompt) {
        router.push(`/prompt/${targetPrompt.id}` as any);
      } else if (onExplorePress) {
        onExplorePress();
      }
    } else {
      router.push(`/prompt/${item.data.id}` as any);
    }
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / screenWidth);
    if (newIndex >= 0 && newIndex < items.length) {
      setActiveIndex(newIndex);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const renderCard = (item: HeroItem) => {
    let bgImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80';
    let badgeText = 'CREATE BETTER WITH AI';
    let title = 'Discover powerful prompts for ChatGPT, Gemini and more.';
    let ctaText = 'Explore Prompts';
    let categoryName: string | undefined;
    let isLocked = false;

    if (item.type === 'banner') {
      const b = item.data;
      const targetPrompt = b.prompt;
      bgImage = b.image_url || targetPrompt?.cover_image || bgImage;
      badgeText = b.badge_text || (targetPrompt ? 'FEATURED PROMPT' : 'CREATE BETTER WITH AI');
      title = b.title || targetPrompt?.title || title;
      ctaText = b.cta_text || (targetPrompt ? 'View & Unlock' : 'Explore Prompts');
      categoryName = b.category_name || targetPrompt?.category?.name;
      isLocked = Boolean(b.action_type === 'prompt' && (targetPrompt ? targetPrompt.is_locked : true));
    } else {
      const p = item.data;
      bgImage = p.cover_image || bgImage;
      badgeText = 'FEATURED PROMPT';
      title = p.title || title;
      ctaText = 'View & Unlock';
      categoryName = p.category?.name;
      isLocked = Boolean(p.is_locked);
    }

    return (
      <View style={[styles.slideContainer, { width: screenWidth }]}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => handlePress(item)}
          style={styles.card}
        >
          {/* Background Image */}
          <Image source={{ uri: bgImage }} style={styles.image} resizeMode="cover" />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(17, 24, 39, 0.35)', 'rgba(17, 24, 39, 0.92)']}
            style={styles.gradient}
          />

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>

              {isLocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
                  <Text style={styles.lockBadgeText}>Ad Reward</Text>
                </View>
              )}
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            <View style={styles.ctaRow}>
              <LinearGradient
                colors={['#E11D48', '#FF7A00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>{ctaText}</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
              </LinearGradient>
              {categoryName ? (
                <Text style={styles.categoryTag}>{categoryName}</Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.outerWrapper}>
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item, index) => `${item.type}-${item.data.id || index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 150);
        }}
        renderItem={({ item }) => renderCard(item)}
      />

      {/* Pagination Indicator Dots */}
      {items.length > 1 && (
        <View style={styles.paginationRow}>
          {items.map((_, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setActiveIndex(i);
              }}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: Theme.spacing.md,
  },
  slideContainer: {
    paddingHorizontal: Theme.spacing.md,
  },
  card: {
    height: 240,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(225, 29, 72, 0.35)',
    elevation: 6,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
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
    backgroundColor: 'rgba(225, 29, 72, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#E11D48',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 122, 0, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  lockBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    elevation: 4,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTag: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '600',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Theme.colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E5E7EB',
  },
});
