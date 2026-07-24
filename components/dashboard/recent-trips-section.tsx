'use client';

import Link from 'next/link';
import { Plane, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import { getCountryByCode } from '@/lib/constants/countries';
import type { UserAnalyticsData } from '@/services/profile.service';

interface RecentTripsSectionProps {
  trips: UserAnalyticsData['recentTrips'];
  isLoading?: boolean;
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

function formatTime(timeStr?: string | null): string {
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

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
  AWAITING_MATCH: {
    label: 'Awaiting match',
    className: 'bg-amber-50 text-amber-600 border-amber-200/60',
  },
  ACTIVE: {
    label: 'In transit',
    className: 'bg-blue-50 text-blue-600 border-blue-200/60',
  },
  IN_TRANSIT: {
    label: 'In transit',
    className: 'bg-blue-50 text-blue-600 border-blue-200/60',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
  CANCELED: {
    label: 'Canceled',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

export function RecentTripsSection({ trips, isLoading }: RecentTripsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Recent trips
        </h2>
        <Button
          asChild
          variant="ghost"
          size="xs"
          className="text-xs text-primary hover:bg-primary/5"
        >
          <Link href="/dashboard/my-trips">
            View All <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 scrollbar-thin">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[320px] sm:w-[360px] shrink-0 h-64 rounded-lg bg-slate-50 border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : !trips || trips.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-100 p-8 text-center text-slate-400 text-xs">
          <Plane className="h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-600 rotate-45" />
          No recent trips available.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-3 -mb-2 scrollbar-thin [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="flex items-stretch gap-4 sm:gap-5 flex-nowrap">
            {trips.map((t) => {
              const shortId = `TR-${t.id.slice(-6).toUpperCase()}`;
              const statusConfig = STATUS_BADGE_MAP[t.status] || {
                label: t.status,
                className: 'bg-blue-50 text-blue-600 border-blue-200/60',
              };
              const fromCountryObj = getCountryByCode(t.fromCountry);
              const toCountryObj = getCountryByCode(t.toCountry);

              const depTime = t.flightTime ? formatTime(t.flightTime) : '';
              const depDate = t.flightDate ? formatDate(t.flightDate) : formatDate(t.createdAt);

              const arrTime = t.airportArrivalTime
                ? formatTime(t.airportArrivalTime)
                : t.flightTime
                  ? formatTime(t.flightTime)
                  : '';
              const arrDate = t.flightDate ? formatDate(t.flightDate) : formatDate(t.createdAt);

              const totalCap = String(t.totalCapacity ?? 0).padStart(2, '0');
              const remCap = String(t.remainingCapacity ?? 0).padStart(2, '0');
              const shipmentsCount = t.shipmentsCount ?? 0;

              return (
                <div
                  key={t.id}
                  className="w-[320px] sm:w-[360px] shrink-0 bg-white border border-slate-200/70 rounded-lg p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Header: Trip ID + Status Badge */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm font-bold text-slate-800">Trip : #{shortId}</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Route Section */}
                  <div className="space-y-2">
                    {/* Labels */}
                    <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                      <span>Departure</span>
                      <span>Arrival</span>
                    </div>

                    {/* Countries + Plane line */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Departure */}
                      <div className="flex items-center gap-2 max-w-[42%]">
                        <CountryFlag
                          code={t.fromCountry}
                          className="w-6 h-4 rounded-xs shadow-xs shrink-0 object-cover"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[#0D307A] text-xs leading-tight truncate">
                            {fromCountryObj?.name ?? t.fromCountry}
                          </span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                            {depTime ? `${depTime}, ` : ''}
                            {depDate}
                          </span>
                        </div>
                      </div>

                      {/* Dotted divider with airplane */}
                      <div className="flex-1 flex items-center justify-center relative">
                        <div className="w-full border-t border-dashed border-orange-300 relative flex justify-center items-center">
                          <Plane className="h-4 w-4 text-slate-800 fill-slate-800 rotate-45 absolute -top-2 bg-white px-0.5" />
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="flex items-center gap-2 max-w-[42%] text-right justify-end">
                        <div className="flex flex-col items-end min-w-0">
                          <span className="font-bold text-[#0D307A] text-xs leading-tight truncate">
                            {toCountryObj?.name ?? t.toCountry}
                          </span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                            {arrTime ? `${arrTime}, ` : ''}
                            {arrDate}
                          </span>
                        </div>
                        <CountryFlag
                          code={t.toCountry}
                          className="w-6 h-4 rounded-xs shadow-xs shrink-0 object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Details Box: Total & Remaining Capacity + Shipments Count */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Shipments</span>
                      <span className="font-semibold text-slate-700">
                        {shipmentsCount} {shipmentsCount === 1 ? 'Shipment' : 'Shipments'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Total capacity</span>
                      <span className="font-semibold text-slate-700">{totalCap} KG</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Remaining capacity</span>
                      <span className="font-extrabold text-[#0D307A] text-sm">{remCap} KG</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-9 rounded-lg border-primary! text-primary! bg-white! hover:bg-primary/10! font-semibold text-xs transition-colors"
                  >
                    <Link href={`/dashboard/tracking/trip/${t.id}`}>View details</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
