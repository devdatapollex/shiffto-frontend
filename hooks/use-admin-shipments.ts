import { useQuery } from '@tanstack/react-query';
import { getShipments } from '@/services/shipment.service';

export function useAdminShipments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['admin-shipments', params],
    queryFn: () => getShipments(params),
  });
}
