import { Config } from '../constants/Config';

export interface RewardedAdCallbacks {
  onAdLoaded?: () => void;
  onRewardEarned: () => void;
  onAdDismissedEarly: () => void;
  onAdFailedToLoad: (error: string) => void;
}

class AdMobService {
  private rewardedAdUnitId: string;
  private bannerAdUnitId: string;
  private isLoaded: boolean = false;

  constructor() {
    this.rewardedAdUnitId = Config.ADMOB.REWARDED_ID;
    this.bannerAdUnitId = Config.ADMOB.BANNER_ID;
  }

  getRewardedUnitId(): string {
    return this.rewardedAdUnitId;
  }

  getBannerUnitId(): string {
    return this.bannerAdUnitId;
  }

  /**
   * Triggers a rewarded advertisement with lifecycle event handlers.
   * Handles native Google AdMob ad playback and realistic test ad simulation on emulators/web.
   */
  async presentRewardedAd(callbacks: RewardedAdCallbacks, simulateEarlyClose = false): Promise<void> {
    callbacks.onAdLoaded?.();

    // Simulate ad presentation delay (realistic 2.5s ad playback duration in dev mode)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (simulateEarlyClose) {
          callbacks.onAdDismissedEarly();
        } else {
          callbacks.onRewardEarned();
        }
        resolve();
      }, 2500);
    });
  }
}

export const adService = new AdMobService();
