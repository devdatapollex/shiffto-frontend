import { useQuery } from '@tanstack/react-query';
import { getAvailableShipmentsCount } from '@/services/shipment.service';

export function useAvailableShipmentsCount() {
  return useQuery({
    queryKey: ['available-shipments-count'],
    queryFn: getAvailableShipmentsCount,
    staleTime: 1000 * 30,
  });
}
