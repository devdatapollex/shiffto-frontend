import apiClient from '@/lib/api-client';
import type { CreateShipmentPayload } from '@/lib/validations/shipment';

export interface Shipment {
  id: string;
  itemName: string;
  weight: number;
  quantity: number;
  description: string;
  itemPhotos: string[];
  instructions: string;
  fromCountry: string;
  toCountry: string;
  pricePerKg: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  userId: string;
  tripId: string | null;
  bagType: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ShipmentsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Shipment[];
}

export async function createShipment(payload: CreateShipmentPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/shipments', payload);
  return data;
}

export async function getAvailableShipments(params?: {
  page?: number;
  limit?: number;
  fromCountry?: string;
  toCountry?: string;
}): Promise<ShipmentsResponse> {
  const { data } = await apiClient.get<ShipmentsResponse>('/shipments', {
    params: {
      type: 'available',
      ...params,
    },
  });
  return data;
}
