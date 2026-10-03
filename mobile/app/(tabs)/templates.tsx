import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SearchBar } from '../../components/SearchBar';
import { PromptCard } from '../../components/PromptCard';
import { EmptyState } from '../../components/EmptyState';
import { PromptCardSkeleton } from '../../components/Skeleton';
import { BannerAd } from '../../components/BannerAd';
import { usePrompts } from '../../hooks/usePrompts';
import { useAdConfig } from '../../hooks/useAdConfig';
import { Theme } from '../../constants/Theme';

export default function TemplatesScreen() {
  const [filterQuery, setFilterQuery] = useState('');
  const { data: adConfig } = useAdConfig();

  const { data: promptsData, isLoading, refetch, isRefetching } = usePrompts(
    filterQuery.trim() ? { search: filterQuery.trim() } : undefined
  );

  const templates = promptsData?.data || [];
  const total = promptsData?.total || 0;

  return (
    <ScreenContainer noPadding>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Find and explore AI prompt templates</Text>
      </View>

      {/* Filter / Search Bar */}
      <View style={styles.searchBarWrapper}>
        <SearchBar
          value={filterQuery}
          onSearch={(text) => setFilterQuery(text)}
          placeholder="Search prompts (e.g. coding, marketing, midjourney)..."
        />
      </View>

      {/* Count Strip */}
      <View style={styles.countStrip}>
        <Text style={styles.countTitle}>
          {filterQuery.trim() ? `Filtered Templates` : 'All Prompt Templates'}
        </Text>
        <Text style={styles.countBadge}>{total} template{total === 1 ? '' : 's'}</Text>
      </View>

      {/* Templates List */}
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
        {isLoading ? (
          <View style={styles.skeletonGrid}>
            <PromptCardSkeleton grid portrait />
            <PromptCardSkeleton grid portrait />
            <PromptCardSkeleton grid portrait />
            <PromptCardSkeleton grid portrait />
          </View>
        ) : templates.length > 0 ? (
          <>
            <View style={styles.gridList}>
              {templates.flatMap((item, index) => {
                const items = [
                  <PromptCard key={`tmpl-${item.id}`} prompt={item} grid portrait />
                ];
                if ((index + 1) % 8 === 0) {
                  items.push(
                    <View key={`tmpl-ad-${index}`} style={styles.inFeedAdContainer}>
                      <BannerAd placement="in-feed" unitId={adConfig?.feed_ad_unit_id} />
                    </View>
                  );
                }
                return items;
              })}
            </View>
            <BannerAd placement="templates_bottom" />
          </>
        ) : (
          <EmptyState
            icon="layers-outline"
            title="No Templates Found"
            message={
              filterQuery.trim()
                ? `No templates matched "${filterQuery.trim()}". Try a different keyword.`
                : 'No prompt templates available at the moment.'
            }
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  searchBarWrapper: {
    marginTop: 8,
  },
  countStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  countTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  countBadge: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl + 24,
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
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
