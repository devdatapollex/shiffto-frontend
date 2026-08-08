'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { useRole } from '@/hooks/use-role';
import { cancelShipment } from '@/services/shipment.service';
import { toast } from 'sonner';
import { ShipmentTimeline } from '@/components/tracking/shipment-timeline';
import { StepAdvancementCard } from '@/components/tracking/step-advancement-card';
import { ShipmentReviewCard } from '@/components/shipments/shipment-review-card';
import { ShipmentChatDrawer } from '@/components/shipments/shipment-chat-drawer';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import {
  ChevronLeft,
  Package,
  User,
  Plane,
  Eye,
  MessageSquare,
  RotateCcw,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';

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

export default function ShipmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const shipmentId = params?.id as string;
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { user, isAdmin } = useRole();
  const {
    data: shipment,
    isLoading,
    error,
    refetch,
  } = useShipmentDetails(shipmentId, !!shipmentId);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelShipment(id),
    onSuccess: () => {
      toast.success('Shipment canceled successfully');
      queryClient.invalidateQueries({ queryKey: ['shipment-details', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setIsCancelModalOpen(false);
      refetch();
    },
    onError: (err: any) => {
      const message =
        err?.message ||
        err?.data?.message ||
        err?.response?.data?.message ||
        'Failed to cancel shipment';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
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
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Package className="h-16 w-16 text-slate-300 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800">Shipment Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          We couldn&apos;t retrieve details for this shipment. It may have been deleted, or you
          might not have authorization to view it.
        </p>
        <Button asChild className="mt-6 bg-[#0D307A] hover:bg-[#092E72]">
          <Link href="/dashboard/tracking">Back to Tracking</Link>
        </Button>
      </div>
    );
  }

  const shortShipmentId = `SH-${shipment.id.slice(-6).toUpperCase()}`;

  // Check if current user is the traveller for this trip or admin
  const isTraveller = Boolean(user && shipment.trip?.user?.id === user.id);
  const isSender = Boolean(user && shipment.userId === user.id);
  const canAdvanceStep = (isTraveller || isAdmin) && shipment.status === 'ACTIVE';
  const canChat =
    (isTraveller || isSender || isAdmin) && shipment.status === 'ACTIVE' && Boolean(shipment.trip);
  const canCancel =
    (isSender || isAdmin) && (shipment.status === 'AWAITING_MATCH' || shipment.status === 'ACTIVE');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <Link href="/dashboard/tracking" className="hover:text-slate-800 transition-colors">
              Tracking
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Shipment: #{shortShipmentId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(true)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 rounded-lg gap-2 text-xs font-semibold h-9 px-4 shadow-xs cursor-pointer"
            >
              <Ban className="h-4 w-4 text-rose-600" />
              Cancel Shipment
            </Button>
          )}

          {canChat && (
            <Button
              onClick={() => setIsChatDrawerOpen(true)}
              className="bg-[#0D307A] hover:bg-[#092E72] text-white rounded-lg gap-2 text-xs font-semibold h-9 px-4 shadow-sm cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              {isTraveller ? 'Message Sender' : isSender ? 'Message Traveler' : 'Shipment Chat'}
            </Button>
          )}
        </div>
      </div>

      {/* Shipment Review Card for DELIVERED status */}
      <ShipmentReviewCard shipment={shipment} currentUser={user} isAdmin={isAdmin} />

      {/* Canceled Shipment Refund Status Card */}
      {shipment.status === 'CANCELED' && (
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
            <RotateCcw className="h-5 w-5 text-rose-600" />
            <span>Shipment Canceled</span>
          </div>

          {isTraveller ? (
            <p className="text-xs text-slate-600 font-medium">
              This shipment was canceled by the sender. No further action is required for this item.
            </p>
          ) : (
            <>
              {shipment.paymentTransaction?.status === 'PENDING_REFUND' &&
                (() => {
                  const refundable =
                    shipment.paymentTransaction.refundableAmount ??
                    shipment.paymentTransaction.grossAmount ??
                    0;
                  const cancellationFee = shipment.paymentTransaction.cancellationFeeAmount ?? 0;
                  const hasFee = cancellationFee > 0;
                  return (
                    <div className="bg-white/90 border border-rose-200 p-3.5 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span>Refund Status:</span>
                        <span className="text-rose-700 font-extrabold uppercase tracking-wide">
                          Refund Pending
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        A net refund of{' '}
                        <span className="font-bold text-slate-900">${refundable.toFixed(2)}</span>{' '}
                        {hasFee ? '(after cancellation fee applied) ' : ''}has been queued for a
                        manual refund payout. An admin will process your payout off-platform (bKash,
                        Bank, Nagad, etc.) shortly.
                      </p>
                    </div>
                  );
                })()}
              {shipment.paymentTransaction?.status === 'REFUNDED' &&
                (() => {
                  const refundable =
                    shipment.paymentTransaction.refundableAmount ??
                    shipment.paymentTransaction.grossAmount ??
                    0;
                  const cancellationFee = shipment.paymentTransaction.cancellationFeeAmount ?? 0;
                  const hasFee = cancellationFee > 0;
                  return (
                    <div className="bg-white/90 border border-purple-200 p-3.5 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-purple-900">
                        <span>Refund Status:</span>
                        <span className="text-purple-700 font-extrabold uppercase tracking-wide">
                          Refund Processed
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Your net refund of{' '}
                        <span className="font-bold text-slate-900">${refundable.toFixed(2)}</span>{' '}
                        {hasFee ? '(after cancellation fee applied) ' : ''}has been successfully
                        processed by the admin.
                      </p>
                      {shipment.paymentTransaction.refundTxnId && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-800 pt-1 border-t border-purple-100 mt-2">
                          <span>Reference Transaction ID:</span>
                          <span className="font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            {shipment.paymentTransaction.refundTxnId}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </>
          )}
        </div>
      )}

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

      {/* Step Advancement Action Card for Traveller / Admin */}
      {canAdvanceStep && shipment.shipmentSteps && shipment.shipmentSteps.length > 0 && (
        <StepAdvancementCard shipment={shipment} steps={shipment.shipmentSteps} />
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
                      if (shipment.trip) {
                        router.push(`/dashboard/tracking/trip/${shipment.trip.id}`);
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
                        {getCountryByCode(shipment.trip.toCountry)?.name ?? shipment.trip.toCountry}
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
                        {shipment.trip.remainingCabinCapacity ?? 0} /{' '}
                        {shipment.trip.cabinBagCapacity ?? 0} KG
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-sm">
                      <span className="text-slate-500 font-medium">Check-in Avail</span>
                      <span className="font-semibold text-[#0D307A]">
                        {shipment.trip.remainingCheckInCapacity ?? 0} /{' '}
                        {shipment.trip.checkInBagCapacity ?? 0} KG
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
                            router.push(`/dashboard/tracking/trip/${shipment.trip.id}`);
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

      <ShipmentChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        shipmentId={shipment.id}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive font-semibold text-lg">
              Cancel Shipment
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-1">
              Are you sure you want to cancel &quot;
              <span className="font-semibold text-slate-900">{shipment.itemName}</span>&quot;?
            </DialogDescription>
          </DialogHeader>

          {shipment.status === 'ACTIVE' &&
            (() => {
              const gross =
                shipment.paymentTransaction?.grossAmount ?? shipment.pricePerKg * shipment.weight;
              const fee = gross * 0.3;
              const netRefund = gross - fee;
              return (
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-2 text-xs my-2">
                  <div className="flex items-center justify-between text-slate-600 font-medium">
                    <span>Original Amount Paid</span>
                    <span className="font-semibold text-slate-900">${gross.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-600 font-medium">
                    <span>Cancellation Fee (30%)</span>
                    <span className="font-semibold">-${fee.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-sm">
                    <span>Net Refund Amount</span>
                    <span className="text-emerald-700 font-extrabold">${netRefund.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 leading-normal">
                    As per policy, sender-initiated cancellations incur a 30% cancellation fee. The
                    net refund will be queued for admin processing.
                  </p>
                </div>
              );
            })()}

          {shipment.status === 'AWAITING_MATCH' && (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-200 my-2">
              No payment has been processed for this shipment because no offer was accepted yet.
            </p>
          )}

          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Shipment
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate(shipment.id)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Canceling...' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
