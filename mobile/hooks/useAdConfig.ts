import { useQuery } from '@tanstack/react-query';
import { adConfigService, AdConfig } from '../services/adConfig';

export function useAdConfig() {
  return useQuery<AdConfig>({
    queryKey: ['ad-config'],
    queryFn: () => adConfigService.fetchConfig(),
    initialData: adConfigService.isReady() ? adConfigService.getConfig() : undefined,
    staleTime: 1000 * 20, // 20s fresh window so toggles in admin apply quickly
  });
}
