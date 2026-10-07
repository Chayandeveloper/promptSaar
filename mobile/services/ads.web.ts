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
    adConfigService.init().catch(() => {});
  }

  private adLoadingListeners: Set<(isLoading: boolean, title?: string, subtitle?: string) => void> = new Set();

  onAdLoadingChange(listener: (isLoading: boolean, title?: string, subtitle?: string) => void): () => void {
    this.adLoadingListeners.add(listener);
    return () => {
      this.adLoadingListeners.delete(listener);
    };
  }

  setAdLoading(isLoading: boolean, title?: string, subtitle?: string): void {
    this.adLoadingListeners.forEach((listener) => {
      try {
        listener(isLoading, title, subtitle);
      } catch (e) {}
    });
  }

  getRewardedUnitId(_type: 'prompt_unlock' | 'daily_coins' = 'prompt_unlock'): string {
    return Config.ADMOB.REWARDED_ID;
  }

  getBannerUnitId(): string {
    return Config.ADMOB.BANNER_ID;
  }

  getFeedAdUnitId(): string {
    return (
      adConfigService.getConfig().feed_ad_unit_id ||
      Config.ADMOB.BANNER_ID ||
      'ca-app-pub-9010050634863664/4429647201'
    );
  }

  getAppOpenAdUnitId(): string {
    return (
      adConfigService.getConfig().app_open_ad_unit_id ||
      'ca-app-pub-3940256099942544/9257395921'
    );
  }

  getInterstitialPromptBackUnitId(): string {
    const config = adConfigService.getConfig();
    return (
      config.interstitial_prompt_back_id ||
      config.interstitial_ad_unit_id ||
      'ca-app-pub-9010050634863664/9136172220'
    );
  }

  async presentInterstitialOnPromptClick(onDismissed: () => void): Promise<void> {
    if (!adConfigService.isInterstitialOnPromptClickEnabled()) {
      this.setAdLoading(true, 'Opening Prompt...', 'Please wait a moment');
      setTimeout(() => {
        this.setAdLoading(false);
        onDismissed();
      }, 350);
      return;
    }

    this.setAdLoading(true, 'Opening Prompt...', 'Loading ad...');
    const unitId = adConfigService.getConfig().interstitial_ad_unit_id || 'ca-app-pub-9010050634863664/9136172220';
    console.log(
      `%c[AdMob Web Preview] 🎬 Interstitial Ad (Prompt Click) Triggered! Unit ID: ${unitId}`,
      'background: #f59e0b; color: #000; font-weight: bold; padding: 4px;'
    );
    setTimeout(() => {
      this.setAdLoading(false);
      onDismissed();
    }, 700);
  }

  async presentInterstitialOnPromptBack(onDismissed: () => void): Promise<void> {
    if (!adConfigService.isInterstitialOnPromptBackEnabled()) {
      this.setAdLoading(true, 'Please wait...', 'Returning...');
      setTimeout(() => {
        this.setAdLoading(false);
        onDismissed();
      }, 350);
      return;
    }

    this.setAdLoading(true, 'Please wait...', 'Loading ad...');
    const unitId = this.getInterstitialPromptBackUnitId();
    console.log(
      `%c[AdMob Web Preview] 🔙 Interstitial Ad (Prompt Back) Triggered! Unit ID: ${unitId}`,
      'background: #ea580c; color: #fff; font-weight: bold; padding: 4px;'
    );
    setTimeout(() => {
      this.setAdLoading(false);
      onDismissed();
    }, 700);
  }

  async presentAppOpenAd(onDismissed?: () => void): Promise<void> {
    await adConfigService.ensureInitialized(1500);

    if (!adConfigService.isAppOpenAdEnabled()) {
      onDismissed?.();
      return;
    }
    const unitId = this.getAppOpenAdUnitId();
    console.log(
      `%c[AdMob Web Preview] 📱 App Open Ad Triggered on Launch! Unit ID: ${unitId}`,
      'background: #9333ea; color: #fff; font-weight: bold; padding: 4px;'
    );
    onDismissed?.();
  }

  async presentRewardedAd(
    callbacks: RewardedAdCallbacks,
    simulateEarlyClose = false,
    placement: 'prompt_unlock' | 'daily_coins' = 'prompt_unlock'
  ): Promise<void> {
    if (!adConfigService.isMasterEnabled()) {
      callbacks.onRewardEarned();
      return;
    }

    if (placement === 'prompt_unlock' && !adConfigService.isRewardedPromptUnlockEnabled()) {
      callbacks.onRewardEarned();
      return;
    }

    if (placement === 'daily_coins' && !adConfigService.isRewardedDailyCoinsEnabled()) {
      callbacks.onRewardEarned();
      return;
    }

    this.setAdLoading(true, 'Unlocking Prompt...', 'Please wait a moment');
    callbacks.onAdLoaded?.();
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setAdLoading(false);
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
