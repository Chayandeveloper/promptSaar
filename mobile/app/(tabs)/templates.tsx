import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
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
  const [searchInput, setSearchInput] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: adConfig } = useAdConfig();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilterQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
  const gridTemplates = templates;

  return (
    <ScreenContainer noPadding>
      {/* Compact Top Bar */}
      <View style={styles.header}>
        {/* Title + Badge + Count in a single compact row */}
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Templates</Text>
            <View style={styles.capcutBadge}>
              <Ionicons name="film" size={10} color="#FFFFFF" />
              <Text style={styles.capcutBadgeText}>CAPCUT</Text>
            </View>
            <View style={styles.liveDot} />
          </View>

          <View style={styles.countPill}>
            <Text style={styles.countBadge}>
              {total} {total === 1 ? 'preset' : 'presets'}
            </Text>
          </View>
        </View>

        {/* Compact Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={15} color={Theme.colors.primary} />
          <TextInput
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Search templates (beat sync, slowmo, reel)..."
            placeholderTextColor={Theme.colors.textMuted}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSearchInput('');
                setFilterQuery('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={15} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          )}
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
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  capcutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0055',
    paddingHorizontal: 6.5,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3.5,
  },
  capcutBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  countPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  countBadge: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    paddingHorizontal: 11,
    height: 36,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: Theme.spacing.md,
    marginBottom: 8,
    gap: 7,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 12.5,
    paddingVertical: 0,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Theme.spacing.md,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: 10,
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
