import { Platform } from 'react-native';
import { Config } from '../constants/Config';
import { adConfigService } from './adConfig';

export interface RewardedAdCallbacks {
  onAdLoaded?: () => void;
  onRewardEarned: () => void;
  onAdDismissedEarly: () => void;
  onAdFailedToLoad: (error: string) => void;
}

let MobileAds: any = null;
let RewardedAd: any = null;
let InterstitialAd: any = null;
let AppOpenAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  // Dynamically load to support both native APK builds and Expo Go development
  const gma = require('react-native-google-mobile-ads');
  MobileAds = gma.default;
  RewardedAd = gma.RewardedAd;
  InterstitialAd = gma.InterstitialAd;
  AppOpenAd = gma.AppOpenAd;
  RewardedAdEventType = gma.RewardedAdEventType;
  AdEventType = gma.AdEventType;
  TestIds = gma.TestIds;
} catch (e) {
  MobileAds = null;
}

class AdMobService {
  private rewardedAdUnitId: string;
  private bannerAdUnitId: string;
  private isNativeAvailable: boolean = false;
  private appOpenAdShown: boolean = false;
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

  constructor() {
    this.rewardedAdUnitId = Config.ADMOB.REWARDED_ID;
    this.bannerAdUnitId = Config.ADMOB.BANNER_ID;

    // Fetch initial ad config from admin backend
    adConfigService.fetchConfig().catch(() => {});

    if (MobileAds && Platform.OS !== 'web') {
      try {
        MobileAds()
          .initialize()
          .then(() => {
            this.isNativeAvailable = true;
          })
          .catch(() => {
            this.isNativeAvailable = false;
          });
      } catch (e) {
        this.isNativeAvailable = false;
      }
    }
  }

  getRewardedUnitId(type: 'prompt_unlock' | 'daily_coins' = 'prompt_unlock'): string {
    const config = adConfigService.getConfig();
    if (type === 'prompt_unlock') {
      return (
        config.rewarded_prompt_unlock_id ||
        config.rewarded_ad_unit_id ||
        this.rewardedAdUnitId ||
        'ca-app-pub-9010050634863664/7562991281'
      );
    }
    return (
      config.rewarded_daily_coins_id ||
      config.rewarded_ad_unit_id ||
      this.rewardedAdUnitId ||
      'ca-app-pub-9010050634863664/7562991281'
    );
  }

  getBannerUnitId(): string {
    return (
      adConfigService.getConfig().banner_ad_unit_id ||
      this.bannerAdUnitId ||
      'ca-app-pub-9010050634863664/4429647201'
    );
  }

  getFeedAdUnitId(): string {
    return (
      adConfigService.getConfig().feed_ad_unit_id ||
      this.bannerAdUnitId ||
      'ca-app-pub-9010050634863664/4429647201'
    );
  }

