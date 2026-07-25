'use client';

import { useState } from 'react';
import { useShipmentDetails } from '@/hooks/use-shipment-details';
import { ShipmentTimeline } from '@/components/tracking/shipment-timeline';
import { StepAdvancementCard } from '@/components/tracking/step-advancement-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Package,
  Clock,
  CheckCircle2,
  Hourglass,
  Image as ImageIcon,
  Loader2,
  FileText,
  User,
  Plane,
} from 'lucide-react';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { getCountryByCode } from '@/lib/constants/countries';

interface ShipmentStepsModalProps {
  shipmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ShipmentStepsModal({ shipmentId, open, onOpenChange }: ShipmentStepsModalProps) {
  const { data: shipment, isLoading } = useShipmentDetails(shipmentId, open);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [showAdvancement, setShowAdvancement] = useState(false);

  const shortId = shipmentId ? `SH-${shipmentId.slice(-6).toUpperCase()}` : '';

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6 bg-white space-y-6">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0D307A]/10 border border-[#0D307A]/20 flex items-center justify-center text-[#0D307A]">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-[#0D307A]">
                    Shipment Steps & Proofs
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    ID: #{shortId} {shipment ? `• ${shipment.itemName}` : ''}
                  </DialogDescription>
                </div>
              </div>

              {shipment && shipment.status === 'ACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancement((prev) => !prev)}
                  className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs rounded-lg h-9"
                >
                  {showAdvancement ? 'Hide Admin Override' : 'Admin Step Override'}
                </Button>
              )}
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#0D307A]" />
              <p className="text-sm font-medium text-slate-500">Loading step logs...</p>
            </div>
          ) : !shipment ? (
            <div className="py-12 text-center text-slate-400">Shipment details unavailable.</div>
          ) : (
            <div className="space-y-6">
              {/* Header Overview Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">Route</span>
                  <span className="font-bold text-slate-700 mt-0.5 block">
                    {getCountryByCode(shipment.fromCountry)?.name ?? shipment.fromCountry} →{' '}
                    {getCountryByCode(shipment.toCountry)?.name ?? shipment.toCountry}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">
                    Sender & Receiver
                  </span>
                  <span className="font-bold text-slate-700 mt-0.5 block truncate">
                    Receiver: {shipment.receiverName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase block">
                    Assigned Traveller
                  </span>
                  <span className="font-bold text-slate-700 mt-0.5 block flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {shipment.trip?.user?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="border border-slate-100 rounded-lg p-4 bg-white shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Timeline Progress
                </h4>
                {shipment.shipmentSteps && shipment.shipmentSteps.length > 0 ? (
                  <ShipmentTimeline steps={shipment.shipmentSteps} />
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No steps found.</p>
                )}
              </div>

              {/* Admin Step Advancement Override if toggled */}
              {showAdvancement && shipment.shipmentSteps && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                    Admin Override Panel
                  </span>
                  <StepAdvancementCard shipment={shipment} steps={shipment.shipmentSteps} />
                </div>
              )}

              {/* Detailed Step Logs Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detailed Step Informations & Traveller Uploads
                </h4>

                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <Table>
                    <TableHeader className="bg-slate-50/60">
                      <TableRow>
                        <TableHead className="w-12 font-semibold text-xs">#</TableHead>
                        <TableHead className="font-semibold text-xs">Stage Name</TableHead>
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-xs">Completed At</TableHead>
                        <TableHead className="font-semibold text-xs">Traveller Notes</TableHead>
                        <TableHead className="font-semibold text-xs text-right">
                          Uploaded Proof
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs text-slate-700">
                      {shipment.shipmentSteps
                        ?.sort((a, b) => a.order - b.order)
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
                                    className="h-7 text-[11px] font-semibold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
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
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-size Photo Preview Modal */}
      <Dialog open={selectedPhoto !== null} onOpenChange={(o) => !o && setSelectedPhoto(null)}>
        <DialogContent className="max-w-lg rounded-lg p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-emerald-600" />
              Uploaded Proof: {selectedPhoto?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="relative w-full h-80 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 mt-2">
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
    </>
  );
}
