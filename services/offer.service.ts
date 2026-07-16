import apiClient from '@/lib/api-client';
import type { Trip } from '@/services/trip.service';
import type { Shipment } from '@/services/shipment.service';

export interface Offer {
  id: string;
  shipmentId: string;
  travellerId: string;
  tripId: string;
  senderPrice: number;
  offeredPrice: number;
  bagType: 'cabin' | 'checkIn';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  isCounterOffer: boolean;
  createdAt: string;
  traveller?: { id: string; name: string; email: string; image: string | null };
  trip?: Trip;
  shipment?: Shipment;
}

export async function createOffer(payload: {
  shipmentId: string;
  tripId: string;
  offeredPrice: number;
  bagType: 'cabin' | 'checkIn';
}): Promise<Offer> {
  const { data } = await apiClient.post<{ data: Offer }>('/offers', payload);
  return data.data;
}

export async function getOffersForShipment(shipmentId: string): Promise<Offer[]> {
  const { data } = await apiClient.get<{ data: Offer[] }>(`/shipments/${shipmentId}/offers`);
  return data.data;
}

export async function acceptOffer(offerId: string): Promise<Offer> {
  const { data } = await apiClient.post<{ data: Offer }>(`/offers/${offerId}/accept`);
  return data.data;
}

export async function rejectOffer(offerId: string): Promise<void> {
  await apiClient.delete(`/offers/${offerId}`);
}

export async function getSentOffers(): Promise<Offer[]> {
  const { data } = await apiClient.get<{ data: Offer[] }>('/offers/sent');
  return data.data;
}

export async function getReceivedOffers(): Promise<Offer[]> {
  const { data } = await apiClient.get<{ data: Offer[] }>('/offers/received');
  return data.data;
}
