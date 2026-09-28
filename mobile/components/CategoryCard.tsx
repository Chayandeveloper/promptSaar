import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

  const getIconName = (icon?: string): any => {
    switch (icon) {
      case 'image':
        return 'image-outline';
      case 'code':
        return 'code-slash-outline';
      case 'feather':
        return 'create-outline';
      case 'trending-up':
        return 'trending-up-outline';
      case 'briefcase':
        return 'briefcase-outline';
      case 'book-open':
        return 'book-outline';
      case 'share-2':
        return 'share-social-outline';
      case 'check-circle':
        return 'checkmark-done-circle-outline';
      case 'video':
        return 'videocam-outline';
      case 'layers':
        return 'layers-outline';
      default:
        return 'sparkles-outline';
    }
  };

  const getCategoryTheme = (icon?: string) => {
    switch (icon) {
      case 'code':
        return { color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)' };
      case 'image':
      case 'video':
        return { color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'feather':
      case 'book-open':
        return { color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)' };
      case 'briefcase':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'trending-up':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.15)', border: 'rgba(129, 140, 248, 0.3)' };
    }
  };

  const catTheme = getCategoryTheme(category.icon);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={[styles.pill, compact && styles.pillCompact, { borderColor: catTheme.border }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: catTheme.bg }]}>
        <Ionicons name={getIconName(category.icon)} size={14} color={catTheme.color} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
      {category.prompts_count !== undefined && (
        <View style={styles.countBadge}>
          <Text style={[styles.count, { color: catTheme.color }]}>{category.prompts_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceElevated,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    gap: 8,
  },
  pillCompact: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.1,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
  },
  count: {
    fontSize: 10,
    fontWeight: '700',
  },
});
