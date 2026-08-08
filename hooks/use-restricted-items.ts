import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRestrictedItems,
  createRestrictedItem,
  updateRestrictedItem,
  deleteRestrictedItem,
  type GetRestrictedItemsParams,
} from '@/services/restricted-item.service';
import { toast } from 'sonner';

export const RESTRICTED_ITEMS_QUERY_KEY = ['restricted-items'];

export function useRestrictedItems(params?: GetRestrictedItemsParams) {
  return useQuery({
    queryKey: [...RESTRICTED_ITEMS_QUERY_KEY, params],
    queryFn: () => getRestrictedItems(params),
  });
}

export function useCreateRestrictedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRestrictedItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTRICTED_ITEMS_QUERY_KEY });
      toast.success('Restricted item created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create restricted item');
    },
  });
}

export function useUpdateRestrictedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string | null; isActive?: boolean };
    }) => updateRestrictedItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTRICTED_ITEMS_QUERY_KEY });
      toast.success('Restricted item updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update restricted item');
    },
  });
}

export function useDeleteRestrictedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRestrictedItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTRICTED_ITEMS_QUERY_KEY });
      toast.success('Restricted item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete restricted item');
    },
  });
}
