'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTripDetails } from '@/hooks/use-trips';
import { TripRouteCard } from '@/components/tracking/trip-route-card';
import { ContactDetailsCard } from '@/components/tracking/contact-details-card';
import { ChevronLeft, ChevronRight, Package, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { toRelativeImageUrl } from '@/lib/image-utils';
import { getCountryByCode } from '@/lib/constants/countries';

const STATUS_DISPLAY_MAP: Record<string, string> = {
  AWAITING_MATCH: 'Awaiting match',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  CANCELED: 'Canceled',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  AWAITING_MATCH: 'bg-amber-50 text-amber-700 border-amber-100',
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-100',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CANCELED: 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  const { data: trip, isLoading, error } = useTripDetails(tripId, !!tripId);

  if (isLoading) {
    return (
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
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Plane className="h-16 w-16 text-slate-300 mb-4 animate-bounce rotate-45" />
        <h2 className="text-xl font-bold text-slate-800">Trip Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          We couldn't retrieve details for this trip. It may have been deleted, or you might not have authorization to view it.
        </p>
        <Button asChild className="mt-6 bg-[#0D307A] hover:bg-[#092E72]">
          <Link href="/dashboard/tracking">Back to Tracking</Link>
        </Button>
      </div>
    );
  }

  const shortTripId = `TR-${trip.id.slice(-6).toUpperCase()}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 font-medium">
            <Link href="/dashboard/tracking" className="hover:text-slate-800 transition-colors">
              Tracking
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">Trip: #{shortTripId}</span>
          </div>
        </div>
      </div>

      {/* Top section: Route & Traveler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TripRouteCard trip={trip} showTicketButton={!!trip.status} />

        <ContactDetailsCard
          title="Traveler Details"
          name={trip.user?.name || 'Traveler'}
          phone={trip.user?.phone || 'N/A'}
          avatar={trip.user?.image || undefined}
        />
      </div>

      {/* Accepted Shipments Section */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider text-xs">
          Shipments Under This Trip
        </h3>

        {!trip.shipments || trip.shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No shipments matched to this trip yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Any shipments carrying under this trip will be listed here.
            </p>
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
                  const statusClass =
                    STATUS_BADGE_CLASS[item.status] || STATUS_BADGE_CLASS['AWAITING_MATCH'];
                  const displayStatus = STATUS_DISPLAY_MAP[item.status] || item.status;
                  const shortId = `SH-${item.id.slice(-6).toUpperCase()}`;
                  const route = `${getCountryByCode(item.fromCountry)?.name ?? item.fromCountry} - ${getCountryByCode(item.toCountry)?.name ?? item.toCountry}`;
                  const amount = item.pricePerKg * item.weight;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/dashboard/tracking/shipment/${item.id}`)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors duration-150"
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
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
                        >
                          {displayStatus}
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#0D307A] hover:bg-slate-100 rounded-lg"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
