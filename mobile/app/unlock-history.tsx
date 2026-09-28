import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { PromptCard } from '../components/PromptCard';
import { EmptyState } from '../components/EmptyState';
import { UnlockStorage } from '../services/storage';
import { promptsService } from '../services/prompts';
import { Theme } from '../constants/Theme';
import { PromptSummary } from '../types';

export default function UnlockHistoryScreen() {
  const router = useRouter();
  const [unlockedPrompts, setUnlockedPrompts] = useState<PromptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadUnlocked = async () => {
    try {
      const ids = await UnlockStorage.getUnlockedIds();
      if (ids.length === 0) {
        setUnlockedPrompts([]);
        setIsLoading(false);
        return;
      }

      // Fetch summaries for each unlocked prompt ID
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const p = await promptsService.getPromptById(id);
            const text = await UnlockStorage.getUnlockedText(id);
            return {
              ...p,
              is_locked: false,
              prompt_text: text || undefined,
            } as PromptSummary;
          } catch {
            return null;
          }
        })
      );

      setUnlockedPrompts(results.filter(Boolean) as PromptSummary[]);
    } catch (e) {
      console.warn('Failed to load unlocked prompts:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUnlocked();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadUnlocked();
  };

  return (
    <ScreenContainer noPadding>
      <View style={styles.header}>
        <Text style={styles.title}>Unlocked Prompts</Text>
        <Text style={styles.subtitle}>
          {unlockedPrompts.length} prompt{unlockedPrompts.length === 1 ? '' : 's'} unlocked on this device
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : unlockedPrompts.length === 0 ? (
        <EmptyState
          icon="lock-open-outline"
          title="No unlocked prompts yet."
          message="Discover prompts on the Home screen and tap Unlock to watch a short ad and reveal full prompt text."
          actionLabel="Explore Prompts"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={unlockedPrompts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PromptCard prompt={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
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
  listContent: {
    padding: Theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
});
