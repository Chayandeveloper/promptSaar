import { api } from './api';
import { Config } from '../constants/Config';

export interface AdConfig {
  ads_enabled: boolean;
  interstitial_prompt_click: boolean;
  interstitial_prompt_back: boolean;
  rewarded_prompt_unlock: boolean;
  rewarded_daily_coins: boolean;
  banner_ads_enabled: boolean;
  feed_ad_enabled: boolean;
  app_open_ad_enabled: boolean;
  interstitial_ad_unit_id: string;
  interstitial_prompt_back_id?: string;
  banner_ad_unit_id?: string;
  feed_ad_unit_id?: string;
  app_open_ad_unit_id?: string;
  rewarded_ad_unit_id?: string;
  rewarded_prompt_unlock_id?: string;
  rewarded_daily_coins_id?: string;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  ads_enabled: true,
  interstitial_prompt_click: true,
  interstitial_prompt_back: true,
  rewarded_prompt_unlock: true,
  rewarded_daily_coins: true,
  banner_ads_enabled: true,
  feed_ad_enabled: true,
  app_open_ad_enabled: true,
  interstitial_ad_unit_id: 'ca-app-pub-9010050634863664/9136172220',
  interstitial_prompt_back_id: 'ca-app-pub-9010050634863664/9136172220',
  banner_ad_unit_id: Config.ADMOB.BANNER_ID,
  feed_ad_unit_id: Config.ADMOB.BANNER_ID,
  app_open_ad_unit_id: 'ca-app-pub-3940256099942544/9257395921',
  rewarded_ad_unit_id: Config.ADMOB.REWARDED_ID,
  rewarded_prompt_unlock_id: Config.ADMOB.REWARDED_ID,
  rewarded_daily_coins_id: Config.ADMOB.REWARDED_ID,
};

class AdConfigService {
  private cachedConfig: AdConfig = DEFAULT_AD_CONFIG;

  async fetchConfig(): Promise<AdConfig> {
    try {
      const response = await api.get<{ status: string; config: AdConfig }>('/ad-config');
      if (response && response.config) {
        this.cachedConfig = {
          ads_enabled: Boolean(response.config.ads_enabled),
          interstitial_prompt_click: Boolean(response.config.interstitial_prompt_click),
          interstitial_prompt_back: Boolean(response.config.interstitial_prompt_back ?? true),
          rewarded_prompt_unlock: Boolean(response.config.rewarded_prompt_unlock),
          rewarded_daily_coins: Boolean(response.config.rewarded_daily_coins),
          banner_ads_enabled: Boolean(response.config.banner_ads_enabled),
          feed_ad_enabled: Boolean(response.config.feed_ad_enabled ?? true),
          app_open_ad_enabled: Boolean(response.config.app_open_ad_enabled ?? true),
          interstitial_ad_unit_id: response.config.interstitial_ad_unit_id || DEFAULT_AD_CONFIG.interstitial_ad_unit_id,
          interstitial_prompt_back_id: response.config.interstitial_prompt_back_id || response.config.interstitial_ad_unit_id || DEFAULT_AD_CONFIG.interstitial_prompt_back_id,
          banner_ad_unit_id: response.config.banner_ad_unit_id || DEFAULT_AD_CONFIG.banner_ad_unit_id,
          feed_ad_unit_id: response.config.feed_ad_unit_id || response.config.banner_ad_unit_id || DEFAULT_AD_CONFIG.feed_ad_unit_id,
          app_open_ad_unit_id: response.config.app_open_ad_unit_id || DEFAULT_AD_CONFIG.app_open_ad_unit_id,
          rewarded_ad_unit_id: response.config.rewarded_ad_unit_id || DEFAULT_AD_CONFIG.rewarded_ad_unit_id,
          rewarded_prompt_unlock_id: response.config.rewarded_prompt_unlock_id || response.config.rewarded_ad_unit_id || DEFAULT_AD_CONFIG.rewarded_prompt_unlock_id,
          rewarded_daily_coins_id: response.config.rewarded_daily_coins_id || response.config.rewarded_ad_unit_id || DEFAULT_AD_CONFIG.rewarded_daily_coins_id,
        };
        return this.cachedConfig;
      }
    } catch (e) {
      // Return cached or default config if server offline
    }
    return this.cachedConfig;
  }

  getConfig(): AdConfig {
    return this.cachedConfig;
  }

  isMasterEnabled(): boolean {
    return this.cachedConfig.ads_enabled;
  }

  isInterstitialOnPromptClickEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.interstitial_prompt_click;
  }

  isInterstitialOnPromptBackEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.interstitial_prompt_back;
  }

  isRewardedPromptUnlockEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.rewarded_prompt_unlock;
  }

  isRewardedDailyCoinsEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.rewarded_daily_coins;
  }

  isBannerAdsEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.banner_ads_enabled;
  }

  isFeedAdEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.feed_ad_enabled;
  }

  isAppOpenAdEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.app_open_ad_enabled;
  }
}

export const adConfigService = new AdConfigService();
