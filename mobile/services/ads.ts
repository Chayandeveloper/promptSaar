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
let RewardedAdEventType: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  // Dynamically load to support both native APK builds and Expo Go development
  const gma = require('react-native-google-mobile-ads');
  MobileAds = gma.default;
  RewardedAd = gma.RewardedAd;
  InterstitialAd = gma.InterstitialAd;
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

  getRewardedUnitId(): string {
    return this.rewardedAdUnitId;
  }

  getBannerUnitId(): string {
    return this.bannerAdUnitId;
  }

  /**
   * Shows an Interstitial Ad when a prompt is clicked.
   * If interstitial ads are disabled from admin panel, directly calls onDismissed() immediately.
   * When ad is shown and closed (or if it fails/times out), calls onDismissed() to navigate to prompt details.
   */
  async presentInterstitialOnPromptClick(onDismissed: () => void): Promise<void> {
    // 1. Check admin switch: if master ads or prompt click interstitial is OFF, navigate immediately
    if (!adConfigService.isInterstitialOnPromptClickEnabled()) {
      onDismissed();
      return;
    }

    let hasDismissed = false;
    const safeDismiss = () => {
      if (!hasDismissed) {
        hasDismissed = true;
        onDismissed();
      }
    };

    // 2. Native APK execution with Google Mobile Ads SDK
    if (this.isNativeAvailable && InterstitialAd && AdEventType) {
      try {
        const config = adConfigService.getConfig();
        const adUnitId =
          config.interstitial_ad_unit_id ||
          TestIds?.INTERSTITIAL ||
          'ca-app-pub-3940256099942544/1033173712';

        const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });

        // 3.5s safety timeout so slow networks never block the user from seeing the prompt
        const fallbackTimer = setTimeout(() => {
          safeDismiss();
        }, 3500);

        const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
          clearTimeout(fallbackTimer);
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
          safeDismiss();
        });

        interstitial.load();
        return;
      } catch (err: any) {
        safeDismiss();
        return;
      }
    }

    // 3. Expo Go / development environment simulation
    safeDismiss();
  }

  /**
   * Shows a Rewarded Ad when unlocking a prompt or claiming daily coins.
   */
  async presentRewardedAd(callbacks: RewardedAdCallbacks, simulateEarlyClose = false): Promise<void> {
    // Check master ads switch
    if (!adConfigService.isMasterEnabled()) {
      callbacks.onRewardEarned();
      return;
    }

    // Native APK build where Google Mobile Ads SDK is present:
    if (this.isNativeAvailable && RewardedAd && RewardedAdEventType) {
      try {
        const adUnitId = this.rewardedAdUnitId || TestIds?.REWARDED || 'ca-app-pub-3940256099942544/5224354917';
        const rewarded = RewardedAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });

        let earned = false;

        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          callbacks.onAdLoaded?.();
          rewarded.show().catch((err: any) => {
            callbacks.onAdFailedToLoad(err?.message || 'Failed to show rewarded ad.');
          });
        });

        const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
          callbacks.onRewardEarned();
        });

        const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();
          unsubscribeError();
          if (!earned) {
            callbacks.onAdDismissedEarly();
          }
        });

        const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error: any) => {
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();
          unsubscribeError();
          callbacks.onAdFailedToLoad(error?.message || 'Rewarded ad failed to load.');
        });

        rewarded.load();
        return;
      } catch (err: any) {
        // Fall back to simulation if native call fails
      }
    }

    // Fallback simulation (for Expo Go & web development)
    callbacks.onAdLoaded?.();
    return new Promise((resolve) => {
      setTimeout(() => {
        if (simulateEarlyClose) {
          callbacks.onAdDismissedEarly();
        } else {
          callbacks.onRewardEarned();
        }
        resolve();
      }, 2000);
    });
  }
}

export const adService = new AdMobService();
