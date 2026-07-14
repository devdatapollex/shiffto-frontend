import apiClient from '@/lib/api-client';
import type { CreateShipmentPayload } from '@/lib/validations/shipment';

export interface ShipmentCategory {
  id: string;
  name: string;
  slug: string;
  maxWeight: number | null;
  minPrice: number;
  maxPrice: number | null;
  maxQuantity: number | null;
}

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
  tripId: string | null;
  bagType: string | null;
  createdAt?: string;
  updatedAt?: string;
  status: string;
  userId: string;
  categoryId: string;
  category?: ShipmentCategory;
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

export async function sendShipmentOtp(): Promise<void> {
  await apiClient.post('/shipments/send-otp');
}

export async function getShipments(): Promise<ShipmentsResponse> {
  const { data } = await apiClient.get<ShipmentsResponse>('/shipments');
  return data;
}
