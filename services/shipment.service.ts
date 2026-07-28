import apiClient from '@/lib/api-client';
import type { CreateShipmentPayload } from '@/lib/validations/shipment';
import type { Offer } from '@/services/offer.service';

export type ShipmentStatus = 'AWAITING_MATCH' | 'ACTIVE' | 'DELIVERED' | 'CANCELED';

export interface ShipmentCategory {
  id: string;
  name: string;
  slug: string;
  maxWeight: number | null;
  minPrice: number;
  maxPrice: number | null;
  maxQuantity: number | null;
}

export interface ShipmentStepDefinition {
  id: string;
  stage: string;
  label: string;
  order: number;
  description: string | null;
}

export interface ShipmentStep {
  id: string;
  shipmentId: string;
  stage: string;
  order: number;
  isCurrent: boolean;
  completedAt: string | null;
  notes: string | null;
  photoUrl?: string | null;
  definition: ShipmentStepDefinition;
}

export interface ShipmentTripDetails {
  id: string;
  flightNumber: string;
  fromCountry: string;
  toCountry: string;
  flightDate: string;
  flightTime: string;
  airportArrivalTime: string | null;
  status: string;
  cabinBagCapacity?: number;
  checkInBagCapacity?: number;
  remainingCabinCapacity?: number;
  remainingCheckInCapacity?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone?: string | null;
  };
}

export interface ShipmentDetails extends Omit<Shipment, 'tripId'> {
  trip: ShipmentTripDetails | null;
}

export interface PaymentTransactionDetails {
  id: string;
  transactionId: string;
  grossAmount: number;
  currency: string;
  status: string;
  gatewayTxnId?: string | null;
  proofPhotoUrl?: string | null;
  releasedAt?: string | null;
  createdAt: string;
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
  status: ShipmentStatus;
  userId: string;
  categoryId: string;
  category?: ShipmentCategory;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  paymentTransaction?: PaymentTransactionDetails | null;
  shipmentSteps?: ShipmentStep[];
  offers?: Offer[];
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
  const { data } = await apiClient.get<ShipmentsResponse>('/trips/available-shipments', {
    params,
  });
  return data;
}

export async function getAvailableShipmentsCount(): Promise<number> {
  const { data } = await apiClient.get<{ success: boolean; data: { count: number } }>(
    '/trips/available-shipments/count'
  );
  return data.data.count;
}

export async function sendShipmentOtp(): Promise<void> {
  await apiClient.post('/shipments/send-otp');
}

export async function getShipments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ShipmentsResponse> {
  const { data } = await apiClient.get<ShipmentsResponse>('/shipments', { params });
  return data;
}

export async function getShipmentSteps(shipmentId: string): Promise<ShipmentStep[]> {
  const { data } = await apiClient.get<{ data: ShipmentStep[] }>(`/shipments/${shipmentId}/steps`);
  return data.data;
}

export async function getShipmentDetails(shipmentId: string): Promise<ShipmentDetails> {
  const { data } = await apiClient.get<{ data: ShipmentDetails }>(
    `/shipments/${shipmentId}/details`
  );
  return data.data;
}

export async function confirmPickup(
  shipmentId: string,
  payload: { photoUrl: string; notes?: string }
): Promise<ShipmentStep[]> {
  const { data } = await apiClient.post<{ data: ShipmentStep[] }>(
    `/shipments/${shipmentId}/steps/confirm-pickup`,
    payload
  );
  return data.data;
}

export async function confirmCheckin(
  shipmentId: string,
  payload?: { notes?: string }
): Promise<ShipmentStep[]> {
  const { data } = await apiClient.post<{ data: ShipmentStep[] }>(
    `/shipments/${shipmentId}/steps/confirm-checkin`,
    payload ?? {}
  );
  return data.data;
}

export async function confirmTransit(
  shipmentId: string,
  payload?: { notes?: string }
): Promise<ShipmentStep[]> {
  const { data } = await apiClient.post<{ data: ShipmentStep[] }>(
    `/shipments/${shipmentId}/steps/confirm-transit`,
    payload ?? {}
  );
  return data.data;
}

export async function confirmArrival(
  shipmentId: string,
  payload?: { notes?: string }
): Promise<ShipmentStep[]> {
  const { data } = await apiClient.post<{ data: ShipmentStep[] }>(
    `/shipments/${shipmentId}/steps/confirm-arrival`,
    payload ?? {}
  );
  return data.data;
}

export async function confirmOutForDelivery(
  shipmentId: string,
  payload?: { notes?: string }
): Promise<ShipmentStep[]> {
  const { data } = await apiClient.post<{ data: ShipmentStep[] }>(
    `/shipments/${shipmentId}/steps/confirm-out-for-delivery`,
    payload ?? {}
  );
  return data.data;
}

export async function confirmDelivery(
  shipmentId: string,
  payload: { photoUrl: string; notes?: string }
): Promise<ShipmentStep[]> {
  const { data } = await apiClient.post<{ data: ShipmentStep[] }>(
    `/shipments/${shipmentId}/steps/confirm-delivery`,
    payload
  );
  return data.data;
}
