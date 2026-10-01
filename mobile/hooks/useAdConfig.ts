import { useQuery } from '@tanstack/react-query';
import { adConfigService, AdConfig, DEFAULT_AD_CONFIG } from '../services/adConfig';

export function useAdConfig() {
  return useQuery<AdConfig>({
    queryKey: ['ad-config'],
    queryFn: () => adConfigService.fetchConfig(),
    initialData: DEFAULT_AD_CONFIG,
    staleTime: 1000 * 60, // 1 minute fresh window so toggles in admin apply quickly
  });
}
