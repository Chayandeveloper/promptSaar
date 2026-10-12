import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Template } from '../types';
import { Theme } from '../constants/Theme';
import { resolveMediaUrl } from '../utils/url';
import { adService } from '../services/ads';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 2 column grid with padding
const CARD_WIDTH = (SCREEN_WIDTH - Theme.spacing.md * 2 - Theme.spacing.sm) / 2;
// 9:16 aspect ratio
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

interface TemplateCardProps {
  template: Template;
  featured?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, featured }) => {
  const router = useRouter();

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    adService.presentInterstitialOnTemplateClick(() => {
      router.push({
        pathname: '/template/[id]',
        params: {
          id: template.id.toString(),
          initialVideoUrl: template.video_url,
          initialThumbnail: template.thumbnail_url,
          initialTitle: template.title,
          initialCategory: template.category,
          initialIsVn: template.is_vn ? 'true' : 'false',
          initialVnImageUrl: template.vn_image_url || '',
        },
      } as any);
    });
  };

  const formatUses = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const resolvedThumb = resolveMediaUrl(template.thumbnail_url);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[styles.card, featured && styles.cardFeatured]}
    >
      {/* 9:16 Thumbnail Background */}
      <Image
        source={{ uri: resolvedThumb }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Modern Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />

      {/* Top Header Strip: CapCut Badge, VN Badge & Duration */}
      <View style={styles.topStrip}>
        <View style={styles.badgeGroup}>
          <View style={styles.capcutBadge}>
            <Ionicons name="film-outline" size={11} color="#FFFFFF" />
            <Text style={styles.capcutText}>CapCut</Text>
          </View>
          {template.is_vn ? (
            <View style={styles.vnBadge}>
              <Ionicons name="image-outline" size={10} color="#FFFFFF" />
              <Text style={styles.vnBadgeText}>VN CODE</Text>
            </View>
          ) : null}
        </View>

        {template.duration ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{template.duration}</Text>
          </View>
        ) : null}
      </View>

      {/* Center Floating Play Button */}
      <View style={styles.playCenter}>
        <View style={styles.playButton}>
          <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </View>
      </View>

      {/* Bottom Content Info */}
      <View style={styles.bottomContent}>
        {template.category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{template.category}</Text>
          </View>
        ) : null}

        <Text style={styles.title} numberOfLines={2}>
          {template.title}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.usesStat}>
            <Text style={styles.flameIcon}>🔥</Text>
            <Text style={styles.usesText}>{formatUses(template.use_count)} uses</Text>
          </View>
          <View style={styles.ctaMini}>
            <Text style={styles.ctaMiniText}>USE</Text>
            <Ionicons name="chevron-forward" size={11} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1E1E2E',
    marginBottom: Theme.spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cardFeatured: {
    width: SCREEN_WIDTH - Theme.spacing.md * 2,
    height: (SCREEN_WIDTH - Theme.spacing.md * 2) * 0.75,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  topStrip: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  capcutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
    gap: 3.5,
  },
  vnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 51, 234, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRadius: 12,
    gap: 3,
  },
  vnBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  capcutText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  playCenter: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    zIndex: 2,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 16.5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usesStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  flameIcon: {
    fontSize: 10,
  },
  usesText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
  },
  ctaMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3366',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 1,
  },
  ctaMiniText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
