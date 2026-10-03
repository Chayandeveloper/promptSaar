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

  getFeedAdUnitId(): string {
    return Config.ADMOB.BANNER_ID;
  }

  getAppOpenAdUnitId(): string {
    return 'ca-app-pub-3940256099942544/9257395921';
  }

  getInterstitialPromptBackUnitId(): string {
    return 'ca-app-pub-9010050634863664/9136172220';
  }

  async presentInterstitialOnPromptClick(onDismissed: () => void): Promise<void> {
    onDismissed();
  }

  async presentInterstitialOnPromptBack(onDismissed: () => void): Promise<void> {
    onDismissed();
  }

  async presentAppOpenAd(onDismissed?: () => void): Promise<void> {
    onDismissed?.();
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
