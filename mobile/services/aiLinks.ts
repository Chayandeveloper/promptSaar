import { Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export const aiLinksService = {
  /**
   * Copies the prompt to clipboard and opens ChatGPT with the prompt parameter.
   */
  async openChatGPT(promptText: string): Promise<boolean> {
    try {
      // 1. Copy the full prompt to system clipboard so user can also 1-tap paste
      await Clipboard.setStringAsync(promptText);

      const encodedPrompt = encodeURIComponent(promptText);
      // https://chatgpt.com/?q= is supported by ChatGPT to pre-fill prompt into input
      const targetUrl = `https://chatgpt.com/?q=${encodedPrompt}`;

      await Linking.openURL(targetUrl);
      return true;
    } catch (e) {
      console.warn('Error opening ChatGPT:', e);
      try {
        await Linking.openURL('https://chatgpt.com/');
        return true;
      } catch (err) {
        return false;
      }
    }
  },

  /**
   * Copies the prompt to clipboard and opens Gemini with the prompt parameter.
   */
  async openGemini(promptText: string): Promise<boolean> {
    try {
      // 1. Copy the full prompt to system clipboard so user can also 1-tap paste
      await Clipboard.setStringAsync(promptText);

      const encodedPrompt = encodeURIComponent(promptText);
      const targetUrl = `https://gemini.google.com/app?q=${encodedPrompt}`;

      await Linking.openURL(targetUrl);
      return true;
    } catch (e) {
      console.warn('Error opening Gemini:', e);
      try {
        await Linking.openURL('https://gemini.google.com/app');
        return true;
      } catch (err) {
        return false;
      }
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
