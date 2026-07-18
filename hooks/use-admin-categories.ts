import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ShipmentCategory } from '@/services/shipment.service';

interface CategoriesResponse {
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: ShipmentCategory[];
}

interface CategoryPayload {
  name: string;
  slug: string;
  maxWeight?: number;
  minPrice: number;
  maxPrice?: number;
  maxQuantity?: number;
}

async function getCategories(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<CategoriesResponse>('/shipment-categories', { params });
  return data;
}

async function createCategory(payload: CategoryPayload) {
  const { data } = await apiClient.post('/shipments/categories', payload);
  return data;
}

async function updateCategory(id: string, payload: Partial<CategoryPayload>) {
  const { data } = await apiClient.patch(`/shipments/categories/${id}`, payload);
  return data;
}

async function deleteCategory(id: string) {
  const { data } = await apiClient.delete(`/shipments/categories/${id}`);
  return data;
}

export function useAdminCategories(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin-categories', params],
    queryFn: () => getCategories(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryPayload> }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });
}
