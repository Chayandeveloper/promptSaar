import { Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export const aiLinksService = {
  /**
   * Copies the prompt to clipboard and opens ChatGPT with app deep link or web fallback.
   */
  async openChatGPT(promptText: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(promptText);

      const deepLink = 'chatgpt://';
      const webUrl = 'https://chatgpt.com/';

      const canOpen = await Linking.canOpenURL(deepLink).catch(() => false);
      if (canOpen) {
        await Linking.openURL(deepLink);
      } else {
        await Linking.openURL(webUrl);
      }
      return true;
    } catch (e) {
      console.warn('Error opening ChatGPT:', e);
      return false;
    }
  },

  /**
   * Copies the prompt to clipboard and opens Gemini with app deep link or web fallback.
   */
  async openGemini(promptText: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(promptText);

      const deepLink = 'gemini://';
      const webUrl = 'https://gemini.google.com/app';

      const canOpen = await Linking.canOpenURL(deepLink).catch(() => false);
      if (canOpen) {
        await Linking.openURL(deepLink);
      } else {
        await Linking.openURL(webUrl);
      }
      return true;
    } catch (e) {
      console.warn('Error opening Gemini:', e);
      return false;
    }
  },

  /**
   * Copies prompt directly to clipboard.
   */
  async copyPrompt(promptText: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(promptText);
      return true;
    } catch (e) {
      console.warn('Clipboard copy error:', e);
      return false;
    }
  },
};
