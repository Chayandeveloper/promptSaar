import { api } from './api';
import { Category } from '../types';

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    const res = await api.get<{ categories: Category[] }>('/categories');
    return res.categories;
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const res = await api.get<{ category: Category }>(`/categories/${slug}`);
    return res.category;
  },
};
