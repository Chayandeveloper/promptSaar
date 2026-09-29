import Constants from 'expo-constants';
import { api } from './api';

export interface AppVersionResponse {
  status: string;
  client_version: string;
  min_version: string;
  latest_version: string;
  force_update_flag: boolean;
  needs_force_update: boolean;
  needs_soft_update: boolean;
  update_url: string;
  update_title: string;
  update_message: string;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export const getAppVersion = (): string => {
  return Constants.expoConfig?.version || '1.0.0';
};

export const checkAppVersion = async (): Promise<AppVersionResponse | null> => {
  try {
    const version = getAppVersion();
    const res = await api.get<AppVersionResponse>('/app-version', { version });
    return res;
  } catch (error) {
    console.log('[VersionCheck] Version check failed (silent fallback):', error);
    return null;
  }
};
