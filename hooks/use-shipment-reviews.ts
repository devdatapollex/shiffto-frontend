import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getShipmentReviews,
  createReview,
  CreateReviewPayload,
  ReviewItem,
} from '@/services/review.service';
import { toast } from 'sonner';

export function useShipmentReviews(shipmentId: string, enabled = true) {
  return useQuery<ReviewItem[]>({
    queryKey: ['shipment-reviews', shipmentId],
    queryFn: () => getShipmentReviews(shipmentId),
    enabled: Boolean(shipmentId) && enabled,
  });
}

export function useCreateReview(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(payload),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['shipment-reviews', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        errorObj?.response?.data?.message || errorObj?.message || 'Failed to submit review';
      toast.error(message);
    },
  });
}
