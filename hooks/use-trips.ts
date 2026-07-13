import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyTrips, cancelTrip, completeTrip, acceptShipment } from '@/services/trip.service';

export function useMyTrips(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['my-trips', params],
    queryFn: () => getMyTrips(params),
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
    },
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
    },
  });
}

export function useAcceptShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tripId,
      payload,
    }: {
      tripId: string;
      payload: { shipmentId: string; bagType: 'cabin' | 'checkIn' };
    }) => acceptShipment(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      queryClient.invalidateQueries({ queryKey: ['available-shipments'] });
    },
  });
}
