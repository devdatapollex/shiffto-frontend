import { useQuery } from '@tanstack/react-query';
import { getShipmentDetails } from '@/services/shipment.service';

export function useShipmentDetails(shipmentId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['shipment-details', shipmentId],
    queryFn: () => getShipmentDetails(shipmentId!),
    enabled: enabled && !!shipmentId,
  });
}
