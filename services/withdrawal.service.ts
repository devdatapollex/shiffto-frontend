import apiClient from '@/lib/api-client';
import type { WithdrawalHistoryItem } from './payment.service';

export interface RequestWithdrawalPayload {
  amount?: number;
  grossAmount?: number;
  paymentMethodId: string;
}

export async function requestWithdrawal(
  payload: RequestWithdrawalPayload
): Promise<WithdrawalHistoryItem> {
  const { data } = await apiClient.post<{ data: WithdrawalHistoryItem }>(
    '/withdrawals/request',
    payload
  );
  return data.data;
}

export async function getMyWithdrawals(): Promise<WithdrawalHistoryItem[]> {
  const { data } = await apiClient.get<{ data: WithdrawalHistoryItem[] }>(
    '/withdrawals/my-withdrawals'
  );
  return data.data;
}

export async function getAllWithdrawals(status?: string): Promise<WithdrawalHistoryItem[]> {
  const params = status ? { status } : {};
  const { data } = await apiClient.get<{ data: WithdrawalHistoryItem[] }>(
    '/withdrawals/admin/all',
    { params }
  );
  return data.data;
}

export async function approveWithdrawal(
  id: string,
  payoutTxnId: string
): Promise<WithdrawalHistoryItem> {
  const { data } = await apiClient.patch<{ data: WithdrawalHistoryItem }>(
    `/withdrawals/admin/${id}/approve`,
    { payoutTxnId }
  );
  return data.data;
}

export async function rejectWithdrawal(
  id: string,
  rejectionReason: string
): Promise<WithdrawalHistoryItem> {
  const { data } = await apiClient.patch<{ data: WithdrawalHistoryItem }>(
    `/withdrawals/admin/${id}/reject`,
    { rejectionReason }
  );
  return data.data;
}
