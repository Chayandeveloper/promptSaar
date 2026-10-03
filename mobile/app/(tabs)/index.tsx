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
import { SocialChannels } from '../../components/SocialChannels';
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
import { useAdConfig } from '../../hooks/useAdConfig';
import { Theme } from '../../constants/Theme';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: adConfig } = useAdConfig();

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
      {/* Fixed Header */}
      <Header />

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
                <PromptCardSkeleton grid portrait />
                <PromptCardSkeleton grid portrait />
                <PromptCardSkeleton grid portrait />
                <PromptCardSkeleton grid portrait />
              </View>
            ) : searchData?.data && searchData.data.length > 0 ? (
              <View style={styles.gridList}>
                {searchData.data.flatMap((item, index) => {
                  const items = [
                    <PromptCard key={`search-${item.id}`} prompt={item} grid portrait />
                  ];
                  if ((index + 1) % 8 === 0) {
                    items.push(
                      <View key={`search-ad-${index}`} style={styles.inFeedAdContainer}>
                        <BannerAd placement="in-feed" unitId={adConfig?.feed_ad_unit_id} />
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

            {/* Social Redirect Buttons: WhatsApp, Instagram, Telegram */}
            <SocialChannels />

            {/* AdMob Banner placement (Medium Rectangle Ad) */}
            <BannerAd placement="home_top" size="medium_rectangle" />

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
                  <PromptCardSkeleton grid portrait />
                  <PromptCardSkeleton grid portrait />
                  <PromptCardSkeleton grid portrait />
                  <PromptCardSkeleton grid portrait />
                </View>
              ) : recentData && recentData.length > 0 ? (
                <View style={styles.gridList}>
                  {recentData.flatMap((item, index) => {
                    const items = [
                      <PromptCard key={`recent-${item.id}`} prompt={item} grid portrait />
                    ];
                    if ((index + 1) % 8 === 0) {
                      items.push(
                        <View key={`recent-ad-${index}`} style={styles.inFeedAdContainer}>
                          <BannerAd placement="in-feed" unitId={adConfig?.feed_ad_unit_id} />
                        </View>
                      );
                    }
                    return items;
                  })}
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
    paddingTop: Theme.spacing.sm,
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
  inFeedAdContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.sm,
  },
});
