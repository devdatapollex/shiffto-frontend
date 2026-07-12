import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/category.service';

export function useCategories() {
  return useQuery({
    queryKey: ['shipment-categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
