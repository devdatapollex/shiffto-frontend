import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/services/profile.service';

export function useProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
