import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsService } from '../services/rewards';
import { UnlockStorage } from '../services/storage';

export const REWARD_QUERY_KEYS = {
  COINS: ['user_coins'] as const,
  TODAY: ['today_rewards'] as const,
  CONFIG: ['reward_config'] as const,
  TRANSACTIONS: (page?: number) => ['coin_transactions', page] as const,
  UNLOCKED: ['unlocked_prompts'] as const,
};

/**
 * Hook to retrieve user's authoritative coin balance and lifetime totals.
 */
export function useCoinBalance() {
  return useQuery({
    queryKey: REWARD_QUERY_KEYS.COINS,
    queryFn: () => rewardsService.getCoins(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to retrieve user's today's reward ad progress and daily limit status.
 */
export function useTodayRewards() {
  return useQuery({
    queryKey: REWARD_QUERY_KEYS.TODAY,
    queryFn: () => rewardsService.getTodayRewardStatus(),
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to retrieve global reward configuration.
 */
export function useRewardConfig() {
  return useQuery({
    queryKey: REWARD_QUERY_KEYS.CONFIG,
    queryFn: () => rewardsService.getRewardConfig(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to retrieve user's coin ledger history.
 */
export function useCoinTransactions(page = 1) {
  return useQuery({
    queryKey: REWARD_QUERY_KEYS.TRANSACTIONS(page),
    queryFn: () => rewardsService.getCoinTransactions(page),
  });
}

/**
 * Mutation to claim coins after watching a rewarded ad.
 */
export function useClaimAdReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId?: string) => rewardsService.claimAdReward(eventId),
    onSuccess: (data) => {
      // Invalidate balance and today's status
      queryClient.setQueryData(REWARD_QUERY_KEYS.COINS, (old: any) => ({
        ...old,
        balance: data.balance,
        total_earned: (old?.total_earned ?? 0) + data.coins_awarded,
      }));
      queryClient.invalidateQueries({ queryKey: REWARD_QUERY_KEYS.COINS });
      queryClient.invalidateQueries({ queryKey: REWARD_QUERY_KEYS.TODAY });
      queryClient.invalidateQueries({ queryKey: ['coin_transactions'] });
    },
  });
}

/**
 * Mutation to unlock a prompt using coins (Option 1).
 */
export function useUnlockWithCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promptId: number) => rewardsService.unlockWithCoins(promptId),
    onSuccess: async (data, promptId) => {
      // Store local unlock cache
      if (data.prompt_text) {
        await UnlockStorage.addUnlockedPrompt(promptId, data.prompt_text);
      }

      // Update cached coin balance
      queryClient.setQueryData(REWARD_QUERY_KEYS.COINS, (old: any) => ({
        ...old,
        balance: data.balance,
        total_spent: (old?.total_spent ?? 0) + (data.coins_spent || 0),
      }));

      // Invalidate related prompt and coin queries
      queryClient.invalidateQueries({ queryKey: REWARD_QUERY_KEYS.COINS });
      queryClient.invalidateQueries({ queryKey: ['coin_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['prompt', promptId] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['saved_prompts'] });
    },
  });
}

/**
 * Mutation to unlock a prompt using rewarded ad (Option 2 - 0 coins spent).
 */
export function useUnlockWithAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promptId, eventId }: { promptId: number; eventId?: string }) =>
      rewardsService.unlockWithAd(promptId, eventId),
    onSuccess: async (_data, { promptId }) => {
      // Invalidate prompt queries
      queryClient.invalidateQueries({ queryKey: ['prompt', promptId] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['saved_prompts'] });
    },
  });
}