  getAppOpenAdUnitId(): string {
    const config = adConfigService.getConfig();
    if (
      config.app_open_ad_unit_id &&
      config.app_open_ad_unit_id !== 'ca-app-pub-3940256099942544/9257395921'
    ) {
      return config.app_open_ad_unit_id;
    }
    return (
      config.interstitial_ad_unit_id ||
      'ca-app-pub-9010050634863664/9136172220'
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

  /**
   * Shows an Interstitial Ad when a prompt is clicked.
   * If interstitial ads are disabled from admin panel, directly calls onDismissed() immediately.
   */
  async presentInterstitialOnPromptClick(onDismissed: () => void): Promise<void> {
    if (!adConfigService.isInterstitialOnPromptClickEnabled()) {
      console.log('[AdMob] 🔴 Prompt Click Interstitial: DISABLED (Admin switch is OFF)');
      this.setAdLoading(true, 'Opening Prompt...', 'Please wait a moment');
      setTimeout(() => {
        this.setAdLoading(false);
        onDismissed();
      }, 350);
      return;
    }

    console.log('[AdMob] 🟢 Prompt Click Interstitial: ENABLED (Admin switch is ON)');

    let hasDismissed = false;
    const safeDismiss = () => {
      this.setAdLoading(false);
      if (!hasDismissed) {
        hasDismissed = true;
        onDismissed();
      }
    };

    if (this.isNativeAvailable && InterstitialAd && AdEventType) {
      try {
        const config = adConfigService.getConfig();
        const adUnitId =
          config.interstitial_ad_unit_id ||
          'ca-app-pub-9010050634863664/9136172220';

        // Show immediate loader so user gets instant visual feedback
        this.setAdLoading(true, 'Opening Prompt...', 'Please wait a moment');

        const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });

        const fallbackTimer = setTimeout(() => {
          safeDismiss();
        }, 3000);

        const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          clearTimeout(fallbackTimer);
          // Dismiss loader right before presenting the ad
          this.setAdLoading(false);
          interstitial.show().catch(() => {
            safeDismiss();
          });
        });

        const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          clearTimeout(fallbackTimer);
          unsubLoaded();
          unsubClosed();
          unsubError();
          safeDismiss();
        });

        const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
          clearTimeout(fallbackTimer);
          unsubLoaded();
          unsubClosed();
          unsubError();
          // If no ad is there -> dismiss loader and go to prompt details
          safeDismiss();
        });

        interstitial.load();
        return;
      } catch (err: any) {
        safeDismiss();
        return;
      }
    }

    // Expo Go / Dev preview simulation when switch is ON
    this.setAdLoading(true, 'Opening Prompt...', 'AdMob Interstitial (Expo Go Preview)');
    setTimeout(() => {
      safeDismiss();
    }, 700);
  }

  /**
   * Shows an Interstitial Ad when the user presses back from prompt details.
   * Controlled independently by admin setting `interstitial_prompt_back`.
   * A loader appears while the ad is requested. If the ad appears, loader dismisses and ad shows.
   * If no ad is there (ad disabled in admin, error, no-fill, timeout), loader appears briefly and then navigates back.
   */
  async presentInterstitialOnPromptBack(onDismissed: () => void): Promise<void> {
    if (!adConfigService.isInterstitialOnPromptBackEnabled()) {
      console.log('[AdMob] 🔴 Prompt Back Interstitial: DISABLED (Admin switch is OFF)');
      this.setAdLoading(true, 'Please wait...', 'Returning...');
      setTimeout(() => {
        this.setAdLoading(false);
        onDismissed();
      }, 350);
      return;
    }

    console.log('[AdMob] 🟢 Prompt Back Interstitial: ENABLED (Admin switch is ON)');

    let hasDismissed = false;
    const safeDismiss = () => {
      this.setAdLoading(false);
      if (!hasDismissed) {
        hasDismissed = true;
        onDismissed();
      }
    };

    if (this.isNativeAvailable && InterstitialAd && AdEventType) {
      try {
        const adUnitId = this.getInterstitialPromptBackUnitId();

        // Show loader until ad appears
        this.setAdLoading(true, 'Please wait...', 'Loading ad...');

        const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });

        // 3.0s safety timeout
        const fallbackTimer = setTimeout(() => {
          safeDismiss();
        }, 3000);

        const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          clearTimeout(fallbackTimer);
          // Dismiss loader right before presenting the ad
          this.setAdLoading(false);
          interstitial.show().catch(() => {
            safeDismiss();
          });
        });

        const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          clearTimeout(fallbackTimer);
          unsubLoaded();
          unsubClosed();
          unsubError();
          safeDismiss();
        });

        const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
          clearTimeout(fallbackTimer);
          unsubLoaded();
          unsubClosed();
          unsubError();
          // If no ad is there -> dismiss loader and go back
          safeDismiss();
        });

        interstitial.load();
        return;
      } catch (err: any) {
        safeDismiss();
        return;
      }
    }

    // Expo Go / Dev preview when switch is ON
    this.setAdLoading(true, 'Please wait...', 'Loading ad (Expo Go Preview)...');
    setTimeout(() => {
      safeDismiss();
    }, 800);
  }

  /**
   * Shows an App Open Ad when app opens / mounts.
   * Controlled independently by admin switch `app_open_ad_enabled` and `app_open_ad_unit_id`.
   */
  async presentAppOpenAd(onDismissed?: () => void): Promise<void> {
    // Prevent duplicate launch triggers during the same cold start
    if (this.appOpenAdShown) {
      onDismissed?.();
      return;
    }

    // Ensure ad configuration is loaded from storage/network before deciding
    await adConfigService.ensureInitialized(1500);

    if (!adConfigService.isAppOpenAdEnabled()) {
      console.log('[AdMob] 🔴 App Open Ad: DISABLED (Admin switch is OFF)');
      onDismissed?.();
      return;
    }

    console.log('[AdMob] 🟢 App Open Ad: ENABLED (Admin switch is ON)');
    this.appOpenAdShown = true;

    let hasDismissed = false;
    const safeDismiss = () => {
      if (!hasDismissed) {
        hasDismissed = true;
        onDismissed?.();
      }
    };

    if (this.isNativeAvailable && Platform.OS !== 'web') {
      try {
        const adUnitId = this.getAppOpenAdUnitId();

        // Use full-screen Interstitial Ad on app launch
        if (InterstitialAd && AdEventType) {
          const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
          });

          const timer = setTimeout(() => {
            safeDismiss();
          }, 4000);

          const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            clearTimeout(timer);
            interstitial.show().catch(() => {
              safeDismiss();
            });
          });

          const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            clearTimeout(timer);
            unsubLoaded();
            unsubClosed();
            unsubError();
            safeDismiss();
          });

          const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, (err: any) => {
            console.warn('[AdMob Launch Interstitial] Failed to load:', err);
            clearTimeout(timer);
            unsubLoaded();
            unsubClosed();
            unsubError();
            safeDismiss();
          });

          interstitial.load();
          return;
        }

        // Fallback to AppOpenAd if InterstitialAd is not available
        if (AppOpenAd && AdEventType) {
          const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
          });

          const timer = setTimeout(() => {
            safeDismiss();
          }, 4000);

          const unsubLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
            clearTimeout(timer);
            appOpenAd.show().catch(() => {
              safeDismiss();
            });
          });

          const unsubClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
            clearTimeout(timer);
            unsubLoaded();
            unsubClosed();
            unsubError();
            safeDismiss();
          });

          const unsubError = appOpenAd.addAdEventListener(AdEventType.ERROR, () => {
            clearTimeout(timer);
            unsubLoaded();
            unsubClosed();
            unsubError();
            safeDismiss();
          });

          appOpenAd.load();
          return;
        }
      } catch (e) {
        safeDismiss();
      }
    }

    safeDismiss();
  }

  /**
   * Shows a Rewarded Ad when unlocking a prompt or claiming daily coins.
   */
  async presentRewardedAd(
    callbacks: RewardedAdCallbacks,
    simulateEarlyClose = false,
    placement: 'prompt_unlock' | 'daily_coins' = 'prompt_unlock'
  ): Promise<void> {
    if (!adConfigService.isMasterEnabled()) {
      console.log(`[AdMob] 🔴 Rewarded Ad (${placement}): DISABLED (Master switch is OFF)`);
      callbacks.onRewardEarned();
      return;
    }

    if (placement === 'prompt_unlock' && !adConfigService.isRewardedPromptUnlockEnabled()) {
      console.log('[AdMob] 🔴 Rewarded Ad (prompt_unlock): DISABLED (Admin switch is OFF)');
      callbacks.onRewardEarned();
      return;
    }

    if (placement === 'daily_coins' && !adConfigService.isRewardedDailyCoinsEnabled()) {
      console.log('[AdMob] 🔴 Rewarded Ad (daily_coins): DISABLED (Admin switch is OFF)');
      callbacks.onRewardEarned();
      return;
    }

    console.log(`[AdMob] 🟢 Rewarded Ad (${placement}): ENABLED (Admin switch is ON)`);

    if (this.isNativeAvailable && RewardedAd && RewardedAdEventType) {
      try {
        const adUnitId = this.getRewardedUnitId(placement);
        const rewarded = RewardedAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });

        let earned = false;
        let isSettled = false;

        // Show immediate loader so user gets instant visual feedback
        this.setAdLoading(true, 'Unlocking Prompt...', 'Please wait a moment');

        // 3-second safety timeout: if ad network hangs or fails silently, trigger failure callback to unlock automatically
        const loadTimeout = setTimeout(() => {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            callbacks.onAdFailedToLoad('Rewarded ad load timed out.');
          }
        }, 3000);

        const cleanup = () => {
          clearTimeout(loadTimeout);
          try {
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            unsubscribeError();
          } catch (_) {}
        };

        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          clearTimeout(loadTimeout);
          // Dismiss loader right as ad appears on screen
          this.setAdLoading(false);
          callbacks.onAdLoaded?.();
          rewarded.show().catch((err: any) => {
            if (!isSettled) {
              isSettled = true;
              cleanup();
              callbacks.onAdFailedToLoad(err?.message || 'Failed to show rewarded ad.');
            }
          });
        });

        const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
          this.setAdLoading(true, 'Unlocking Prompt...', 'Revealing full prompt...');
          callbacks.onRewardEarned();
        });

        const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          cleanup();
          this.setAdLoading(false);
          if (!earned) {
            callbacks.onAdDismissedEarly();
          }
        });

        const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
          if (!isSettled) {
            isSettled = true;
            cleanup();
            callbacks.onAdFailedToLoad(error?.message || 'Rewarded ad failed to load.');
          }
        });

        rewarded.load();
        return;
      } catch (err: any) {
        // Fall back to simulation if native call fails
      }
    }

    // Fallback simulation (for Expo Go & web development)
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
      }, 1200);
    });
  }
}

export const adService = new AdMobService();
