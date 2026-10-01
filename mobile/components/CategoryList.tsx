import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Category } from '../types';
import { CategoryCard } from './CategoryCard';
import { Theme } from '../constants/Theme';

interface CategoryListProps {
  categories: Category[];
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
       
        <Text style={styles.countBadge}>{categories.length} available</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm + 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  countBadge: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.md,
  },
});
