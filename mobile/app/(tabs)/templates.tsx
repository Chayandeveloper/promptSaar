import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SearchBar } from '../../components/SearchBar';
import { TemplateCard } from '../../components/TemplateCard';
import { EmptyState } from '../../components/EmptyState';
import { BannerAd } from '../../components/BannerAd';
import { useTemplates } from '../../hooks/useTemplates';
import { useAdConfig } from '../../hooks/useAdConfig';
import { Theme } from '../../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Trending',
  'Reels',
  'Beat Sync',
  'Aesthetic',
  'Photo Dump',
  'Cinematic',
  'Velocity / SlowMo',
];

export default function TemplatesScreen() {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: adConfig } = useAdConfig();

  const {
    data: templatesData,
    isLoading,
    refetch,
    isRefetching,
  } = useTemplates({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    search: filterQuery.trim() ? filterQuery.trim() : undefined,
  });

  const templates = templatesData?.data || [];
  const total = templatesData?.total || 0;

  // Split featured / trending template for top spotlight
  const featuredTemplate = templates.find((t) => t.is_featured) || templates[0];
  const gridTemplates = templates;

  return (
    <ScreenContainer noPadding>
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.badgeRow}>
              <View style={styles.capcutBadge}>
                <Ionicons name="film" size={12} color="#FFFFFF" />
                <Text style={styles.capcutBadgeText}>CAPCUT PRESETS</Text>
              </View>
              <View style={styles.liveDot} />
            </View>
            <Text style={styles.title}>Video Templates</Text>
            <Text style={styles.subtitle}>
              Trending Instagram Reels & TikTok CapCut templates
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <SearchBar
            value={filterQuery}
            onSearch={(text) => setFilterQuery(text)}
            placeholder="Search templates (e.g. beat sync, slowmo, reel)..."
          />
        </View>

        {/* Horizontal Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count Strip */}
      <View style={styles.countStrip}>
        <Text style={styles.countTitle}>
          {selectedCategory !== 'All' ? `${selectedCategory} Templates` : 'All Templates'}
        </Text>
        <Text style={styles.countBadge}>
          {total} template{total === 1 ? '' : 's'}
        </Text>
      </View>

      {/* Templates Grid List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Theme.colors.primaryLight}
            colors={[Theme.colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
              </View>
            ))}
          </View>
        ) : gridTemplates.length > 0 ? (
          <>
            <View style={styles.gridList}>
              {gridTemplates.map((item, index) => {
                return (
                  <React.Fragment key={`tmpl-${item.id}`}>
                    <TemplateCard template={item} />
                    {(index + 1) % 6 === 0 && (
                      <View style={styles.inFeedAdContainer}>
                        <BannerAd
                          placement="in-feed"
                          size="medium_rectangle"
                          unitId={adConfig?.feed_ad_unit_id}
                        />
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
            </View>
            <BannerAd placement="templates_bottom" />
          </>
        ) : (
          <EmptyState
            icon="videocam-outline"
            title="No Templates Found"
            message={
              filterQuery.trim()
                ? `No templates found for "${filterQuery.trim()}". Try another keyword.`
                : 'No CapCut video templates available right now.'
            }
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const CARD_WIDTH = (SCREEN_WIDTH - Theme.spacing.md * 2 - Theme.spacing.sm) / 2;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  capcutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0055',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  capcutBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchBarWrapper: {
    marginTop: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFAFC',
  },
  countTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  countBadge: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl + 32,
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
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    marginBottom: Theme.spacing.sm + 4,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
});
