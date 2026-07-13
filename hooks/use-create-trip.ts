import { useMutation } from '@tanstack/react-query';
import { createTrip } from '@/services/trip.service';
import type { CreateTripPayload } from '@/lib/validations/trip';

export function useCreateTrip() {
  return useMutation({
    mutationFn: (payload: CreateTripPayload) => createTrip(payload),
  });
}
