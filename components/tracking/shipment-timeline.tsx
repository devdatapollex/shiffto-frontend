'use client';

import { Check, Hourglass, Plane, Package, MapPin, Truck, DollarSign, ClipboardCheck } from 'lucide-react';
import type { ShipmentStep } from '@/services/shipment.service';
import { cn } from '@/lib/utils';

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
  const sortedSteps = [...steps].sort((a, b) => {
    return STAGES_ORDER.indexOf(a.stage) - STAGES_ORDER.indexOf(b.stage);
  });

  const getStepData = (stage: string) => {
    const step = sortedSteps.find((s) => s.stage === stage);
    if (!step) return { status: 'pending', completedAt: null, notes: null };

    if (step.completedAt) {
      return { status: 'completed', completedAt: step.completedAt, notes: step.notes };
    }
    if (step.isCurrent) {
      return { status: 'current', completedAt: null, notes: step.notes };
    }
    return { status: 'pending', completedAt: null, notes: null };
  };

  const formatStepTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="w-full overflow-x-auto py-6 px-4">
      <div className="min-w-[900px] flex items-start justify-between relative">
        {STAGES_ORDER.map((stage, idx) => {
          const config = STAGE_CONFIG[stage];
          const { status, completedAt, notes } = getStepData(stage);

          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isPending = status === 'pending';

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

                {/* Custom Notes */}
                {notes && (
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed whitespace-pre-line font-medium">
                    {notes}
                  </p>
                )}

                {/* Flight track mock link */}
                {stage === 'CHECKED_IN' && isCompleted && (
                  <span className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer mt-0.5 block">
                    Track flight
                  </span>
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
    </div>
  );
}
