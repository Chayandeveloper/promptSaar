import { useQuery } from '@tanstack/react-query';
import { socialLinksService, SocialLinks } from '../services/socialLinks';

export function useSocialLinks() {
  return useQuery<SocialLinks>({
    queryKey: ['social-links'],
    queryFn: () => socialLinksService.getLinks(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
