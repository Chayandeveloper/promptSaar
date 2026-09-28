import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SearchBar } from '../../components/SearchBar';
import { PromptCard } from '../../components/PromptCard';
import { EmptyState } from '../../components/EmptyState';
import { PromptCardSkeleton } from '../../components/Skeleton';
import { BannerAd } from '../../components/BannerAd';
import { usePrompts } from '../../hooks/usePrompts';
import { Theme } from '../../constants/Theme';

export default function TemplatesScreen() {
  const [filterQuery, setFilterQuery] = useState('');

  const { data: promptsData, isLoading, refetch, isRefetching } = usePrompts(
    filterQuery.trim() ? { search: filterQuery.trim() } : undefined
  );

  const templates = promptsData?.data || [];
  const total = promptsData?.total || 0;

  return (
    <ScreenContainer noPadding>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Templates</Text>
        <Text style={styles.subtitle}>Curated ready-to-use AI prompt templates</Text>
      </View>

      {/* Filter / Search Bar */}
      <View style={styles.searchBarWrapper}>
        <SearchBar
          value={filterQuery}
          onSearch={(text) => setFilterQuery(text)}
          placeholder="Filter templates (e.g. coding, marketing, midjourney)..."
        />
      </View>

      {/* Count Strip */}
      <View style={styles.countStrip}>
        <Text style={styles.countTitle}>
          {filterQuery.trim() ? `Filtered Templates` : 'All Prompt Templates'}
        </Text>
        <Text style={styles.countBadge}>{total} template{total === 1 ? '' : 's'}</Text>
      </View>

      {/* Templates List (2 in each row) */}
      <FlatList
        data={templates}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <PromptCard prompt={item} grid />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Theme.colors.primaryLight}
          />
        }
        ListFooterComponent={<BannerAd placement="templates_bottom" />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonGrid}>
              <PromptCardSkeleton grid />
              <PromptCardSkeleton grid />
              <PromptCardSkeleton grid />
              <PromptCardSkeleton grid />
            </View>
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
          )
        }
      />
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
  row: {
    justifyContent: 'space-between',
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl + 24,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
