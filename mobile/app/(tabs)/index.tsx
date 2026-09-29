import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Header } from '../../components/Header';
import { HeroPrompt } from '../../components/HeroPrompt';
import { CategoryList } from '../../components/CategoryList';
import { PromptCard } from '../../components/PromptCard';
import { SearchBar } from '../../components/SearchBar';
import { BannerAd } from '../../components/BannerAd';
import { HeroSkeleton, PromptCardSkeleton, CategorySkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import {
  useFeaturedPrompts,
  useRecentPrompts,
  usePrompts,
} from '../../hooks/usePrompts';
import { useBanners } from '../../hooks/useBanners';
import { useCategories } from '../../hooks/useCategories';
import { Theme } from '../../constants/Theme';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const { data: bannersData, isLoading: isBannersLoading, refetch: refetchBanners } = useBanners();
  const { data: featuredData, isLoading: isFeaturedLoading, refetch: refetchFeatured } = useFeaturedPrompts();
  const { data: recentData, isLoading: isRecentLoading, refetch: refetchRecent } = useRecentPrompts();
  const { data: categoriesData, isLoading: isCatLoading, refetch: refetchCategories } = useCategories();
  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = usePrompts(searchQuery ? { search: searchQuery } : undefined);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchBanners(),
      refetchFeatured(),
      refetchRecent(),
      refetchCategories(),
      searchQuery ? refetchSearch() : Promise.resolve(),
    ]);
    setIsRefreshing(false);
  };

  const featuredPrompt = featuredData && featuredData.length > 0 ? featuredData[0] : undefined;

  return (
    <ScreenContainer noPadding>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primaryLight}
            colors={[Theme.colors.primary]}
          />
        }
      >
        {/* Header */}
        <Header />

        {/* Search Bar */}
        <SearchBar
          onSearch={(text) => setSearchQuery(text)}
          placeholder="Search prompts (e.g. cinematic, python, saas)..."
        />

        {/* If searching, display search results directly */}
        {searchQuery.trim().length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Search Results ({searchData?.total || 0})
              </Text>
            </View>

            {isSearchLoading ? (
              <View style={styles.gridList}>
                <PromptCardSkeleton grid />
                <PromptCardSkeleton grid />
                <PromptCardSkeleton grid />
                <PromptCardSkeleton grid />
              </View>
            ) : searchData?.data && searchData.data.length > 0 ? (
              <View style={styles.gridList}>
                {searchData.data.map((item) => (
                  <PromptCard key={item.id} prompt={item} grid />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="search-outline"
                title="No Prompts Found"
                message={`No AI prompts matched "${searchQuery}". Try a different keyword or explore categories.`}
              />
            )}
          </View>
        ) : (
          <>
            {/* Dynamic Hero Carousel Section */}
            {isBannersLoading && isFeaturedLoading ? (
              <HeroSkeleton />
            ) : (
              <HeroPrompt banners={bannersData} prompt={featuredPrompt} />
            )}

            {/* AdMob Banner placement */}
            <BannerAd placement="home_top" />

            {/* Horizontally scrollable Categories */}
            {isCatLoading ? (
              <View style={styles.categoriesSkeletonRow}>
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </View>
            ) : categoriesData && categoriesData.length > 0 ? (
              <CategoryList categories={categoriesData} />
            ) : null}

            {/* Recently Added Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.titleWithIcon}>
                  <Text style={styles.fireEmoji}>✨</Text>
                  <Text style={styles.sectionTitle}>Recently Added</Text>
                </View>
                <Text style={styles.sectionSub}>Fresh from our engineers</Text>
              </View>

              {isRecentLoading ? (
                <View style={styles.gridList}>
                  <PromptCardSkeleton grid />
                  <PromptCardSkeleton grid />
                  <PromptCardSkeleton grid />
                  <PromptCardSkeleton grid />
                </View>
              ) : recentData && recentData.length > 0 ? (
                <View style={styles.gridList}>
                  {recentData.map((item) => (
                    <PromptCard key={item.id} prompt={item} grid />
                  ))}
                </View>
              ) : (
                <EmptyState
                  title="No Prompts Yet"
                  message="Check back soon for freshly published AI prompts."
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Theme.spacing.xxl + 24,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm + 2,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fireEmoji: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
  },
  verticalList: {
    paddingHorizontal: Theme.spacing.md,
  },
  skeletonList: {
    paddingHorizontal: Theme.spacing.md,
  },
  categoriesSkeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
});
