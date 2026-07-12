import { useMutation } from '@tanstack/react-query';
import { createShipment } from '@/services/shipment.service';
import type { CreateShipmentPayload } from '@/lib/validations/shipment';

export function useCreateShipment() {
  return useMutation({
    mutationFn: (payload: CreateShipmentPayload) => createShipment(payload),
  });
}
