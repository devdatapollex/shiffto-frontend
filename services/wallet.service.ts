import apiClient from '@/lib/api-client';

export type PaymentMethodType = 'BKASH' | 'NAGAD' | 'BANK_ACCOUNT' | 'CRYPTO' | 'CARD';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  accountName: string | null;
  accountNumber: string;
  bankName: string | null;
  branchName: string | null;
  routingNumber: string | null;
  cryptoAddress: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreatePaymentMethodPayload {
  type: PaymentMethodType;
  accountName?: string;
  accountNumber: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  cryptoAddress?: string;
  isPrimary?: boolean;
}

export async function getMyPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await apiClient.get<{ data: PaymentMethod[] }>('/wallet');
  return data.data;
}

export async function addPaymentMethod(
  payload: CreatePaymentMethodPayload
): Promise<PaymentMethod> {
  const { data } = await apiClient.post<{ data: PaymentMethod }>('/wallet', payload);
  return data.data;
}

export async function updatePaymentMethod(
  id: string,
  payload: Partial<CreatePaymentMethodPayload>
): Promise<PaymentMethod> {
  const { data } = await apiClient.put<{ data: PaymentMethod }>(`/wallet/${id}`, payload);
  return data.data;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await apiClient.delete(`/wallet/${id}`);
}

export async function setPrimaryPaymentMethod(id: string): Promise<PaymentMethod> {
  const { data } = await apiClient.patch<{ data: PaymentMethod }>(`/wallet/${id}/primary`);
  return data.data;
}
