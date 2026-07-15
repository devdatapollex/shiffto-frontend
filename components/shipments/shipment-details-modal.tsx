'use client';

import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { getShipmentSteps, type ShipmentStep } from '@/services/shipment.service';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import { getCountryByCode } from '@/lib/constants/countries';
import { Eye, Plane, Package, CheckCircle2, CircleDot, Circle, X } from 'lucide-react';

interface ShipmentDetailsModalProps {
  shipmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Map Prisma stages to 5 visual tracking steps
const TRACKING_STEP_MAP: { label: string; stages: string[] }[] = [
  { label: 'Order Confirmed', stages: ['PAYMENT_CONFIRMED'] },
  { label: 'Picked', stages: ['PICKED_UP'] },
  { label: 'In Transit', stages: ['CHECKED_IN', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION'] },
  { label: 'Out for delivery', stages: ['OUT_FOR_DELIVERY'] },
  { label: 'Delivered', stages: ['DELIVERED'] },
];

function getStepStatus(
  visualStep: { label: string; stages: string[] },
  shipmentSteps: ShipmentStep[]
): 'completed' | 'current' | 'pending' {
  const matchingSteps = shipmentSteps.filter((s) => visualStep.stages.includes(s.stage));

  if (matchingSteps.some((s) => s.completedAt !== null)) return 'completed';
  if (matchingSteps.some((s) => s.isCurrent)) return 'current';
  return 'pending';
}

function getStepTimestamp(
  visualStep: { label: string; stages: string[] },
  shipmentSteps: ShipmentStep[]
): string | null {
  const completedStep = shipmentSteps.find(
    (s) => visualStep.stages.includes(s.stage) && s.completedAt !== null
  );
  if (!completedStep?.completedAt) return null;

  const date = new Date(completedStep.completedAt);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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

function formatTime(timeStr: string | null): string {
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

export function ShipmentDetailsModal({
  shipmentId,
  open,
  onOpenChange,
}: ShipmentDetailsModalProps) {
  const { data: shipment, isLoading: shipmentLoading } = useShipmentDetails(shipmentId, open);

  const { data: shipmentSteps = [], isLoading: stepsLoading } = useQuery({
    queryKey: ['shipment-steps', shipmentId],
    queryFn: () => getShipmentSteps(shipmentId!),
    enabled: open && !!shipmentId,
  });

  const isLoading = shipmentLoading || stepsLoading;

  const shouldShowTrip =
    shipment?.trip !== null && shipment?.trip !== undefined && shipment?.status === 'ACTIVE';

  const shouldShowCapacity =
    shouldShowTrip &&
    shipment?.trip?.totalCapacity !== undefined &&
    shipment?.trip?.remainingCapacity !== undefined;

  const fromCountry = shipment ? getCountryByCode(shipment.fromCountry) : undefined;
  const toCountry = shipment ? getCountryByCode(shipment.toCountry) : undefined;

  const tripFromCountry = shipment?.trip ? getCountryByCode(shipment.trip.fromCountry) : undefined;
  const tripToCountry = shipment?.trip ? getCountryByCode(shipment.trip.toCountry) : undefined;

  const routeFrom = tripFromCountry || fromCountry;
  const routeTo = tripToCountry || toCountry;

  const shortShipmentId = shipment ? `#SH-${shipment.id.slice(-6).toUpperCase()}` : '';
  const shortTripId = shipment?.trip ? `#TR-${shipment.trip.id.slice(-4).toUpperCase()}` : '';

  const amount = shipment ? (shipment.pricePerKg * shipment.weight).toFixed(2) : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-[#e2e8f0] p-0 bg-white overflow-hidden max-h-[90vh] flex flex-col">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
            <div className="h-24 bg-slate-50 rounded-xl animate-pulse" />
            <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            <div className="h-32 bg-slate-50 rounded-xl animate-pulse" />
          </div>
        ) : shipment ? (
          <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Trip Header */}
            {shouldShowTrip && (
              <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-600">Trip: {shortTripId}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold border-[#e2e8f0] rounded-lg gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View ticket
                  </Button>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Close button when no trip header */}
            {!shouldShowTrip && (
              <div className="px-6 pt-5 pb-0 flex justify-end">
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="px-6 py-4 space-y-5">
              {/* Route Card */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col space-y-1 z-10">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Departure
                  </span>
                  <div className="flex items-center gap-1.5">
                    <CountryFlag code={routeFrom?.code} className="w-5 h-3.5" />
                    <span className="font-bold text-[#0B3A8E] text-sm">
                      {routeFrom?.name ?? shipment.fromCountry}
                    </span>
                  </div>
                  {shipment?.trip && (
                    <span className="text-[10px] text-slate-500">
                      {formatTime(shipment.trip.flightTime)}, {formatDate(shipment.trip.flightDate)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center flex-1 px-4 relative z-10">
                  <div className="w-full flex items-center justify-between relative">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <div className="flex-1 border-t border-dashed border-slate-300 mx-2 relative flex justify-center">
                      <Plane className="h-4 w-4 text-[#0B3A8E] rotate-90 absolute -top-2 bg-transparent" />
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0B3A8E]" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1 items-end text-right z-10">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Arrival
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#0B3A8E] text-sm">
                      {routeTo?.name ?? shipment.toCountry}
                    </span>
                    <CountryFlag code={routeTo?.code} className="w-5 h-3.5" />
                  </div>
                  {shipment?.trip?.airportArrivalTime && (
                    <span className="text-[10px] text-slate-500">
                      {formatTime(shipment.trip.airportArrivalTime)},{' '}
                      {formatDate(shipment.trip.flightDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Capacity Info */}
              {shouldShowCapacity && shipment?.trip && (
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-400 text-xs">Total capacity</span>
                    <p className="font-bold text-[#0B3A8E]">{shipment.trip.totalCapacity} KG</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-xs">Remaining capacity</span>
                    <p className="font-bold text-emerald-600">
                      {shipment.trip.remainingCapacity} KG
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking Steps */}
              {shipmentSteps.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {TRACKING_STEP_MAP.map((step, index) => {
                      const status = getStepStatus(step, shipmentSteps);
                      const timestamp = getStepTimestamp(step, shipmentSteps);

                      return (
                        <div key={step.label} className="flex flex-col items-center flex-1">
                          {/* Step indicator */}
                          <div className="relative">
                            {status === 'completed' ? (
                              <CheckCircle2 className="h-7 w-7 text-emerald-500 fill-emerald-50" />
                            ) : status === 'current' ? (
                              <CircleDot className="h-7 w-7 text-[#0B3A8E] fill-blue-50" />
                            ) : (
                              <Circle className="h-7 w-7 text-slate-200" />
                            )}
                            {status === 'current' && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#0B3A8E]">
                                {index + 1}
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                {index + 1}
                              </span>
                            )}
                          </div>

                          {/* Step label */}
                          <span
                            className={`text-[10px] font-semibold mt-1.5 text-center leading-tight ${
                              status === 'completed'
                                ? 'text-emerald-600'
                                : status === 'current'
                                  ? 'text-[#0B3A8E]'
                                  : 'text-slate-300'
                            }`}
                          >
                            {step.label}
                          </span>

                          {/* Timestamp */}
                          {timestamp && (
                            <span className="text-[9px] text-slate-400 mt-0.5 text-center">
                              {timestamp}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shipment Info */}
              <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Shipment
                    </span>
                    <p className="text-sm font-bold text-slate-800">{shortShipmentId}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-semibold border-orange-200 text-orange-600 hover:bg-orange-50 rounded-lg"
                  >
                    View tracking history
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      {shipment.itemPhotos?.[0] ? (
                        <img
                          src={shipment.itemPhotos[0]}
                          alt={shipment.itemName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{shipment.itemName}</p>
                      <p className="text-[11px] text-slate-400">
                        {shipment.weight} kg &bull; {shipment.quantity}pcs
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#0B3A8E]">${amount}</span>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Receiver Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="font-medium text-slate-700">{shipment.receiverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone</span>
                    <span className="font-medium text-slate-700">{shipment.receiverPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address</span>
                    <span className="font-medium text-slate-700 text-right max-w-[60%]">
                      {shipment.receiverAddress}
                    </span>
                  </div>
                  {shipment.instructions && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Instruction</span>
                      <span className="font-medium text-slate-700 text-right max-w-[60%]">
                        {shipment.instructions}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
