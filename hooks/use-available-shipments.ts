import { useQuery } from '@tanstack/react-query';
import { getAvailableShipments } from '@/services/shipment.service';

export function useAvailableShipments(params?: {
  page?: number;
  limit?: number;
  fromCountry?: string;
  toCountry?: string;
}) {
  return useQuery({
    queryKey: ['available-shipments', params],
    queryFn: () => getAvailableShipments(params),
  });
}
