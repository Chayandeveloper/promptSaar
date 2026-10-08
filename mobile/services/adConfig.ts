import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { Config } from '../constants/Config';

export interface AdConfig {
  ads_enabled: boolean;
  interstitial_prompt_click: boolean;
  interstitial_cooldown_seconds?: number;
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
  interstitial_cooldown_seconds: 45,
  interstitial_prompt_back: false,
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

const STORAGE_KEY = '@prompt_saar_ad_config_v2';

function parseBool(val: any, fallback = false): boolean {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    if (s === 'false' || s === '0' || s === 'off' || s === 'no' || s === '') return false;
    if (s === 'true' || s === '1' || s === 'on' || s === 'yes') return true;
  }
  return Boolean(val);
}

class AdConfigService {
  private cachedConfig: AdConfig = DEFAULT_AD_CONFIG;
  private hasInitialized = false;
  private initPromise: Promise<AdConfig> | null = null;

  constructor() {
    this.init().catch(() => {});
  }

  async init(): Promise<AdConfig> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // 1. Try to load cached config from AsyncStorage for immediate offline/startup accuracy
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            this.cachedConfig = this.normalizeConfig(parsed);
            this.hasInitialized = true;
          }
        }
      } catch (e) {
        // ignore storage error
      }

      // 2. Fetch fresh live config from backend
      try {
        await this.fetchConfig();
      } catch (e) {
        // ignore network error
      }

      this.hasInitialized = true;
      return this.cachedConfig;
    })();

    return this.initPromise;
  }

  async ensureInitialized(timeoutMs = 1500): Promise<AdConfig> {
    if (this.hasInitialized) return this.cachedConfig;

    return Promise.race([
      this.init(),
      new Promise<AdConfig>((resolve) => {
        setTimeout(() => resolve(this.cachedConfig), timeoutMs);
      }),
    ]);
  }

  isReady(): boolean {
    return this.hasInitialized;
  }

  private normalizeConfig(raw: any): AdConfig {
    const ads_enabled = parseBool(raw.ads_enabled, true);

    return {
      ads_enabled,
      // If master switch is off, all individual triggers are strictly disabled
      interstitial_prompt_click: ads_enabled && parseBool(raw.interstitial_prompt_click, true),
      interstitial_cooldown_seconds: typeof raw.interstitial_cooldown_seconds === 'number' ? raw.interstitial_cooldown_seconds : (Number(raw.interstitial_cooldown_seconds) || 45),
      interstitial_prompt_back: ads_enabled && parseBool(raw.interstitial_prompt_back, false),
      rewarded_prompt_unlock: ads_enabled && parseBool(raw.rewarded_prompt_unlock, true),
      rewarded_daily_coins: ads_enabled && parseBool(raw.rewarded_daily_coins, true),
      banner_ads_enabled: ads_enabled && parseBool(raw.banner_ads_enabled, true),
      feed_ad_enabled: ads_enabled && parseBool(raw.feed_ad_enabled, true),
      app_open_ad_enabled: ads_enabled && parseBool(raw.app_open_ad_enabled, true),

      interstitial_ad_unit_id: raw.interstitial_ad_unit_id || DEFAULT_AD_CONFIG.interstitial_ad_unit_id,
      interstitial_prompt_back_id: raw.interstitial_prompt_back_id || raw.interstitial_ad_unit_id || DEFAULT_AD_CONFIG.interstitial_prompt_back_id,
      banner_ad_unit_id: raw.banner_ad_unit_id || DEFAULT_AD_CONFIG.banner_ad_unit_id,
      feed_ad_unit_id: raw.feed_ad_unit_id || raw.banner_ad_unit_id || DEFAULT_AD_CONFIG.feed_ad_unit_id,
      app_open_ad_unit_id: raw.app_open_ad_unit_id || DEFAULT_AD_CONFIG.app_open_ad_unit_id,
      rewarded_ad_unit_id: raw.rewarded_ad_unit_id || DEFAULT_AD_CONFIG.rewarded_ad_unit_id,
      rewarded_prompt_unlock_id: raw.rewarded_prompt_unlock_id || raw.rewarded_ad_unit_id || DEFAULT_AD_CONFIG.rewarded_prompt_unlock_id,
      rewarded_daily_coins_id: raw.rewarded_daily_coins_id || raw.rewarded_ad_unit_id || DEFAULT_AD_CONFIG.rewarded_daily_coins_id,
    };
  }

  async fetchConfig(): Promise<AdConfig> {
    try {
      const response = await api.get<{ status: string; config: any }>('/ad-config');
      if (response && response.config) {
        this.cachedConfig = this.normalizeConfig(response.config);
        this.hasInitialized = true;
        console.log('[AdConfig] 📥 Live Config received from server:', {
          ads_enabled: this.cachedConfig.ads_enabled,
          interstitial_prompt_click: this.cachedConfig.interstitial_prompt_click,
          interstitial_prompt_back: this.cachedConfig.interstitial_prompt_back,
          rewarded_prompt_unlock: this.cachedConfig.rewarded_prompt_unlock,
          rewarded_daily_coins: this.cachedConfig.rewarded_daily_coins,
          banner_ads_enabled: this.cachedConfig.banner_ads_enabled,
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cachedConfig)).catch(() => {});
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

  getInterstitialCooldownMs(): number {
    const sec = typeof this.cachedConfig.interstitial_cooldown_seconds === 'number'
      ? this.cachedConfig.interstitial_cooldown_seconds
      : 45;
    return Math.max(0, sec) * 1000;
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
