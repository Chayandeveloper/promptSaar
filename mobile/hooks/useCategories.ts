import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../services/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesService.getCategoryBySlug(slug),
    enabled: Boolean(slug),
  });
}
