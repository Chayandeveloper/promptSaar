import { api } from './api';

export interface SocialLinks {
  whatsapp: string;
  instagram: string;
  telegram: string;
}

export const socialLinksService = {
  async getLinks(): Promise<SocialLinks> {
    try {
      const res = await api.get<{
        status: string;
        whatsapp?: string;
        instagram?: string;
        telegram?: string;
      }>('/social-links');

      return {
        whatsapp: res.whatsapp || 'https://wa.me/',
        instagram: res.instagram || 'https://instagram.com/',
        telegram: res.telegram || 'https://t.me/',
      };
    } catch {
      return {
        whatsapp: 'https://wa.me/',
        instagram: 'https://instagram.com/',
        telegram: 'https://t.me/',
      };
    }
  },
};
