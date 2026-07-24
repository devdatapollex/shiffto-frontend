'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Plane, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import type { UserAnalyticsData } from '@/services/profile.service';

interface RecentShipmentsSectionProps {
  shipments: UserAnalyticsData['recentShipments'];
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
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
  },
  CANCELED: {
    label: 'Canceled',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

export function RecentShipmentsSection({ shipments, isLoading }: RecentShipmentsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Recent shipments
        </h2>
        <Button
          asChild
          variant="ghost"
          size="xs"
          className="text-xs text-primary hover:bg-primary/5"
        >
          <Link href="/dashboard/my-shipments">
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
      ) : !shipments || shipments.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-100 p-8 text-center text-slate-400 text-xs">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
          No recent shipments available.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-3 -mb-2 scrollbar-thin [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="flex items-stretch gap-4 sm:gap-5 flex-nowrap">
            {shipments.map((s) => {
              const shortId = `SH-${s.id.slice(-6).toUpperCase()}`;
              const statusConfig = STATUS_BADGE_MAP[s.status] || {
                label: s.status,
                className: 'bg-blue-50 text-blue-600 border-blue-200/60',
              };
              const fromCountryObj = getCountryByCode(s.fromCountry);
              const toCountryObj = getCountryByCode(s.toCountry);

              const depTime = s.trip?.flightTime ? formatTime(s.trip.flightTime) : '';
              const depDate = s.trip?.flightDate
                ? formatDate(s.trip.flightDate)
                : formatDate(s.createdAt);

              const arrTime = s.trip?.airportArrivalTime
                ? formatTime(s.trip.airportArrivalTime)
                : s.trip?.flightTime
                  ? formatTime(s.trip.flightTime)
                  : '';
              const arrDate = s.trip?.flightDate
                ? formatDate(s.trip.flightDate)
                : formatDate(s.createdAt);

              return (
                <div
                  key={s.id}
                  className="w-[320px] sm:w-[360px] shrink-0 bg-white border border-slate-200/70 rounded-lg p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Header: Shipment ID + Status Badge */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm font-bold text-slate-800">Shipment : #{shortId}</span>
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
                          code={s.fromCountry}
                          className="w-6 h-4 rounded-xs shadow-xs shrink-0 object-cover"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[#0D307A] text-xs leading-tight truncate">
                            {fromCountryObj?.name ?? s.fromCountry}
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
                            {toCountryObj?.name ?? s.toCountry}
                          </span>
                          <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                            {arrTime ? `${arrTime}, ` : ''}
                            {arrDate}
                          </span>
                        </div>
                        <CountryFlag
                          code={s.toCountry}
                          className="w-6 h-4 rounded-xs shadow-xs shrink-0 object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Item Details Box */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0">
                        {s.itemPhotos?.[0] ? (
                          <Image
                            src={toRelativeImageUrl(s.itemPhotos[0])}
                            alt={s.itemName}
                            className="object-cover w-full h-full"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <Package className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate">{s.itemName}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {s.weight} Kg &bull; {s.quantity ?? 1}pcs
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#0D307A] shrink-0">
                      ${(s.totalCost ?? s.weight * s.pricePerKg).toFixed(0)}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-9 rounded-lg border-primary! text-primary! bg-white! hover:bg-primary/10! font-semibold text-xs transition-colors"
                  >
                    <Link href={`/dashboard/tracking/shipment/${s.id}`}>View details</Link>
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
