import { api } from './api';
import { PromptDetail, PromptSummary, PaginatedResponse, Category } from '../types';

export const promptsService = {
  async getPrompts(params?: {
    category_id?: number;
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<PromptSummary>> {
    return api.get<PaginatedResponse<PromptSummary>>('/prompts', params);
  },

  async getFeaturedPrompts(): Promise<PromptSummary[]> {
    const res = await api.get<{ featured: PromptSummary[] }>('/prompts/featured');
    return res.featured;
  },

  async getTrendingPrompts(): Promise<PromptSummary[]> {
    const res = await api.get<{ trending: PromptSummary[] }>('/prompts/trending');
    return res.trending;
  },

  async getRecentPrompts(): Promise<PromptSummary[]> {
    const res = await api.get<{ recent: PromptSummary[] }>('/prompts/recent');
    return res.recent;
  },

  async getPromptById(id: number): Promise<PromptDetail> {
    const res = await api.get<{ prompt: PromptDetail }>(`/prompts/${id}`);
    return res.prompt;
  },

  async getCategoryPrompts(
    slug: string,
    params?: { search?: string; page?: number; per_page?: number }
  ): Promise<{ category: Category; prompts: PaginatedResponse<PromptSummary> }> {
    return api.get<{ category: Category; prompts: PaginatedResponse<PromptSummary> }>(
      `/categories/${slug}/prompts`,
      params
    );
  },

  /**
   * Called AFTER AdMob rewarded ad completes.
   * Returns the full prompt_text directly — no auth required.
   */
  async unlockPrompt(id: number, deviceId?: string): Promise<{ prompt_text: string; prompt: any }> {
    return api.post<{ prompt_text: string; prompt: any }>(
      `/prompts/${id}/unlock`,
      deviceId ? { device_id: deviceId } : undefined
    );
  },
};
