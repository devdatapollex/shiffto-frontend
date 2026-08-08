import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingReviewsCount,
  getPendingReviews,
  getUserReceivedReviews,
  getUserGivenReviews,
  getUserReviewStats,
  createReview,
  ReviewFilterParams,
  CreateReviewPayload,
} from '@/services/review.service';
import { toast } from 'sonner';

export function usePendingReviewsCount() {
  return useQuery({
    queryKey: ['pending-reviews-count'],
    queryFn: getPendingReviewsCount,
  });
}

export function usePendingReviews(params?: ReviewFilterParams) {
  return useQuery({
    queryKey: ['pending-reviews', params],
    queryFn: () => getPendingReviews(params),
  });
}

export function useUserReceivedReviews(userId: string, params?: ReviewFilterParams) {
  return useQuery({
    queryKey: ['received-reviews', userId, params],
    queryFn: () => getUserReceivedReviews(userId, params),
    enabled: Boolean(userId),
  });
}

export function useUserGivenReviews(userId: string, params?: ReviewFilterParams) {
  return useQuery({
    queryKey: ['given-reviews', userId, params],
    queryFn: () => getUserGivenReviews(userId, params),
    enabled: Boolean(userId),
  });
}

export function useUserReviewStats(userId: string) {
  return useQuery({
    queryKey: ['user-review-stats', userId],
    queryFn: () => getUserReviewStats(userId),
    enabled: Boolean(userId),
  });
}

export function useSubmitPendingReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(payload),
    onSuccess: (_, variables) => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews-count'] });
      queryClient.invalidateQueries({ queryKey: ['given-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['user-review-stats'] });
      queryClient.invalidateQueries({ queryKey: ['shipment-reviews', variables.shipmentId] });
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        errorObj?.response?.data?.message || errorObj?.message || 'Failed to submit review';
      toast.error(message);
    },
  });
}
