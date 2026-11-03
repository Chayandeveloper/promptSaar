import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { Theme } from '../constants/Theme';

interface CategoryCardProps {
  category: Category;
  compact?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, compact = false }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/category/${category.slug}` as any);
  };

  const resolveKey = () => {
    const raw = `${category.icon || ''} ${category.slug || ''} ${category.name || ''}`.toLowerCase();
    if (raw.includes('code') || raw.includes('dev') || raw.includes('tech')) return 'code';
    if (raw.includes('video') || raw.includes('reel') || raw.includes('cinematic') || raw.includes('film')) return 'video';
    if (raw.includes('boy') || raw.includes('men') || raw.includes('male') || raw.includes('man')) return 'male';
    if (raw.includes('girl') || raw.includes('women') || raw.includes('female') || raw.includes('woman')) return 'female';
    if (raw.includes('couple') || raw.includes('love') || raw.includes('wedding')) return 'couple';
    if (raw.includes('portrait') || raw.includes('photo') || raw.includes('camera') || raw.includes('real')) return 'photo';
    if (raw.includes('image') || raw.includes('art') || raw.includes('design') || raw.includes('anime') || raw.includes('3d')) return 'image';
    if (raw.includes('feather') || raw.includes('writ') || raw.includes('copy') || raw.includes('blog')) return 'writing';
    if (raw.includes('trend') || raw.includes('viral') || raw.includes('fire') || raw.includes('hot')) return 'trending';
    if (raw.includes('briefcase') || raw.includes('business') || raw.includes('market') || raw.includes('saas')) return 'business';
    if (raw.includes('book') || raw.includes('edu') || raw.includes('study') || raw.includes('learn')) return 'book';
    if (raw.includes('share') || raw.includes('social')) return 'social';
    if (raw.includes('layer') || raw.includes('template') || raw.includes('logo')) return 'layers';
    return 'default';
  };

  const getIconName = (key: string): any => {
    switch (key) {
      case 'code':
        return 'code-slash';
      case 'video':
        return 'film-outline';
      case 'male':
        return 'person-outline';
      case 'female':
        return 'sparkles-outline';
      case 'couple':
        return 'heart-outline';
      case 'photo':
        return 'camera-outline';
      case 'image':
        return 'color-palette-outline';
      case 'writing':
        return 'create-outline';
      case 'trending':
        return 'flame-outline';
      case 'business':
        return 'briefcase-outline';
      case 'book':
        return 'book-outline';
      case 'social':
        return 'share-social-outline';
      case 'layers':
        return 'layers-outline';
      default:
        return 'sparkles';
    }
  };

  const getCategoryTheme = (key: string) => {
    switch (key) {
      case 'trending':
      case 'couple':
      case 'female':
        return {
          color: '#E11D48',
          iconGradient: ['#FFE4E6', '#FECDD3'] as const,
          border: 'rgba(225, 29, 72, 0.16)',
          badgeBg: 'rgba(225, 29, 72, 0.08)',
        };
      case 'writing':
      case 'business':
      case 'video':
        return {
          color: '#EA580C',
          iconGradient: ['#FFEDD5', '#FED7AA'] as const,
          border: 'rgba(234, 88, 12, 0.16)',
          badgeBg: 'rgba(234, 88, 12, 0.08)',
        };
      case 'photo':
      case 'image':
      case 'layers':
        return {
          color: '#7C3AED',
          iconGradient: ['#F3E8FF', '#E9D5FF'] as const,
          border: 'rgba(124, 58, 237, 0.15)',
          badgeBg: 'rgba(124, 58, 237, 0.08)',
        };
      case 'code':
      case 'male':
      case 'social':
        return {
          color: '#0284C7',
          iconGradient: ['#E0F2FE', '#BAE6FD'] as const,
          border: 'rgba(2, 132, 199, 0.15)',
          badgeBg: 'rgba(2, 132, 199, 0.08)',
        };
      case 'book':
        return {
          color: '#059669',
          iconGradient: ['#D1FAE5', '#A7F3D0'] as const,
          border: 'rgba(5, 150, 105, 0.15)',
          badgeBg: 'rgba(5, 150, 105, 0.08)',
        };
      default:
        return {
          color: '#E11D48',
          iconGradient: ['#FFE4E6', '#FECDD3'] as const,
          border: 'rgba(225, 29, 72, 0.16)',
          badgeBg: 'rgba(225, 29, 72, 0.08)',
        };
    }
  };

  const key = resolveKey();
  const catTheme = getCategoryTheme(key);

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={handlePress}
      style={[
        styles.pill,
        compact && styles.pillCompact,
        { borderColor: catTheme.border },
      ]}
    >
      <LinearGradient
        colors={catTheme.iconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconContainer, compact && styles.iconContainerCompact]}
      >
        <Ionicons
          name={getIconName(key)}
          size={compact ? 10.5 : 11.5}
          color={catTheme.color}
        />
      </LinearGradient>

      <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={1}>
        {category.name}
      </Text>

      {category.prompts_count !== undefined && category.prompts_count > 0 && (
        <View style={[styles.countBadge, { backgroundColor: catTheme.badgeBg }]}>
          <Text style={[styles.count, { color: catTheme.color }]}>
            {category.prompts_count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.full,
    paddingLeft: 6,
    paddingRight: 11,
    paddingVertical: 5,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  pillCompact: {
    paddingLeft: 5,
    paddingRight: 9,
    paddingVertical: 4,
    marginRight: 6,
    gap: 5,
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerCompact: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  nameCompact: {
    fontSize: 11,
  },
  countBadge: {
    paddingHorizontal: 5.5,
    paddingVertical: 1.5,
    borderRadius: Theme.borderRadius.full,
    marginLeft: -1,
  },
  count: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
