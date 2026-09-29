import { api } from './api';
import { Banner } from '../types';

export const bannersService = {
  async getBanners(): Promise<Banner[]> {
    try {
      const res = await api.get<{ banners: Banner[] }>('/banners');
      return res.banners || [];
    } catch {
      return [];
    }
  },

  async getActiveBanner(): Promise<Banner | null> {
    try {
      const res = await api.get<{ banner: Banner | null }>('/banners/active');
      return res.banner || null;
    } catch {
      return null;
    }
  },
};
