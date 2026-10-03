import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Config } from '../constants/Config';

// Cross-platform storage wrapper
export const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('Storage getItem error:', e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage setItem error:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage removeItem error:', e);
    }
  },
};

// ─── Device ID (anonymous analytics) ─────────────────────────────────────────
export async function getDeviceId(): Promise<string> {
  let deviceId = await Storage.getItem(Config.STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    await Storage.setItem(Config.STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}

// ─── Unlocked Prompts (stored as JSON array of IDs and texts) ─────────────────
export const UnlockStorage = {
  async getUnlockedIds(): Promise<number[]> {
    const raw = await Storage.getItem(Config.STORAGE_KEYS.UNLOCKED_IDS);
    if (!raw) return [];
    try { return JSON.parse(raw) as number[]; } catch { return []; }
  },

  async isUnlocked(promptId: number): Promise<boolean> {
    const ids = await this.getUnlockedIds();
    return ids.includes(promptId);
  },

  async getUnlockedTexts(): Promise<Record<string, string>> {
    const raw = await Storage.getItem('promptcraft_unlocked_texts');
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  },

  async getUnlockedText(promptId: number): Promise<string | null> {
    const texts = await this.getUnlockedTexts();
    return texts[String(promptId)] || null;
  },

  async addUnlockedPrompt(promptId: number, promptText?: string): Promise<void> {
    const ids = await this.getUnlockedIds();
    if (!ids.includes(promptId)) {
      await Storage.setItem(Config.STORAGE_KEYS.UNLOCKED_IDS, JSON.stringify([...ids, promptId]));
    }
    if (promptText) {
      const texts = await this.getUnlockedTexts();
      texts[String(promptId)] = promptText;
      await Storage.setItem('promptcraft_unlocked_texts', JSON.stringify(texts));
    }
  },

  async removeUnlockedPrompt(promptId: number): Promise<void> {
    try {
      const ids = await this.getUnlockedIds();
      await Storage.setItem(
        Config.STORAGE_KEYS.UNLOCKED_IDS,
        JSON.stringify(ids.filter((id) => id !== promptId))
      );
      const texts = await this.getUnlockedTexts();
      delete texts[String(promptId)];
      await Storage.setItem('promptcraft_unlocked_texts', JSON.stringify(texts));
    } catch {
      // Storage remove error safe handling
    }
  },

  async clearAll(): Promise<void> {
    await Storage.removeItem(Config.STORAGE_KEYS.UNLOCKED_IDS);
    await Storage.removeItem('promptcraft_unlocked_texts');
  },
};

// ─── Saved Prompts (stored as JSON array of prompt summaries) ─────────────────
export const SavedStorage = {
  async getSavedPrompts(): Promise<any[]> {
    const raw = await Storage.getItem(Config.STORAGE_KEYS.SAVED_PROMPTS);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  },

  async isSaved(promptId: number): Promise<boolean> {
    const saved = await this.getSavedPrompts();
    return saved.some((p: any) => p.id === promptId);
  },

  async savePrompt(prompt: any): Promise<void> {
    const saved = await this.getSavedPrompts();
    if (!saved.some((p: any) => p.id === prompt.id)) {
      await Storage.setItem(Config.STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify([prompt, ...saved]));
    }
  },

  async unsavePrompt(promptId: number): Promise<void> {
    const saved = await this.getSavedPrompts();
    const filtered = saved.filter((p: any) => p.id !== promptId);
    await Storage.setItem(Config.STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(filtered));
  },

  async clearAll(): Promise<void> {
    await Storage.removeItem(Config.STORAGE_KEYS.SAVED_PROMPTS);
  },
};
