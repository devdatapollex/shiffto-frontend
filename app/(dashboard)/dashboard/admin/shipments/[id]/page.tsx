'use client';

import { useParams, useRouter } from 'next/navigation';
import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { useRole } from '@/hooks/use-role';
import { releasePayment, processAdminRefund } from '@/services/payment.service';
import { toast } from 'sonner';
import { ShipmentTimeline } from '@/components/tracking/shipment-timeline';
import { StepAdvancementCard } from '@/components/tracking/step-advancement-card';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import {
  ChevronLeft,
  Package,
  User,
  Image as ImageIcon,
  Clock,
  Hourglass,
  CheckCircle2,
  FileText,
  Plane,
  Eye,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/role-guard';
import { toRelativeImageUrl } from '@/lib/image-utils';
import { getCountryByCode } from '@/lib/constants/countries';
import Image from 'next/image';
import { useState } from 'react';
import { AdminCancelShipmentModal } from '@/components/admin/admin-cancel-shipment-modal';

interface PaymentTxInfo {
  id?: string;
  status?: string;
  grossAmount?: number;
  transactionId?: string;
  proofPhotoUrl?: string;
  refundableAmount?: number;
  cancellationFeeAmount?: number;
  refundInitiator?: string | null;
  refundReason?: string | null;
  refundTxnId?: string | null;
  refundedAt?: string | null;
  adminRefundNotes?: string | null;
  releasedAt?: string | null;
  refundMethodDetails?: {
    type?: string;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
    routingNumber?: string;
    cryptoAddress?: string;
  } | null;
}

interface TripInfo {
  ticketPhoto?: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  try {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

const STAGE_DISPLAY_MAP: Record<string, string> = {
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  PICKED_UP: 'Picked Up',
  CHECKED_IN: 'Checked In',
  IN_TRANSIT: 'In Transit',
  ARRIVED_AT_DESTINATION: 'Arrived at Destination',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

export default function AdminShipmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params?.id as string;

  const { user } = useRole();
  const { data: shipment, isLoading, error, refetch } = useShipmentDetails(shipmentId, !!shipmentId);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isProcessRefundModalOpen, setIsProcessRefundModalOpen] = useState(false);
  const [refundTxnIdInput, setRefundTxnIdInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const handleProcessRefundSubmit = async () => {
    const txId = (shipment as unknown as { paymentTransaction?: PaymentTxInfo })
      ?.paymentTransaction?.transactionId;
    if (!txId || !refundTxnIdInput.trim()) {
      toast.error('Refund Reference Transaction ID is required');
      return;
    }
    setIsSubmittingRefund(true);
    try {
      await processAdminRefund(txId, {
        refundTxnId: refundTxnIdInput.trim(),
        adminNotes: adminNotesInput.trim() || undefined,
      });
      toast.success('Refund successfully processed and marked as REFUNDED!');
      setIsProcessRefundModalOpen(false);
      setRefundTxnIdInput('');
      setAdminNotesInput('');
      refetch();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to process refund';
      toast.error(errorMsg);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const handleReleasePayment = async () => {
    const txId = (shipment as unknown as { paymentTransaction?: PaymentTxInfo })
      ?.paymentTransaction?.transactionId;
    if (!txId) {
      toast.error('No payment transaction ID found for this shipment');
      return;
    }
    setIsReleasing(true);
    try {
      await releasePayment(txId);
      toast.success('Payment successfully released to traveler!');
      window.location.reload();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to release payment';
      toast.error(errorMsg);
    } finally {
      setIsReleasing(false);
    }
  };

  const formatStepTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' ' +
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    );
  };

  if (isLoading) {
    return (
      <RoleGuard
        roles={['admin']}
        fallback={
          <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
        }
      >
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
          {/* Navigation Breadcrumb Skeleton */}
          <div className="flex items-center gap-4 h-6 w-64 bg-slate-100 rounded animate-pulse" />

          {/* Timeline Skeleton */}
          <div className="h-44 w-full bg-slate-50 border border-slate-200/50 rounded-lg animate-pulse" />

          {/* Content Columns Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-44 w-full bg-slate-50 border border-slate-200/50 rounded-lg animate-pulse" />
              <div className="h-64 w-full bg-slate-50 border border-slate-200/50 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-44 w-full bg-slate-50 border border-slate-200/50 rounded-lg animate-pulse" />
              <div className="h-64 w-full bg-slate-50 border border-slate-200/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (error || !shipment) {
    return (
      <RoleGuard
        roles={['admin']}
        fallback={
          <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
        }
      >
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Package className="h-16 w-16 text-slate-300 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800">Shipment Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            We couldn&apos;t retrieve details for this shipment. It may have been deleted, or you might
            not have authorization to view it.
          </p>
          <Button asChild className="mt-6 bg-[#0D307A] hover:bg-[#092E72]">
            <Link href="/dashboard/admin/shipments">Back to Shipments</Link>
          </Button>
        </div>
      </RoleGuard>
    );
  }

  const isTraveller = Boolean(user && shipment.trip?.user?.id === user.id);
  const shortShipmentId = `SH-${shipment.id.slice(-6).toUpperCase()}`;
  const canAdvanceStep = shipment.status === 'ACTIVE';

  return (
    <RoleGuard
      roles={['admin']}
      fallback={
        <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
      }
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 font-medium">
              <Link
                href="/dashboard/admin/shipments"
                className="hover:text-slate-800 transition-colors"
              >
                Admin Shipments
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">Shipment: #{shortShipmentId}</span>
            </div>
          </div>
          {shipment.status !== 'CANCELED' && shipment.status !== 'DELIVERED' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="h-9 px-4 font-semibold text-xs rounded-lg cursor-pointer"
            >
              <AlertTriangle className="mr-1.5 h-4 w-4" />
              Cancel Shipment
            </Button>
          )}
        </div>

        {/* Payment Verification & Release / Refund Card for Admin */}
        {(() => {
          const paymentTx = (shipment as unknown as { paymentTransaction?: PaymentTxInfo })?.paymentTransaction;
          if (!paymentTx) return null;

          const isCanceled = shipment.status === 'CANCELED';
          const isDelivered = shipment.status === 'DELIVERED';

          // Scenario 1: Shipment is CANCELED
          if (isCanceled) {
            // Sub-scenario 1A: Pending Refund
            if (paymentTx.status === 'PENDING_REFUND') {
              const initiatorLabel =
                paymentTx.refundInitiator === 'SENDER'
                  ? 'Sender Initiated'
                  : paymentTx.refundInitiator === 'TRAVELLER'
                    ? 'Traveler Initiated'
                    : paymentTx.refundInitiator === 'ADMIN'
                      ? 'Admin Initiated'
                      : 'Pending Refund';

              const method = paymentTx.refundMethodDetails;

              return (
                <div className="bg-white border border-rose-200 rounded-lg shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
                    <div>
                      <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Shipment Canceled — Refund Pending
                      </h2>
                      <p className="text-xs text-rose-600 mt-0.5">
                        This shipment has been canceled. Review calculated refund amounts and process payout to sender.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-medium">Payment Status:</span>
                      <span className="px-3 py-1 rounded-full font-bold text-xs bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                        PENDING_REFUND
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-rose-50/50 p-4 rounded-lg border border-rose-100">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Escrowed Gross Amount:</p>
                      <p className="text-xl font-extrabold text-slate-900">
                        ${(paymentTx.grossAmount || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Retained Cancellation Fee:</p>
                      <p className="text-xl font-extrabold text-amber-700">
                        -${(paymentTx.cancellationFeeAmount || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Net Refundable to Sender:</p>
                      <p className="text-xl font-extrabold text-emerald-700">
                        ${(paymentTx.refundableAmount ?? paymentTx.grossAmount ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Initiator:</span>
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                          {initiatorLabel}
                        </span>
                      </div>
                      {paymentTx.refundReason && (
                        <p className="text-slate-600">
                          <span className="font-semibold">Reason:</span> {paymentTx.refundReason}
                        </p>
                      )}
                      {method && (
                        <p className="text-slate-500 font-mono">
                          <span className="font-semibold font-sans">Payout Method:</span>{' '}
                          {method.type || 'ACCOUNT'} {method.accountNumber ? `(${method.accountNumber})` : ''} {method.bankName ? `- ${method.bankName}` : ''}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => setIsProcessRefundModalOpen(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 h-10 rounded-lg gap-2 cursor-pointer transition-colors shadow-sm shrink-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Process Refund to Sender
                    </Button>
                  </div>
                </div>
              );
            }

            // Sub-scenario 1B: Refunded
            if (paymentTx.status === 'REFUNDED') {
              return (
                <div className="bg-white border border-purple-200 rounded-lg shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
                    <div>
                      <h2 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        Shipment Canceled — Refund Processed
                      </h2>
                      <p className="text-xs text-purple-600 mt-0.5">
                        Refund has been successfully issued to sender.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-medium">Payment Status:</span>
                      <span className="px-3 py-1 rounded-full font-bold text-xs bg-purple-100 text-purple-800 border border-purple-200">
                        REFUNDED
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-purple-50/50 p-4 rounded-lg border border-purple-100 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium">Refund Reference Txn ID:</p>
                      <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                        {paymentTx.refundTxnId || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-medium">Refunded Amount:</p>
                      <p className="font-extrabold text-emerald-700 text-base mt-0.5">
                        ${(paymentTx.refundableAmount ?? paymentTx.grossAmount ?? 0).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 font-medium">Retained Cancellation Fee:</p>
                      <p className="font-extrabold text-amber-700 text-base mt-0.5">
                        ${(paymentTx.cancellationFeeAmount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {paymentTx.adminRefundNotes && (
                    <p className="text-xs text-slate-600 italic border-t border-purple-100 pt-2">
                      <span className="font-semibold not-italic text-slate-700">Admin Notes:</span> {paymentTx.adminRefundNotes}
                    </p>
                  )}
                </div>
              );
            }

            // Sub-scenario 1C: Released prior to cancellation (Edge case)
            if (paymentTx.status === 'RELEASED') {
              return (
                <div className="bg-white border border-amber-200 rounded-lg shadow-sm p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                    <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Shipment Canceled (Payment Was Previously Released)
                    </h2>
                    <span className="px-3 py-1 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800">
                      RELEASED
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Escrowed funds of <strong>${(paymentTx.grossAmount || 0).toFixed(2)}</strong> were released to traveler prior to shipment cancellation.
                  </p>
                </div>
              );
            }

            // Sub-scenario 1D: Pending Payment or Failed
            return (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" />
                    Shipment Canceled — Payment Unfulfilled
                  </h2>
                  <span className="px-3 py-1 rounded-full font-bold text-xs bg-slate-100 text-slate-700">
                    {paymentTx.status || 'CANCELED'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  This shipment was canceled without captured escrow funds. No refund action is required.
                </p>
              </div>
            );
          }

          // Scenario 2: Active / Delivered Shipment
          const deliveredStep = shipment.shipmentSteps?.find((s) => s.stage === 'DELIVERED');
          const deliveryTimestamp = deliveredStep?.completedAt
            ? new Date(deliveredStep.completedAt).getTime()
            : isDelivered && shipment.updatedAt
              ? new Date(shipment.updatedAt).getTime()
              : null;
          const HOLD_MS = 3 * 24 * 60 * 60 * 1000;
          const releaseEligibleAt = deliveryTimestamp ? deliveryTimestamp + HOLD_MS : null;
          const isHoldActive = releaseEligibleAt ? Date.now() < releaseEligibleAt : false;
          const formattedEligibleDate = releaseEligibleAt
            ? new Date(releaseEligibleAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            : '';

          const canReleaseToTraveler =
            isDelivered &&
            (paymentTx.status === 'PENDING_RELEASE' || paymentTx.status === 'ESCROWED') &&
            !isHoldActive;
          const isReleased = paymentTx.status === 'RELEASED';

          return (
            <div className="bg-white border border-slate-200/60 rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Escrow Payment Verification & Release
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify proof of delivery uploaded by traveler and release escrowed funds.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      paymentTx.status === 'RELEASED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : paymentTx.status === 'PENDING_RELEASE'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {paymentTx.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Escrowed Gross Amount:</p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    ${(paymentTx.grossAmount || 0).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Txn ID: #{paymentTx.transactionId}
                  </p>
                </div>

                {paymentTx.proofPhotoUrl && (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 relative rounded-lg border border-slate-200 overflow-hidden bg-white">
                      <Image
                        src={toRelativeImageUrl(paymentTx.proofPhotoUrl)}
                        alt="Delivery proof"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedPhoto({
                          url: paymentTx.proofPhotoUrl!,
                          title: 'Delivery Proof',
                        })
                      }
                      className="text-xs text-slate-700 font-semibold"
                    >
                      View Proof
                    </Button>
                  </div>
                )}

                {canReleaseToTraveler ? (
                  <Button
                    onClick={handleReleasePayment}
                    disabled={isReleasing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 h-10 rounded-lg gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isReleasing ? 'Releasing...' : 'Release Payment to Traveler'}
                  </Button>
                ) : isDelivered &&
                  isHoldActive &&
                  (paymentTx.status === 'PENDING_RELEASE' || paymentTx.status === 'ESCROWED') ? (
                  <div className="flex flex-col items-start md:items-end gap-1">
                    <Button
                      disabled
                      className="bg-amber-50 text-amber-800 text-xs font-semibold px-4 h-10 rounded-lg gap-2 cursor-not-allowed border border-amber-200/80"
                    >
                      <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                      3-Day Hold Active
                    </Button>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Release eligible on {formattedEligibleDate}
                    </span>
                  </div>
                ) : isReleased ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Payment Released
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                    Awaiting Delivery for Release
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Progress Timeline Tracker Card */}
        <div className="bg-white border border-slate-200/60 rounded-lg shadow-sm p-6 overflow-hidden">
          <h2 className="text-sm font-bold text-slate-800 px-4 pb-2 border-b border-slate-100 uppercase tracking-wider">
            Progress Timeline
          </h2>
          {shipment.shipmentSteps && shipment.shipmentSteps.length > 0 ? (
            <ShipmentTimeline steps={shipment.shipmentSteps} />
          ) : (
            <div className="text-center py-6 text-sm text-slate-400">
              Timeline steps have not been initialized.
            </div>
          )}
        </div>

        {/* Step Advancement Action Card for Admin */}
        {canAdvanceStep && shipment.shipmentSteps && shipment.shipmentSteps.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
              Admin Step Override Control
            </span>
            <StepAdvancementCard shipment={shipment} steps={shipment.shipmentSteps} />
          </div>
        )}

        {/* Bottom Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Shipment Item & Receiver Details */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-slate-200/60 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-base font-bold text-slate-800">
                  Shipment : #{shortShipmentId}
                </span>
              </div>

              {/* Shipment Item box */}
              <div className="bg-slate-50/70 border border-slate-100/50 rounded-lg p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {shipment.itemPhotos?.[0] ? (
                      <Image
                        src={toRelativeImageUrl(shipment.itemPhotos[0])}
                        alt={shipment.itemName}
                        className="object-cover w-full h-full"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <Package className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 leading-tight">
                      {shipment.itemName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {shipment.weight} kg &bull; {shipment.quantity}pcs
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-base text-[#0D307A]">
                  ${(shipment.pricePerKg * shipment.weight).toFixed(2)}
                </span>
              </div>

              {/* Receiver Details Section */}
              <div className="space-y-4 pt-5 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800">Receiver Details</h3>

                <div className="space-y-3.5 text-xs md:text-sm">
                  {/* Name Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-medium">Name</span>
                    <span className="font-bold text-[#0D307A]">{shipment.receiverName}</span>
                  </div>

                  {/* Phone Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-medium">Phone</span>
                    <span className="font-semibold text-slate-700">
                      {shipment.receiverPhone || 'N/A'}
                    </span>
                  </div>

                  {/* Address Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-medium">Address</span>
                    <span className="font-semibold text-slate-700 text-right max-w-[70%] break-words">
                      {shipment.receiverAddress || 'N/A'}
                    </span>
                  </div>

                  {/* Instructions Row */}
                  {shipment.instructions && (
                    <div className="flex items-start justify-between gap-4 border-t border-slate-50 pt-3">
                      <span className="text-slate-400 font-medium shrink-0">Instruction</span>
                      <span className="font-semibold text-slate-600 text-right max-w-[70%] break-words">
                        {shipment.instructions}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Trip details / Traveler Details */}
          <div className="flex flex-col gap-6">
            {shipment.trip ? (
              <div className="bg-white border border-slate-200/60 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-base font-bold text-slate-800">
                    Trip : #{`TR-${shipment.trip.id.slice(-6).toUpperCase()}`}
                  </span>
                  {shipment.trip.status && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const ticketPhoto = (shipment.trip as unknown as TripInfo)?.ticketPhoto;
                        if (shipment.trip && ticketPhoto && ticketPhoto !== 'pending') {
                          setSelectedPhoto({
                            url: ticketPhoto,
                            title: 'Flight Ticket Scan',
                          });
                        } else if (shipment.trip) {
                          router.push(`/dashboard/admin/trips/${shipment.trip.id}`);
                        }
                      }}
                      className="h-9 px-4 text-xs font-semibold border-[#0D307A] text-[#0D307A] hover:bg-[#0D307A]/5 hover:text-[#0D307A] rounded-lg gap-2 cursor-pointer transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View ticket
                    </Button>
                  )}
                </div>

                {/* Flight Route Details */}
                <div className="space-y-4">
                  {/* Departure & Arrival labels */}
                  <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                    <span>Departure</span>
                    <span>Arrival</span>
                  </div>

                  {/* Route Row with flags & dashed line */}
                  <div className="flex items-center justify-between gap-4">
                    {/* Departure details */}
                    <div className="flex items-center gap-3 max-w-[42%]">
                      <CountryFlag
                        code={shipment.trip.fromCountry}
                        className="w-8 h-6 rounded shadow-sm shrink-0 object-cover"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#0D307A] text-[15px] md:text-[17px] leading-tight truncate">
                          {getCountryByCode(shipment.trip.fromCountry)?.name ??
                            shipment.trip.fromCountry}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal leading-normal mt-0.5 whitespace-nowrap">
                          {formatTime(shipment.trip.flightTime)},{' '}
                          {formatDate(shipment.trip.flightDate)}
                        </span>
                      </div>
                    </div>

                    {/* Dashed orange line with plane icon in the center */}
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="w-full flex items-center justify-between relative">
                        <div className="flex-1 border-t-2 border-dashed border-orange-300 relative flex justify-center items-center">
                          <Plane className="h-5 w-5 text-[#0D307A] fill-slate-800 rotate-45 absolute -top-2.5 bg-white px-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Arrival details */}
                    <div className="flex items-center gap-3 max-w-[42%] text-right justify-end">
                      <div className="flex flex-col items-end min-w-0">
                        <span className="font-bold text-[#0D307A] text-[15px] md:text-[17px] leading-tight truncate">
                          {getCountryByCode(shipment.trip.toCountry)?.name ??
                            shipment.trip.toCountry}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal leading-normal mt-0.5 whitespace-nowrap">
                          {shipment.trip.airportArrivalTime
                            ? formatTime(shipment.trip.airportArrivalTime)
                            : formatTime(shipment.trip.flightTime)}
                          , {formatDate(shipment.trip.flightDate)}
                        </span>
                      </div>
                      <CountryFlag
                        code={shipment.trip.toCountry}
                        className="w-8 h-6 rounded shadow-sm shrink-0 object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacities Box */}
                <div className="bg-slate-50/70 border border-slate-100/50 rounded-lg p-4 space-y-2.5">
                  {isTraveller ? (
                    <>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-slate-500 font-medium">Cabin Avail</span>
                        <span className="font-semibold text-[#0D307A]">
                          {shipment.trip.remainingCabinCapacity ?? 0} / {shipment.trip.cabinBagCapacity ?? 0} KG
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-slate-500 font-medium">Check-in Avail</span>
                        <span className="font-semibold text-[#0D307A]">
                          {shipment.trip.remainingCheckInCapacity ?? 0} / {shipment.trip.checkInBagCapacity ?? 0} KG
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-500 font-medium">Shipment weight</span>
                      <span className="font-extrabold text-[#0D307A] text-[15px]">
                        {String(shipment.weight).padStart(2, '0')} KG
                      </span>
                    </div>
                  )}
                </div>

                {/* Traveler Details Section */}
                <div className="space-y-4 pt-5 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">Traveler Details</h3>

                  <div className="space-y-3.5 text-xs md:text-sm">
                    {/* Name Row */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400 font-medium">Name</span>
                      <div className="flex items-center gap-2">
                        {shipment.trip.user?.image ? (
                          <div className="w-5 h-5 rounded-full border border-slate-200 overflow-hidden shrink-0">
                            <Image
                              src={toRelativeImageUrl(shipment.trip.user.image)}
                              alt={shipment.trip.user.name || 'Traveler'}
                              width={20}
                              height={20}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                            {(shipment.trip.user?.name || 'Traveler').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span
                          className="font-bold text-[#0D307A] underline hover:text-[#092E72] cursor-pointer"
                          onClick={() => {
                            if (shipment.trip) {
                              router.push(`/dashboard/admin/trips/${shipment.trip.id}`);
                            }
                          }}
                        >
                          {shipment.trip.user?.name || 'Assigned Traveler'}
                        </span>
                      </div>
                    </div>

                    {/* Phone Row */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400 font-medium">Phone</span>
                      <span className="font-semibold text-slate-700">
                        {shipment.trip.user?.phone || 'N/A'}
                      </span>
                    </div>

                    {/* Email Row */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400 font-medium">Email</span>
                      <span className="font-semibold text-slate-700">
                        {shipment.trip.user?.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-lg p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0D307A] mb-4">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Awaiting Traveler Match</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                  This shipment is currently awaiting a traveler. Once matched, the traveler&apos;s
                  flight details, bag capacity, and contact info will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Step Logs Table Card */}
        <div className="bg-white border border-slate-200/60 rounded-lg shadow-sm p-6 overflow-hidden">
          <h2 className="text-sm font-bold text-slate-800 px-4 pb-2 border-b border-slate-100 uppercase tracking-wider mb-4">
            Detailed Step Logs & Traveler Proofs
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <Table>
              <TableHeader className="bg-slate-50/60">
                <TableRow>
                  <TableHead className="w-12 font-semibold text-xs">#</TableHead>
                  <TableHead className="font-semibold text-xs">Stage Name</TableHead>
                  <TableHead className="font-semibold text-xs">Status</TableHead>
                  <TableHead className="font-semibold text-xs">Completed At</TableHead>
                  <TableHead className="font-semibold text-xs">Traveler Notes</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Uploaded Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs text-slate-700">
                {shipment.shipmentSteps && shipment.shipmentSteps.length > 0 ? (
                  shipment.shipmentSteps
                    .sort((a, b) => a.order - b.order)
                    .map((step) => {
                      const isCompleted = !!step.completedAt;
                      const isCurrent = step.isCurrent;

                      return (
                        <TableRow key={step.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono font-semibold text-slate-400">
                            {step.order}
                          </TableCell>
                          <TableCell className="font-bold text-slate-800">
                            {STAGE_DISPLAY_MAP[step.stage] || step.stage}
                          </TableCell>
                          <TableCell>
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 border border-emerald-100">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed
                              </span>
                            ) : isCurrent ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 font-semibold text-indigo-700 border border-indigo-100 animate-pulse">
                                <Clock className="h-3 w-3" />
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-500">
                                <Hourglass className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {formatStepTime(step.completedAt)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-slate-600">
                            {step.notes ? (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                {step.notes}
                              </span>
                            ) : (
                              <span className="text-slate-300 italic">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {step.photoUrl ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedPhoto({
                                    url: step.photoUrl!,
                                    title: STAGE_DISPLAY_MAP[step.stage] || step.stage,
                                  })
                                }
                                className="h-7 text-[11px] font-semibold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                              >
                                <ImageIcon className="mr-1 h-3 w-3" />
                                View Proof
                              </Button>
                            ) : (
                              <span className="text-slate-300 italic">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                      No steps found for this shipment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Full-size Photo Preview Modal */}
        <Dialog open={selectedPhoto !== null} onOpenChange={(o) => !o && setSelectedPhoto(null)}>
          <DialogContent className="max-w-lg rounded-lg p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-emerald-600" />
                Uploaded Proof: {selectedPhoto?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <div className="relative w-full h-80 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 mt-2">
                <Image
                  src={toRelativeImageUrl(selectedPhoto.url)}
                  alt="Proof photo full view"
                  className="object-contain w-full h-full"
                  fill
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
        <AdminCancelShipmentModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          shipment={shipment}
          onSuccess={() => refetch()}
        />

        {/* Process Refund Modal */}
        <Dialog open={isProcessRefundModalOpen} onOpenChange={(o) => !o && setIsProcessRefundModalOpen(false)}>
          <DialogContent className="max-w-md rounded-lg p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-rose-600" />
                Process Refund to Sender
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Enter the reference payment transaction ID for the processed refund payout.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="refund-txn-id" className="text-xs font-semibold text-slate-700">
                  Refund Reference Txn ID <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="refund-txn-id"
                  placeholder="e.g. REF-12345678 or Bank/Stripe Ref ID"
                  value={refundTxnIdInput}
                  onChange={(e) => setRefundTxnIdInput(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-notes" className="text-xs font-semibold text-slate-700">
                  Admin Notes (Optional)
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add any internal processing notes..."
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="text-xs min-h-[70px]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProcessRefundModalOpen(false)}
                disabled={isSubmittingRefund}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleProcessRefundSubmit}
                disabled={isSubmittingRefund || !refundTxnIdInput.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                {isSubmittingRefund ? 'Processing...' : 'Confirm & Process Refund'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
