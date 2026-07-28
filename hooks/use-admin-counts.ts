import { useQuery } from '@tanstack/react-query';
import { getAdminSidebarCounts } from '@/services/admin-analytics.service';

export function useAdminSidebarCounts() {
  return useQuery({
    queryKey: ['admin-sidebar-counts'],
    queryFn: getAdminSidebarCounts,
    staleTime: 1000 * 30,
  });
}
