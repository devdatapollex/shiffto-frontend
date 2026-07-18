'use client';

import { useParams, useRouter } from 'next/navigation';
import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { ShipmentTimeline } from '@/components/tracking/shipment-timeline';
import { StepAdvancementCard } from '@/components/tracking/step-advancement-card';
import { TripRouteCard } from '@/components/tracking/trip-route-card';
import { ShipmentItemCard } from '@/components/tracking/shipment-item-card';
import { ContactDetailsCard } from '@/components/tracking/contact-details-card';
import {
  ChevronLeft,
  Package,
  User,
  Image as ImageIcon,
  Clock,
  Hourglass,
  CheckCircle2,
  FileText,
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
import Image from 'next/image';
import { useState } from 'react';

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
