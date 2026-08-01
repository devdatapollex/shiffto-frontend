import apiClient from '@/lib/api-client';

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  shipmentId: string;
  offerId: string;
  senderId: string;
  travellerId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  currency: string;
  paymentGateway: string;
  gatewayTxnId: string | null;
  status: 'PENDING_PAYMENT' | 'ESCROWED' | 'PENDING_RELEASE' | 'PENDING_REFUND' | 'RELEASED' | 'REFUNDED' | 'FAILED';
  proofPhotoUrl: string | null;
  releasedAt: string | null;
  refundTxnId?: string | null;
  refundReason?: string | null;
  refundMethodDetails?: Record<string, any> | null;
  refundedAt?: string | null;
  refundedBy?: string | null;
  adminRefundNotes?: string | null;
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
    pendingRefundAmount?: number;
    refundedAmount: number;
    disputeMoney: number;
  };
  transactions: PaymentTransaction[];
}

export type TravelerEarningsTransaction = PaymentTransaction;

export interface WithdrawalPaymentMethodDetails {
  type?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  cryptoAddress?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface WithdrawalHistoryItem {
  id: string;
  withdrawalNo: string;
  userId: string;
  amount: number;
  paymentMethodId: string | null;
  paymentMethodDetails: WithdrawalPaymentMethodDetails | null;
  payoutTxnId: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface TravelerSummaryResponse {
  stats: {
    totalEarnings: number;
    escrowedEarnings: number;
    pendingReleaseEarnings: number;
    awaitingPayout: number;
    disputeAmount: number;
    availableForWithdrawal: number;
    totalWithdrawn?: number;
  };
  earningsHistory: TravelerEarningsTransaction[];
  withdrawalHistory: WithdrawalHistoryItem[];
}

export async function getSenderPaymentsSummary(): Promise<SenderSummaryResponse> {
  const { data } = await apiClient.get<{ data: SenderSummaryResponse }>('/payments/sender-summary');
  return data.data;
}

export async function getTravelerEarningsSummary(): Promise<TravelerSummaryResponse> {
  const { data } = await apiClient.get<{ data: TravelerSummaryResponse }>(
    '/payments/traveler-summary'
  );
  return data.data;
}

export async function releasePayment(transactionId: string): Promise<PaymentTransaction> {
  const { data } = await apiClient.post<{ data: PaymentTransaction }>(
    `/payments/${transactionId}/release`
  );
  return data.data;
}

export interface AdminPaymentTransaction {
  id: string;
  transactionId: string;
  shipmentId: string;
  offerId: string;
  senderId: string;
  travellerId: string;
  grossAmount: number;
  currency: string;
  paymentGateway: string;
  gatewayTxnId?: string | null;
  status: 'PENDING_PAYMENT' | 'ESCROWED' | 'PENDING_RELEASE' | 'PENDING_REFUND' | 'RELEASED' | 'REFUNDED' | 'FAILED';
  proofPhotoUrl?: string | null;
  releasedAt?: string | null;
  releasedBy?: string | null;
  refundTxnId?: string | null;
  refundReason?: string | null;
  refundMethodDetails?: Record<string, any> | null;
  refundedAt?: string | null;
  refundedBy?: string | null;
  adminRefundNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  commissionAmount: number;
  netAmount: number;
  shipment: {
    id: string;
    itemName: string;
    status: string;
    weight: number;
    tripId?: string;
  };
  offer: {
    id: string;
    tripId: string;
    offeredPrice: number;
    trip?: {
      id: string;
      fromCountry: string;
      toCountry: string;
    };
  };
  sender: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    paymentMethods?: any[];
  };
  traveller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
}

export interface AdminPaymentsResponse {
  stats: {
    totalPlatformRevenue: number;
    totalGrossVolume: number;
    totalEscrowed: number;
    totalPendingRelease: number;
    totalPendingRefund?: number;
    totalReleased: number;
    totalRefunded: number;
    estimatedCommission: number;
    commissionRate: number;
  };
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: AdminPaymentTransaction[];
}

export async function getAdminPayments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<AdminPaymentsResponse> {
  const { data } = await apiClient.get<{ data: AdminPaymentsResponse }>('/payments/admin', {
    params,
  });
  return data.data;
}

export async function processAdminRefund(
  transactionId: string,
  payload: { refundTxnId: string; adminNotes?: string; proofPhotoUrl?: string }
): Promise<AdminPaymentTransaction> {
  const { data } = await apiClient.post<{ data: AdminPaymentTransaction }>(
    `/payments/admin/refunds/${transactionId}/process`,
    payload
  );
  return data.data;
}
