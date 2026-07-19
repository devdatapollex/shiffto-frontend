import apiClient from '@/lib/api-client';

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  shipmentId: string;
  offerId: string;
  senderId: string;
  travellerId: string;
  grossAmount: number;
  currency: string;
  paymentGateway: string;
  gatewayTxnId: string | null;
  status: 'PENDING_PAYMENT' | 'ESCROWED' | 'PENDING_RELEASE' | 'RELEASED' | 'REFUNDED' | 'FAILED';
  proofPhotoUrl: string | null;
  releasedAt: string | null;
  createdAt: string;
  shipment?: {
    id: string;
    itemName: string;
    status: string;
  };
}

export interface SenderSummaryResponse {
  stats: {
    totalSpent: number;
    pendingAmount: number;
    refundedAmount: number;
    disputeMoney: number;
  };
  transactions: PaymentTransaction[];
}

export interface TravelerEarningsTransaction extends PaymentTransaction {
  commissionAmount: number;
  netAmount: number;
}

export interface WithdrawalHistoryItem {
  id: string;
  withdrawalNo: string;
  userId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  paymentMethodId: string | null;
  paymentMethodDetails: any;
  payoutTxnId: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface TravelerSummaryResponse {
  stats: {
    totalEarnings: number;
    pendingReleaseEarnings: number;
    awaitingPayout: number;
    disputeAmount: number;
    availableForWithdrawal: number;
    commissionRate: number;
    commissionPercentage: number;
  };
  earningsHistory: TravelerEarningsTransaction[];
  withdrawalHistory: WithdrawalHistoryItem[];
}

export async function getSenderPaymentsSummary(): Promise<SenderSummaryResponse> {
  const { data } = await apiClient.get<{ data: SenderSummaryResponse }>('/payments/sender-summary');
  return data.data;
}

export async function getTravelerEarningsSummary(): Promise<TravelerSummaryResponse> {
  const { data } = await apiClient.get<{ data: TravelerSummaryResponse }>('/payments/traveler-summary');
  return data.data;
}

export async function releasePayment(transactionId: string): Promise<PaymentTransaction> {
  const { data } = await apiClient.post<{ data: PaymentTransaction }>(`/payments/${transactionId}/release`);
  return data.data;
}
