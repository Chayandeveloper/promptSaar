import { api } from './api';
import {
  CoinBalanceResponse,
  RewardConfig,
  TodayRewardStatus,
  ClaimRewardResult,
  CoinTransaction,
  UnlockResult,
  PaginatedResponse,
} from '../types';

export const rewardsService = {
  /**
   * Get authoritative user coin balance and lifetime stats from backend.
   */
  async getCoins(): Promise<CoinBalanceResponse> {
    return api.get<CoinBalanceResponse>('/me/coins');
  },

  /**
   * Get global reward system configuration (coins_per_ad, daily limit, default cost).
   */
  async getRewardConfig(): Promise<RewardConfig> {
    return api.get<RewardConfig>('/rewards/config');
  },

  /**
   * Get user's today's reward progress based on server-side date.
   */
  async getTodayRewardStatus(): Promise<TodayRewardStatus> {
    return api.get<TodayRewardStatus>('/rewards/today');
  },

  /**
   * Claim coins after completing rewarded ad.
   */
  async claimAdReward(eventId?: string): Promise<ClaimRewardResult> {
    return api.post<ClaimRewardResult>('/rewards/ad-completed', {
      event_id: eventId || 'ad_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    });
  },

  /**
   * Option 1 — Spend coins to unlock prompt immediately without an ad.
   */
  async unlockWithCoins(promptId: number): Promise<UnlockResult> {
    return api.post<UnlockResult>(`/prompts/${promptId}/unlock-with-coins`);
  },

  /**
   * Option 2 — Unlock prompt by watching rewarded advertisement (0 coins spent).
   */
  async unlockWithAd(promptId: number, eventId?: string): Promise<UnlockResult> {
    return api.post<UnlockResult>(`/prompts/${promptId}/unlock-with-ad`, {
      event_id: eventId || 'prompt_ad_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    });
  },

  /**
   * Get ledger history of user's coin earnings and spendings.
   */
  async getCoinTransactions(page = 1): Promise<PaginatedResponse<CoinTransaction> & { balance: number }> {
    return api.get<PaginatedResponse<CoinTransaction> & { balance: number }>('/me/coin-transactions', { page });
  },

  /**
   * Get list of prompts unlocked by this user/device on backend.
   */
  async getUnlockedPrompts(): Promise<{ unlocked_prompt_ids: number[]; unlocks: any[] }> {
    return api.get<{ unlocked_prompt_ids: number[]; unlocks: any[] }>('/me/unlocked');
  },
};
