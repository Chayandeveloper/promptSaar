import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateService } from '../services/templates';

export function useTemplates(params?: {
  category?: string;
  search?: string;
  filter?: string;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ['templates', params?.category || 'All', params?.search || '', params?.filter || ''],
    queryFn: () => templateService.getTemplates(params),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useTemplate(id: number | null | undefined) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => (id ? templateService.getTemplate(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUseTemplateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => templateService.useTemplate(id),
    onSuccess: (data, id) => {
      // Update template in cache with incremented use count
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', id] });
    },
  });
}
