'use client';

import { useParams, useRouter } from 'next/navigation';
import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { useRole } from '@/hooks/use-role';
import { ShipmentTimeline } from '@/components/tracking/shipment-timeline';
import { StepAdvancementCard } from '@/components/tracking/step-advancement-card';
import { TripRouteCard } from '@/components/tracking/trip-route-card';
import { ShipmentItemCard } from '@/components/tracking/shipment-item-card';
import { ContactDetailsCard } from '@/components/tracking/contact-details-card';
import { ChevronLeft, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Package className="h-16 w-16 text-slate-300 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800">Shipment Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          We couldn't retrieve details for this shipment. It may have been deleted, or you might not have authorization to view it.
        </p>
        <Button asChild className="mt-6 bg-[#0D307A] hover:bg-[#092E72]">
          <Link href="/dashboard/tracking">Back to Tracking</Link>
        </Button>
      </div>
    );
  }

  const shortShipmentId = `SH-${shipment.id.slice(-6).toUpperCase()}`;

  // Check if current user is the traveller for this trip or admin
  const isTraveller = Boolean(
    user && shipment.trip?.user?.id === user.id
  );
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

      {/* Step Advancement Action Card for Traveller / Admin */}
      {canAdvanceStep && shipment.shipmentSteps && shipment.shipmentSteps.length > 0 && (
        <StepAdvancementCard shipment={shipment} steps={shipment.shipmentSteps} />
      )}

      {/* Bottom Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Shipment Item & Receiver */}
        <div className="space-y-6">
          <ShipmentItemCard shipment={shipment} />

          <ContactDetailsCard
            title="Receiver Details"
            name={shipment.receiverName}
            phone={shipment.receiverPhone}
            address={shipment.receiverAddress}
            instruction={shipment.instructions || undefined}
          />
        </div>

        {/* Right Column: Trip details / Traveler Details */}
        <div className="space-y-6">
          {shipment.trip ? (
            <>
              <TripRouteCard trip={shipment.trip} showTicketButton={!!shipment.trip.status} />

              <ContactDetailsCard
                title="Traveler Details"
                name={shipment.trip.user?.name || 'Assigned Traveler'}
                phone={shipment.trip.user?.phone || 'N/A'}
                avatar={shipment.trip.user?.image || undefined}
              />
            </>
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
    </div>
  );
}
