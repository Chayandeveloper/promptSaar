import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBackendUrl = () => {
  // In Expo Go or local development, always connect directly to local Laravel backend
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip) {
        return `http://${ip}:8001/api`;
      }
    }
    return 'http://192.168.1.5:8001/api';
  }

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  return 'https://promptbaba.cloud/api';
};

export const Config = {
  API_URL: getBackendUrl(),
  ADMOB: {
    APP_ID:      process.env.EXPO_PUBLIC_ADMOB_APP_ID      || 'ca-app-pub-9010050634863664~7369837010',
    REWARDED_ID: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-9010050634863664/7562991281',
    BANNER_ID:   process.env.EXPO_PUBLIC_ADMOB_BANNER_ID   || 'ca-app-pub-9010050634863664/4429647201',
  },
  STORAGE_KEYS: {
    HAS_ONBOARDED:   'promptcraft_has_onboarded',
    UNLOCKED_IDS:    'promptcraft_unlocked_ids',    // number[] — locally tracked unlocked prompt IDs
    SAVED_PROMPTS:   'promptcraft_saved_prompts',   // PromptSummary[] — saved/bookmarked locally
    DEVICE_ID:       'promptcraft_device_id',        // anonymous UUID for analytics
  },
};

console.log('[Config] 🌐 Active Backend API URL:', Config.API_URL);
