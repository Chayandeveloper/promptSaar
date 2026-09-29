import { useQuery } from '@tanstack/react-query';
import { bannersService } from '../services/banners';
import { Banner } from '../types';

export function useBanners() {
  return useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: () => bannersService.getBanners(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useActiveBanner() {
  return useQuery<Banner | null>({
    queryKey: ['banners', 'active'],
    queryFn: () => bannersService.getActiveBanner(),
    staleTime: 1000 * 60 * 2,
  });
}
