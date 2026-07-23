'use client';

import { CountryFlag } from '@/components/shipments/create/country-flag';
import { getCountryByCode } from '@/lib/constants/countries';
import { Plane, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TripDetails {
  id: string;
  flightNumber: string;
  fromCountry: string;
  toCountry: string;
  flightDate: string;
  flightTime: string;
  airportArrivalTime?: string | null;
  status: string;
  totalCapacity?: number;
  remainingCapacity?: number;
  cabinBagCapacity?: number;
  checkInBagCapacity?: number;
  remainingCabinCapacity?: number;
  remainingCheckInCapacity?: number;
}

interface TripRouteCardProps {
  trip: TripDetails;
  showTicketButton?: boolean;
  onViewTicket?: () => void;
  className?: string;
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

export function TripRouteCard({ trip, showTicketButton = false, onViewTicket, className }: TripRouteCardProps) {
  const fromCountry = getCountryByCode(trip.fromCountry);
  const toCountry = getCountryByCode(trip.toCountry);

  const totalCap =
    trip.totalCapacity ?? ((trip.cabinBagCapacity ?? 0) + (trip.checkInBagCapacity ?? 0));
  const remainingCap =
    trip.remainingCapacity ??
    ((trip.remainingCabinCapacity ?? 0) + (trip.remainingCheckInCapacity ?? 0));

  const shortTripId = `#TR-${trip.id.slice(-4).toUpperCase()}`;

  return (
    <div className={cn('bg-white border border-slate-200/60 rounded-lg p-6 shadow-sm space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Trip Details
          </span>
          <span className="text-base font-bold text-slate-800">
            {shortTripId} &bull; Flight: {trip.flightNumber}
          </span>
        </div>
        {showTicketButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewTicket}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            View ticket
          </Button>
        )}
      </div>

      {/* Flight Route Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Departure */}
        <div className="flex flex-col space-y-1 max-w-[40%]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Departure
          </span>
          <div className="flex items-center gap-1.5">
            <CountryFlag code={trip.fromCountry} className="w-6 h-4" />
            <span className="font-bold text-[#0D307A] text-sm md:text-base truncate">
              {fromCountry?.name ?? trip.fromCountry}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {formatTime(trip.flightTime)}, {formatDate(trip.flightDate)}
          </span>
        </div>

        {/* Plane Icon Animation */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-full flex items-center justify-between relative px-2">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
            <div className="flex-1 border-t border-dashed border-slate-300 mx-2 relative flex justify-center items-center">
              <Plane className="h-4 w-4 text-[#0D307A] rotate-45 absolute -top-2 bg-white" />
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-[#0D307A] shrink-0" />
          </div>
        </div>

        {/* Arrival */}
        <div className="flex flex-col space-y-1 items-end text-right max-w-[40%]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Arrival
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#0D307A] text-sm md:text-base truncate">
              {toCountry?.name ?? trip.toCountry}
            </span>
            <CountryFlag code={trip.toCountry} className="w-6 h-4" />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {trip.airportArrivalTime ? formatTime(trip.airportArrivalTime) : formatTime(trip.flightTime)},{' '}
            {formatDate(trip.flightDate)}
          </span>
        </div>
      </div>

      {/* Capacities */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex items-center justify-between text-xs md:text-sm font-semibold">
          <div className="flex flex-col">
            <span className="text-slate-400 font-medium">Total capacity</span>
            <span className="text-slate-800 font-bold mt-0.5">{totalCap} KG</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-slate-400 font-medium">Remaining capacity</span>
            <span className="text-[#0D307A] font-extrabold mt-0.5">{remainingCap} KG</span>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${totalCap > 0 ? Math.min(100, Math.max(0, ((totalCap - remainingCap) / totalCap) * 100)) : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
