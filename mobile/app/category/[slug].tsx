import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PromptCard } from '../../components/PromptCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState } from '../../components/EmptyState';
import { PromptCardSkeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/ErrorState';
import { BannerAd } from '../../components/BannerAd';
import { useCategoryPrompts } from '../../hooks/usePrompts';
import { useAdConfig } from '../../hooks/useAdConfig';
import { Theme } from '../../constants/Theme';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const categorySlug = slug as string;

  const [search, setSearch] = useState('');
  const { data: adConfig } = useAdConfig();
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
    <ScreenContainer noPadding edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Theme.colors.primaryLight}
          />
        }
      >
        <View style={styles.headerContainer}>
          {/* Category Banner */}
          {category && (
            <LinearGradient
              colors={['#E11D48', '#BE123C']}
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

        {isLoading ? (
          <View style={styles.gridList}>
            <PromptCardSkeleton grid portrait />
            <PromptCardSkeleton grid portrait />
            <PromptCardSkeleton grid portrait />
            <PromptCardSkeleton grid portrait />
          </View>
        ) : prompts.length > 0 ? (
          <View style={styles.gridList}>
            {prompts.flatMap((item, index) => {
              const items = [
                <PromptCard key={`cat-prompt-${item.id}`} prompt={item} grid portrait />
              ];
              if ((index + 1) % 8 === 0) {
                items.push(
                  <View key={`cat-ad-${index}`} style={styles.inFeedAdContainer}>
                    <BannerAd
                      placement="in-feed"
                      size="medium_rectangle"
                      unitId={adConfig?.feed_ad_unit_id}
                    />
                  </View>
                );
              }
              return items;
            })}
          </View>
        ) : (
          <EmptyState
            icon="search-outline"
            title="No Prompts Found"
            message={`No prompts match your query in this category.`}
          />
        )}
      </ScrollView>
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
    padding: Theme.spacing.lg,
    shadowColor: '#E11D48',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
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
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginBottom: 8,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inFeedAdContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
  },
});
