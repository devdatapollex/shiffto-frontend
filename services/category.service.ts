import apiClient from '@/lib/api-client';

export interface ShipmentCategory {
  id: string;
  name: string;
  slug: string;
  maxWeight: number | null;
  minPrice: number;
  maxPrice: number | null;
  maxQuantity: number | null;
}

interface CategoriesResponse {
  success: boolean;
  data: ShipmentCategory[];
  meta: { page: number; limit: number; total: number };
}

export async function getCategories(): Promise<ShipmentCategory[]> {
  const { data } = await apiClient.get<CategoriesResponse>('/shipment-categories');
  return data.data;
}
