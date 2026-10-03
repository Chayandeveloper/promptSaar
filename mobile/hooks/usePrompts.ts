import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promptsService } from '../services/prompts';
import { SavedStorage, UnlockStorage, getDeviceId } from '../services/storage';
import { PromptSummary } from '../types';

export function usePrompts(params?: {
  category_id?: number;
  category?: string;
  search?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ['prompts', params],
    queryFn: () => promptsService.getPrompts(params),
    staleTime: 1000 * 60 * 3,
  });
}

export function useFeaturedPrompts() {
  return useQuery({
    queryKey: ['prompts', 'featured'],
    queryFn: () => promptsService.getFeaturedPrompts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrendingPrompts() {
  return useQuery({
    queryKey: ['prompts', 'trending'],
    queryFn: () => promptsService.getTrendingPrompts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentPrompts() {
  return useQuery({
    queryKey: ['prompts', 'recent'],
    queryFn: () => promptsService.getRecentPrompts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePrompt(id: number) {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: async () => {
      const summary = await promptsService.getPromptById(id);
      const isLocallyUnlocked = await UnlockStorage.isUnlocked(id);
      const unlockedText = await UnlockStorage.getUnlockedText(id);
      const isSaved = await SavedStorage.isSaved(id);

      const serverUnlocked = !summary.is_locked && Boolean(summary.prompt_text);
      const locallyUnlocked = isLocallyUnlocked && Boolean(unlockedText);
      const isUnlocked = serverUnlocked || locallyUnlocked;

      return {
        ...summary,
        is_locked: !isUnlocked,
        prompt_text: summary.prompt_text || unlockedText || undefined,
        is_saved: isSaved,
      };
    },
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useCategoryPrompts(slug: string, params?: { search?: string; page?: number }) {
  return useQuery({
    queryKey: ['category-prompts', slug, params],
    queryFn: () => promptsService.getCategoryPrompts(slug, params),
    enabled: Boolean(slug),
  });
}

// ─── Local Storage Saved Prompts ────────────────────────────────────────────
export function useSavedPrompts() {
  return useQuery({
    queryKey: ['saved-prompts'],
    queryFn: async () => {
      const prompts = await SavedStorage.getSavedPrompts();
      return prompts as PromptSummary[];
    },
  });
}

export function useToggleSavePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prompt, isSaved }: { prompt: PromptSummary; isSaved: boolean }) => {
      if (isSaved) {
        await SavedStorage.unsavePrompt(prompt.id);
      } else {
        await SavedStorage.savePrompt(prompt);
      }
      return !isSaved;
    },
    onMutate: async ({ prompt, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: ['saved-prompts'] });
      const previousSaved = queryClient.getQueryData<PromptSummary[]>(['saved-prompts']) || [];

      if (isSaved) {
        queryClient.setQueryData(
          ['saved-prompts'],
          previousSaved.filter((p) => p.id !== prompt.id)
        );
      } else {
        queryClient.setQueryData(
          ['saved-prompts'],
          [prompt, ...previousSaved.filter((p) => p.id !== prompt.id)]
        );
      }

      queryClient.setQueryData(['prompt', prompt.id], (old: any) => {
        if (!old) return old;
        return { ...old, is_saved: !isSaved };
      });

      return { previousSaved };
    },
    onError: (_err, { prompt }, context) => {
      if (context?.previousSaved) {
        queryClient.setQueryData(['saved-prompts'], context.previousSaved);
      }
      queryClient.invalidateQueries({ queryKey: ['prompt', prompt.id] });
    },
    onSettled: (_, __, { prompt }) => {
      queryClient.invalidateQueries({ queryKey: ['prompt', prompt.id] });
      queryClient.invalidateQueries({ queryKey: ['saved-prompts'] });
    },
  });
}

// ─── Unlock Prompt (API call + Local Storage) ────────────────────────────────
export function useUnlockPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const deviceId = await getDeviceId();
      // 1. Call backend API to record unlock & fetch full prompt text
      const result = await promptsService.unlockPrompt(id, deviceId);
      // 2. Persist unlock in local storage so user keeps it permanently
      await UnlockStorage.addUnlockedPrompt(id, result.prompt_text);
      return result;
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(['prompt', id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_locked: false,
          prompt_text: data.prompt_text,
          unlock_count: (old.unlock_count || 0) + 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['unlocked-ids'] });
    },
  });
}
