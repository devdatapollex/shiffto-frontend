import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  confirmPickup,
  confirmCheckin,
  confirmTransit,
  confirmArrival,
  confirmOutForDelivery,
  confirmDelivery,
} from '@/services/shipment.service';
import { toast } from 'sonner';

export function useConfirmPickup(shipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { photoUrl: string; notes?: string }) =>
      confirmPickup(shipmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      toast.success('Pickup confirmed successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to confirm pickup');
    },
  });
}

export function useConfirmCheckin(shipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { notes?: string }) => confirmCheckin(shipmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      toast.success('Check-in confirmed successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to confirm check-in');
    },
  });
}

export function useConfirmTransit(shipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { notes?: string }) => confirmTransit(shipmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      toast.success('Transit confirmed successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to confirm transit');
    },
  });
}

export function useConfirmArrival(shipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { notes?: string }) => confirmArrival(shipmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      toast.success('Arrival confirmed successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to confirm arrival');
    },
  });
}

export function useConfirmOutForDelivery(shipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { notes?: string }) => confirmOutForDelivery(shipmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      toast.success('Out for delivery confirmed successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to confirm out for delivery');
    },
  });
}

export function useConfirmDelivery(shipmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { photoUrl: string; notes?: string }) =>
      confirmDelivery(shipmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      toast.success('Delivery confirmed successfully');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to confirm delivery');
    },
  });
}
