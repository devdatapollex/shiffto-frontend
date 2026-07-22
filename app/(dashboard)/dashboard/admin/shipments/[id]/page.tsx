'use client';

import { useParams, useRouter } from 'next/navigation';
import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { useRole } from '@/hooks/use-role';
import { releasePayment } from '@/services/payment.service';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/role-guard';
import { toRelativeImageUrl } from '@/lib/image-utils';
import { getCountryByCode } from '@/lib/constants/countries';
import Image from 'next/image';
import { useState } from 'react';

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

  const { data: shipment, isLoading, error } = useShipmentDetails(shipmentId, !!shipmentId);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const handleReleasePayment = async () => {
    const txId = (shipment as any)?.paymentTransaction?.transactionId;
    if (!txId) {
      toast.error('No payment transaction ID found for this shipment');
      return;
    }
    setIsReleasing(true);
    try {
      await releasePayment(txId);
      toast.success('Payment successfully released to traveler!');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to release payment');
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
          <div className="h-44 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />

          {/* Content Columns Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-44 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
              <div className="h-64 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-44 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
              <div className="h-64 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
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
            We couldn't retrieve details for this shipment. It may have been deleted, or you might not have authorization to view it.
          </p>
          <Button asChild className="mt-6 bg-[#0D307A] hover:bg-[#092E72]">
            <Link href="/dashboard/admin/shipments">Back to Shipments</Link>
          </Button>
        </div>
      </RoleGuard>
    );
  }

  const { user } = useRole();
  const isTraveller = Boolean(
    user && shipment.trip?.user?.id === user.id
  );
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
              <Link href="/dashboard/admin/shipments" className="hover:text-slate-800 transition-colors">
                Admin Shipments
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">Shipment: #{shortShipmentId}</span>
            </div>
          </div>
        </div>

        {/* Payment Verification & Release Card for Admin */}
        {(shipment as any)?.paymentTransaction && (
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-4">
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
                    (shipment as any).paymentTransaction.status === 'RELEASED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : (shipment as any).paymentTransaction.status === 'PENDING_RELEASE'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {(shipment as any).paymentTransaction.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Escrowed Gross Amount:</p>
                <p className="text-2xl font-extrabold text-slate-900">
                  ${(shipment as any).paymentTransaction.grossAmount?.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Txn ID: #{(shipment as any).paymentTransaction.transactionId}
                </p>
              </div>

              {(shipment as any).paymentTransaction.proofPhotoUrl && (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 relative rounded-lg border border-slate-200 overflow-hidden bg-white">
                    <Image
                      src={toRelativeImageUrl((shipment as any).paymentTransaction.proofPhotoUrl)}
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
                        url: (shipment as any).paymentTransaction.proofPhotoUrl,
                        title: 'Delivery Proof',
                      })
                    }
                    className="text-xs text-slate-700 font-semibold"
                  >
                    View Proof
                  </Button>
                </div>
              )}

              {(shipment as any).paymentTransaction.status !== 'RELEASED' ? (
                <Button
                  onClick={handleReleasePayment}
                  disabled={isReleasing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-5 text-sm shadow-md"
                >
                  {isReleasing ? 'Releasing...' : 'Release Payment to Traveler'}
                </Button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Released to Traveler
                </span>
              )}
            </div>
          </div>
        )}

        {/* Progress Timeline Tracker Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 overflow-hidden">
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
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-base font-bold text-slate-800">
                  Shipment : #{shortShipmentId}
                </span>
              </div>

              {/* Shipment Item box */}
              <div className="bg-slate-50/70 border border-slate-100/50 rounded-xl p-3 flex items-center justify-between gap-4">
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
                <h3 className="text-base font-bold text-slate-800">
                  Receiver Details
                </h3>

                <div className="space-y-3.5 text-xs md:text-sm">
                  {/* Name Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-medium">Name</span>
                    <span className="font-bold text-[#0D307A]">{shipment.receiverName}</span>
                  </div>

                  {/* Phone Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-medium">Phone</span>
                    <span className="font-semibold text-slate-700">{shipment.receiverPhone || 'N/A'}</span>
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
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden p-6 space-y-6">
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
                        if (shipment.trip && (shipment.trip as any).ticketPhoto && (shipment.trip as any).ticketPhoto !== 'pending') {
                          setSelectedPhoto({
                            url: (shipment.trip as any).ticketPhoto,
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
                      <CountryFlag code={shipment.trip.fromCountry} className="w-8 h-6 rounded shadow-sm shrink-0 object-cover" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#0D307A] text-[15px] md:text-[17px] leading-tight truncate">
                          {getCountryByCode(shipment.trip.fromCountry)?.name ?? shipment.trip.fromCountry}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal leading-normal mt-0.5 whitespace-nowrap">
                          {formatTime(shipment.trip.flightTime)}, {formatDate(shipment.trip.flightDate)}
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
                          {shipment.trip.airportArrivalTime ? formatTime(shipment.trip.airportArrivalTime) : formatTime(shipment.trip.flightTime)}, {formatDate(shipment.trip.flightDate)}
                        </span>
                      </div>
                      <CountryFlag code={shipment.trip.toCountry} className="w-8 h-6 rounded shadow-sm shrink-0 object-cover" />
                    </div>
                  </div>
                </div>

                {/* Capacities Box */}
                <div className="bg-slate-50/70 border border-slate-100/50 rounded-xl p-4 space-y-2.5">
                  {isTraveller ? (
                    <>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-slate-500 font-medium">Total capacity</span>
                        <span className="font-semibold text-slate-700">{shipment.trip.totalCapacity ?? 0} KG</span>
                      </div>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-slate-500 font-medium">Remaining capacity</span>
                        <span className="font-extrabold text-[#0D307A] text-[15px]">
                          {String(shipment.trip.remainingCapacity ?? 0).padStart(2, '0')} KG
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
                  <h3 className="text-base font-bold text-slate-800">
                    Traveler Details
                  </h3>

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
                      <span className="font-semibold text-slate-700">{shipment.trip.user?.phone || 'N/A'}</span>
                    </div>

                    {/* Email Row */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-400 font-medium">Email</span>
                      <span className="font-semibold text-slate-700">{shipment.trip.user?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0D307A] mb-4">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Awaiting Traveler Match</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                  This shipment is currently awaiting a traveler. Once matched, the traveler's flight details, bag capacity, and contact info will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Step Logs Table Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 overflow-hidden">
          <h2 className="text-sm font-bold text-slate-800 px-4 pb-2 border-b border-slate-100 uppercase tracking-wider mb-4">
            Detailed Step Logs & Traveler Proofs
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
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
          <DialogContent className="max-w-lg rounded-2xl p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-emerald-600" />
                Uploaded Proof: {selectedPhoto?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <div className="relative w-full h-80 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 mt-2">
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
      </div>
    </RoleGuard>
  );
}
