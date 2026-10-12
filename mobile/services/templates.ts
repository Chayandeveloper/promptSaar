import { api } from './api';
import { Template, TemplateListResponse } from '../types';

export const templateService = {
  /**
   * Fetch active templates with optional category filter or search
   */
  async getTemplates(params?: {
    category?: string;
    search?: string;
    filter?: string;
    per_page?: number;
  }): Promise<TemplateListResponse> {
    return api.get<TemplateListResponse>('/templates', params);
  },

  /**
   * Fetch single template detail and increment views
   */
  async getTemplate(id: number): Promise<{ status: string; template: Template }> {
    return api.get<{ status: string; template: Template }>(`/templates/${id}`);
  },

  /**
   * Record template usage when user clicks "Use This Template"
   */
  async useTemplate(id: number): Promise<{ status: string; use_count: number; capcut_url: string }> {
    return api.post<{ status: string; use_count: number; capcut_url: string }>(`/templates/${id}/use`);
  },
};
