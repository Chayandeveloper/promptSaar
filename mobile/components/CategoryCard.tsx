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
        return { color: '#E11D48', bg: 'rgba(225, 29, 72, 0.08)', border: 'rgba(225, 29, 72, 0.25)' };
      case 'image':
      case 'video':
        return { color: '#E11D48', bg: 'rgba(225, 29, 72, 0.08)', border: 'rgba(225, 29, 72, 0.25)' };
      case 'feather':
      case 'book-open':
        return { color: '#FF7A00', bg: 'rgba(255, 122, 0, 0.08)', border: 'rgba(255, 122, 0, 0.25)' };
      case 'briefcase':
      case 'trending-up':
        return { color: '#FF7A00', bg: 'rgba(255, 122, 0, 0.08)', border: 'rgba(255, 122, 0, 0.25)' };
      default:
        return { color: '#E11D48', bg: 'rgba(225, 29, 72, 0.08)', border: 'rgba(225, 29, 72, 0.25)' };
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
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
  },
  count: {
    fontSize: 10,
    fontWeight: '700',
  },
});
