import { api } from './api';

export interface AdConfig {
  ads_enabled: boolean;
  interstitial_prompt_click: boolean;
  rewarded_prompt_unlock: boolean;
  rewarded_daily_coins: boolean;
  banner_ads_enabled: boolean;
  interstitial_ad_unit_id: string;
  banner_ad_unit_id?: string;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  ads_enabled: true,
  interstitial_prompt_click: true,
  rewarded_prompt_unlock: true,
  rewarded_daily_coins: true,
  banner_ads_enabled: true,
  interstitial_ad_unit_id: 'ca-app-pub-3940256099942544/1033173712',
  banner_ad_unit_id: 'ca-app-pub-3940256099942544/6300978111',
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
          rewarded_prompt_unlock: Boolean(response.config.rewarded_prompt_unlock),
          rewarded_daily_coins: Boolean(response.config.rewarded_daily_coins),
          banner_ads_enabled: Boolean(response.config.banner_ads_enabled),
          interstitial_ad_unit_id: response.config.interstitial_ad_unit_id || DEFAULT_AD_CONFIG.interstitial_ad_unit_id,
          banner_ad_unit_id: response.config.banner_ad_unit_id || DEFAULT_AD_CONFIG.banner_ad_unit_id,
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

  isRewardedPromptUnlockEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.rewarded_prompt_unlock;
  }

  isRewardedDailyCoinsEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.rewarded_daily_coins;
  }

  isBannerAdsEnabled(): boolean {
    return this.cachedConfig.ads_enabled && this.cachedConfig.banner_ads_enabled;
  }
}

export const adConfigService = new AdConfigService();
