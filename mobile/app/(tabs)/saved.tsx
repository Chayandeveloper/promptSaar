import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PromptCard } from '../../components/PromptCard';
import { EmptyState } from '../../components/EmptyState';
import { PromptCardSkeleton } from '../../components/Skeleton';
import { useSavedPrompts } from '../../hooks/usePrompts';
import { Theme } from '../../constants/Theme';

export default function SavedScreen() {
  const router = useRouter();
  const { data: savedPrompts = [], isLoading, refetch, isRefetching } = useSavedPrompts();

  return (
    <ScreenContainer noPadding>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Prompts</Text>
        <Text style={styles.subtitle}>
          {savedPrompts.length} prompt{savedPrompts.length === 1 ? '' : 's'} bookmarked on this device
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.skeletonGrid}>
          <PromptCardSkeleton grid portrait />
          <PromptCardSkeleton grid portrait />
          <PromptCardSkeleton grid portrait />
          <PromptCardSkeleton grid portrait />
        </View>
      ) : savedPrompts.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="No saved prompts yet."
          message="Explore prompts and tap the bookmark icon on any prompt for quick access anytime."
          actionLabel="Explore Prompts"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={savedPrompts}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <PromptCard prompt={item} grid portrait />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Theme.colors.primaryLight}
            />
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
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
  row: {
    justifyContent: 'space-between',
  },
  listContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl + 24,
  },
  skeletonGrid: {
    padding: Theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
