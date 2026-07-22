'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTripDetails, useVerifyTrip } from '@/hooks/use-trips';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plane,
  AlertCircle,
  FileText,
  Check,
  X,
  Loader2,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { toRelativeImageUrl } from '@/lib/image-utils';
import { getCountryByCode } from '@/lib/constants/countries';
import { RoleGuard } from '@/components/auth/role-guard';
import { useState } from 'react';
import { toast } from 'sonner';

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

const STATUS_DISPLAY_MAP: Record<string, string> = {
  PENDING: 'Pending Verification',
  AWAITING_MATCH: 'Awaiting match',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  CANCELED: 'Canceled',
  REJECTED: 'Rejected',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
  AWAITING_MATCH: 'bg-amber-50 text-amber-700 border-amber-100',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  DELIVERED: 'bg-blue-50 text-blue-700 border-blue-100',
  CANCELED: 'bg-slate-50 text-slate-500 border-slate-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminTripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  const { data: trip, isLoading, error } = useTripDetails(tripId, !!tripId);
  const verifyTripMutation = useVerifyTrip();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      await verifyTripMutation.mutateAsync({
        id: tripId,
        payload: { approved: true },
      });
      toast.success('Trip approved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve trip');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await verifyTripMutation.mutateAsync({
        id: tripId,
        payload: { approved: false, rejectionReason },
      });
      toast.success('Trip rejected successfully');
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject trip');
    }
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

          {/* Content Columns Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
            <div className="h-64 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
          </div>

          {/* Shipments List Skeleton */}
          <div className="h-64 w-full bg-slate-50 border border-slate-200/50 rounded-2xl animate-pulse" />
        </div>
      </RoleGuard>
    );
  }

  if (error || !trip) {
    return (
      <RoleGuard
        roles={['admin']}
        fallback={
          <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
        }
      >
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Plane className="h-16 w-16 text-slate-300 mb-4 animate-bounce rotate-45" />
          <h2 className="text-xl font-bold text-slate-800">Trip Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            We couldn't retrieve details for this trip. It may have been deleted, or you might not have authorization to view it.
          </p>
          <Button asChild className="mt-6 bg-[#0D307A] hover:bg-[#092E72]">
            <Link href="/dashboard/admin/trips">Back to Trips</Link>
          </Button>
        </div>
      </RoleGuard>
    );
  }

  const shortTripId = `TR-${trip.id.slice(-6).toUpperCase()}`;
  const statusClass = STATUS_BADGE_CLASS[trip.status] || STATUS_BADGE_CLASS['PENDING'];
  const displayStatus = STATUS_DISPLAY_MAP[trip.status] || trip.status;

  const totalCap = (trip.cabinBagCapacity ?? 0) + (trip.checkInBagCapacity ?? 0);
  const remainingCap = (trip.remainingCabinCapacity ?? 0) + (trip.remainingCheckInCapacity ?? 0);

  return (
    <RoleGuard
      roles={['admin']}
      fallback={
        <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
      }
    >
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
              <Link href="/dashboard/admin/trips" className="hover:text-slate-800 transition-colors">
                Admin Trips
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">Trip: #{shortTripId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}
            >
              {displayStatus}
            </span>
          </div>
        </div>

        {/* Verification action panel for Admin */}
        {trip.status === 'PENDING' && (
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">
                Verification Actions
              </h3>
              <p className="text-xs text-amber-700">
                Review the traveler's ticket scans and details to verify the legitimacy of this trip.
              </p>
            </div>
            <div className="flex items-center gap-3 sm:shrink-0 w-full sm:w-auto">
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={verifyTripMutation.isPending}
                className="flex-1 sm:flex-none sm:px-6 rounded-xl h-11 font-semibold"
              >
                <X className="mr-1.5 h-4 w-4" /> Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={verifyTripMutation.isPending}
                className="flex-1 sm:flex-none sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-semibold"
              >
                {verifyTripMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                Approve
              </Button>
            </div>
          </div>
        )}

        {/* Top Section Grid: Route info & Traveler details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col gap-6">
            {/* Combined Card: Trip details & Traveler details */}
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-base font-bold text-slate-800">
                  Trip : #{shortTripId}
                </span>
                {trip.ticketPhoto && trip.ticketPhoto !== 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewPhotoUrl(trip.ticketPhoto)}
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
                    <CountryFlag code={trip.fromCountry} className="w-8 h-6 rounded shadow-sm shrink-0 object-cover" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[#0D307A] text-[15px] md:text-[17px] leading-tight truncate">
                        {getCountryByCode(trip.fromCountry)?.name ?? trip.fromCountry}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal leading-normal mt-0.5 whitespace-nowrap">
                        {formatTime(trip.flightTime)}, {formatDate(trip.flightDate)}
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
                        {getCountryByCode(trip.toCountry)?.name ?? trip.toCountry}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal leading-normal mt-0.5 whitespace-nowrap">
                        {trip.airportArrivalTime ? formatTime(trip.airportArrivalTime) : formatTime(trip.flightTime)}, {formatDate(trip.flightDate)}
                      </span>
                    </div>
                    <CountryFlag code={trip.toCountry} className="w-8 h-6 rounded shadow-sm shrink-0 object-cover" />
                  </div>
                </div>
              </div>

              {/* Capacities Box */}
              <div className="bg-slate-50/70 border border-slate-100/50 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-500 font-medium">Total capacity</span>
                  <span className="font-semibold text-slate-700">{totalCap} KG</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-500 font-medium">Remaining capacity</span>
                  <span className="font-extrabold text-[#0D307A] text-[15px]">
                    {String(remainingCap).padStart(2, '0')} KG
                  </span>
                </div>
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
                      {trip.user?.image ? (
                        <div className="w-5 h-5 rounded-full border border-slate-200 overflow-hidden shrink-0">
                          <Image
                            src={toRelativeImageUrl(trip.user.image)}
                            alt={trip.user.name || 'Traveler'}
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                          {(trip.user?.name || 'Traveler').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-[#0D307A] underline hover:text-[#092E72] cursor-pointer">
                        {trip.user?.name || 'Traveler'}
                      </span>
                    </div>
                  </div>

                  {/* Phone Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-medium">Phone</span>
                    <span className="font-semibold text-slate-700">{trip.user?.phone || 'N/A'}</span>
                  </div>

                  {/* Email Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400 font-medium">Email</span>
                    <span className="font-semibold text-slate-700">{trip.user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Banner */}
            {trip.status === 'REJECTED' && trip.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm flex gap-3 items-start shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800 text-sm">Trip Rejected</h4>
                  <p className="text-red-700 text-xs mt-1 font-medium">
                    {trip.rejectionReason}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Ticket scan preview card inline */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col flex-1 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Ticket Document Scan
                </h3>
                {trip.ticketPhoto && trip.ticketPhoto !== 'pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-[#0B3A8E] hover:text-[#092E72] p-0 font-semibold cursor-pointer"
                    onClick={() => setPreviewPhotoUrl(trip.ticketPhoto)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Full
                  </Button>
                )}
              </div>

              {trip.ticketPhoto && trip.ticketPhoto !== 'pending' ? (
                <div
                  className="relative group overflow-hidden border border-slate-200 rounded-xl bg-slate-900 flex items-center justify-center flex-1 min-h-[240px] w-full cursor-zoom-in"
                  onClick={() => setPreviewPhotoUrl(trip.ticketPhoto)}
                >
                  <Image
                    src={toRelativeImageUrl(trip.ticketPhoto)}
                    alt="Flight Ticket document"
                    className="object-contain w-full h-full transition-all group-hover:scale-102"
                    fill
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-sm gap-2">
                    <Eye className="h-5 w-5" />
                    Click to Zoom
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-slate-50 text-slate-400 text-sm min-h-[240px]">
                  <FileText className="h-8 w-8 mb-2" />
                  No flight ticket file uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accepted Shipments Section */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider text-xs">
            Shipments matched under this trip
          </h3>

          {!trip.shipments || trip.shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-500">No shipments matched to this trip yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4 font-semibold">Shipment name & ID</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Route</th>
                    <th className="px-5 py-4 font-semibold">Earning</th>
                    <th className="px-5 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs md:text-sm">
                  {trip.shipments.map((item) => {
                    const shortId = `SH-${item.id.slice(-6).toUpperCase()}`;
                    const route = `${getCountryByCode(item.fromCountry)?.name ?? item.fromCountry} - ${getCountryByCode(item.toCountry)?.name ?? item.toCountry}`;
                    const amount = item.pricePerKg * item.weight;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 cursor-pointer transition-colors duration-150"
                        onClick={() => router.push(`/dashboard/admin/shipments/${item.id}`)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {item.itemPhotos?.[0] ? (
                                <Image
                                  src={toRelativeImageUrl(item.itemPhotos[0])}
                                  alt={item.itemName}
                                  className="object-cover w-full h-full"
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <Package className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#0D307A] block truncate">
                                {item.itemName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold tracking-wider block mt-0.5">
                                #{shortId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-slate-50 text-slate-500 border-slate-200"
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-slate-500 font-light">{route}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-700">
                            ${amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#0D307A] hover:bg-slate-100 rounded-lg"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reject Reason dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Reject Flight Trip</DialogTitle>
              <DialogDescription>
                Provide an explanation of why this flight trip is rejected. The user will see this notification.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="reject-reason">Reason for Rejection</Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g. Flight ticket date has expired / Flight details cannot be verified"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={verifyTripMutation.isPending}
              >
                {verifyTripMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Big ticket preview modal */}
        <Dialog open={!!previewPhotoUrl} onOpenChange={(open) => !open && setPreviewPhotoUrl(null)}>
          <DialogContent className="max-w-4xl p-1 bg-black/95 border-0">
            <div className="relative flex items-center justify-center max-h-[85vh] w-full min-h-[400px]">
              {previewPhotoUrl && (
                <Image
                  src={toRelativeImageUrl(previewPhotoUrl)}
                  alt="Flight Ticket Preview"
                  className="max-h-[85vh] max-w-full object-contain rounded-lg"
                  width={800}
                  height={600}
                />
              )}
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white rounded-full h-8 w-8 flex items-center justify-center border border-white/20 font-bold"
              >
                ✕
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
