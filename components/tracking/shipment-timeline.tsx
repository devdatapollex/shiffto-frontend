'use client';

import { useState } from 'react';
import {
  Check,
  Hourglass,
  Plane,
  Package,
  MapPin,
  Truck,
  DollarSign,
  ClipboardCheck,
  Image as ImageIcon,
} from 'lucide-react';
import type { ShipmentStep } from '@/services/shipment.service';
import { cn } from '@/lib/utils';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ShipmentTimelineProps {
  steps: ShipmentStep[];
}

const STAGE_CONFIG: Record<
  string,
  { label: string; activeIcon: React.ComponentType<any>; defaultIcon: React.ComponentType<any> }
> = {
  PAYMENT_CONFIRMED: {
    label: 'Payment confirmed',
    activeIcon: DollarSign,
    defaultIcon: Hourglass,
  },
  PICKED_UP: {
    label: 'Picked up',
    activeIcon: Package,
    defaultIcon: Hourglass,
  },
  CHECKED_IN: {
    label: 'Checked in',
    activeIcon: ClipboardCheck,
    defaultIcon: Hourglass,
  },
  IN_TRANSIT: {
    label: 'In transit',
    activeIcon: Plane,
    defaultIcon: Hourglass,
  },
  ARRIVED_AT_DESTINATION: {
    label: 'Arrived at destination',
    activeIcon: MapPin,
    defaultIcon: Hourglass,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for delivery',
    activeIcon: Truck,
    defaultIcon: Hourglass,
  },
  DELIVERED: {
    label: 'Delivered',
    activeIcon: Check,
    defaultIcon: Hourglass,
  },
};

const STAGES_ORDER = [
  'PAYMENT_CONFIRMED',
  'PICKED_UP',
  'CHECKED_IN',
  'IN_TRANSIT',
  'ARRIVED_AT_DESTINATION',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function ShipmentTimeline({ steps }: ShipmentTimelineProps) {
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; label: string } | null>(null);

  const sortedSteps = [...steps].sort((a, b) => {
    return STAGES_ORDER.indexOf(a.stage) - STAGES_ORDER.indexOf(b.stage);
  });

  const getStepData = (stage: string) => {
    const step = sortedSteps.find((s) => s.stage === stage);
    if (!step) return { status: 'pending', completedAt: null, notes: null, photoUrl: null };

    if (step.completedAt) {
      return {
        status: 'completed',
        completedAt: step.completedAt,
        notes: step.notes,
        photoUrl: step.photoUrl || null,
      };
    }
    if (step.isCurrent) {
      return {
        status: 'current',
        completedAt: null,
        notes: step.notes,
        photoUrl: step.photoUrl || null,
      };
    }
    return { status: 'pending', completedAt: null, notes: null, photoUrl: null };
  };

  const formatStepTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
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
    <div className="w-full overflow-x-auto py-6 px-4">
      <div className="min-w-[900px] flex items-start justify-between relative">
        {STAGES_ORDER.map((stage, idx) => {
          const config = STAGE_CONFIG[stage];
          const { status, completedAt, notes, photoUrl } = getStepData(stage);

          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          const IconComponent = isCompleted ? Check : isCurrent ? config.activeIcon : config.defaultIcon;

          return (
            <div key={stage} className="flex-1 flex flex-col items-center relative group">
              {/* Connecting Line */}
              {idx < STAGES_ORDER.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-[50%] right-[-50%] h-[2px] z-0 transition-colors duration-300',
                    getStepData(STAGES_ORDER[idx + 1]).status !== 'pending'
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  )}
                />
              )}

              {/* Circle Icon */}
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 shadow-sm',
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-500'
                    : isCurrent
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-600 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-400'
                )}
              >
                <IconComponent className={cn('h-5 w-5', isCurrent && stage === 'IN_TRANSIT' && 'rotate-45')} />
              </div>

              {/* Step Info */}
              <div className="mt-3 text-center px-2 max-w-[130px] z-10">
                <span
                  className={cn(
                    'text-xs font-bold block transition-colors duration-300',
                    isCompleted ? 'text-emerald-700' : isCurrent ? 'text-indigo-900' : 'text-slate-500'
                  )}
                >
                  {config.label}
                </span>

                {/* Photo proof badge if present */}
                {photoUrl && (
                  <button
                    onClick={() => setPreviewPhoto({ url: photoUrl, label: config.label })}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-md px-1.5 py-0.5 mt-1 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>View Proof</span>
                  </button>
                )}

                {/* Custom Notes */}
                {notes && (
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed whitespace-pre-line font-medium">
                    {notes}
                  </p>
                )}

                {/* Timestamp */}
                {completedAt ? (
                  <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                    {formatStepTime(completedAt)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={previewPhoto !== null} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-emerald-600" />
              Proof Photo ({previewPhoto?.label})
            </DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="relative w-full h-72 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 mt-2">
              <Image
                src={toRelativeImageUrl(previewPhoto.url)}
                alt="Step proof photo"
                className="object-contain w-full h-full"
                fill
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
