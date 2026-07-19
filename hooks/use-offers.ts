import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as offerService from '@/services/offer.service';

export function useOffersForShipment(shipmentId: string | null) {
  return useQuery({
    queryKey: ['offers', 'shipment', shipmentId],
    queryFn: () => offerService.getOffersForShipment(shipmentId!),
    enabled: !!shipmentId,
  });
}

export function useSentOffers() {
  return useQuery({
    queryKey: ['offers', 'sent'],
    queryFn: offerService.getSentOffers,
  });
}

export function useReceivedOffers() {
  return useQuery({
    queryKey: ['offers', 'received'],
    queryFn: offerService.getReceivedOffers,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: offerService.createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['available-shipments'] });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: offerService.acceptOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: offerService.rejectOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useCancelCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: offerService.cancelCheckout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
