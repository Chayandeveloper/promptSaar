import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PromptCard } from '../../components/PromptCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { PromptCardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { useCategoryPrompts } from '../../hooks/usePrompts';
import { Theme } from '../../constants/Theme';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const categorySlug = slug as string;

  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch, isRefetching } = useCategoryPrompts(
    categorySlug,
    search ? { search } : undefined
  );

  const category = data?.category;
  const prompts = data?.prompts?.data || [];

  if (error) {
    return (
      <ScreenContainer>
        <ErrorState
          message="Could not load category prompts. Please check your connection."
          onRetry={refetch}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noPadding>
      <FlatList
        data={prompts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PromptCard prompt={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Theme.colors.primaryLight}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Category Banner without photos */}
            {category && (
              <LinearGradient
                colors={['#1E1B4B', '#0F172A', '#080B11']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bannerCard}
              >
                <Text style={styles.categoryTitle}>{category.name}</Text>
                {category.description && (
                  <Text style={styles.categoryDesc}>{category.description}</Text>
                )}
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {data?.prompts?.total || 0} Prompts Available
                  </Text>
                </View>
              </LinearGradient>
            )}

            {/* In-category Search */}
            <SearchBar
              onSearch={setSearch}
              placeholder={`Search in ${category?.name || 'this category'}...`}
            />

            <View style={styles.promptsHeader}>
              <Text style={styles.promptsTitle}>Prompts</Text>
              <Text style={styles.promptsSubtitle}>
                {data?.prompts?.total || 0} results
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonBox}>
              <PromptCardSkeleton />
              <PromptCardSkeleton />
              <PromptCardSkeleton />
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title="No Prompts Found"
              message={`No prompts match your query in this category.`}
            />
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  headerContainer: {
    marginBottom: Theme.spacing.md,
  },
  bannerCard: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
    marginBottom: 8,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C7D2FE',
  },
  promptsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  promptsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  promptsSubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  skeletonBox: {
    gap: 12,
  },
});
