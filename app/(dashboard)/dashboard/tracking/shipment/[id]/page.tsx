'use client';

import { useParams, useRouter } from 'next/navigation';
import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { useRole } from '@/hooks/use-role';
import { ShipmentTimeline } from '@/components/tracking/shipment-timeline';
import { StepAdvancementCard } from '@/components/tracking/step-advancement-card';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { ChevronLeft, Package, User, Plane, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const shipmentId = params?.id as string;

  const { user, isAdmin } = useRole();
  const { data: shipment, isLoading, error } = useShipmentDetails(shipmentId, !!shipmentId);

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
          We couldn't retrieve details for this shipment. It may have been deleted, or you might not
          have authorization to view it.
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
  const canAdvanceStep = (isTraveller || isAdmin) && shipment.status === 'ACTIVE';

  return (
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
            <Link href="/dashboard/tracking" className="hover:text-slate-800 transition-colors">
              Tracking
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Shipment: #{shortShipmentId}</span>
          </div>
        </div>
      </div>

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
                      <span className="text-slate-500 font-medium">Total capacity</span>
                      <span className="font-semibold text-slate-700">
                        {shipment.trip.totalCapacity ?? 0} KG
                      </span>
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
                This shipment is currently awaiting a traveler. Once matched, the traveler's flight
                details, bag capacity, and contact info will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
