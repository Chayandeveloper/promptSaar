import { Config } from '../constants/Config';
import { adConfigService } from './adConfig';

export interface RewardedAdCallbacks {
  onAdLoaded?: () => void;
  onRewardEarned: () => void;
  onAdDismissedEarly: () => void;
  onAdFailedToLoad: (error: string) => void;
}

class WebAdMobService {
  constructor() {
    adConfigService.fetchConfig().catch(() => {});
  }

  getRewardedUnitId(_type: 'prompt_unlock' | 'daily_coins' = 'prompt_unlock'): string {
    return Config.ADMOB.REWARDED_ID;
  }

  getBannerUnitId(): string {
    return Config.ADMOB.BANNER_ID;
  }

  async presentInterstitialOnPromptClick(onDismissed: () => void): Promise<void> {
    // Web mock immediately invokes dismiss
    onDismissed();
  }

  async presentRewardedAd(
    callbacks: RewardedAdCallbacks,
    simulateEarlyClose = false,
    _placement: 'prompt_unlock' | 'daily_coins' = 'prompt_unlock'
  ): Promise<void> {
    callbacks.onAdLoaded?.();
    return new Promise((resolve) => {
      setTimeout(() => {
        if (simulateEarlyClose) {
          callbacks.onAdDismissedEarly();
        } else {
          callbacks.onRewardEarned();
        }
        resolve();
      }, 1000);
    });
  }
}

export const adService = new WebAdMobService();
