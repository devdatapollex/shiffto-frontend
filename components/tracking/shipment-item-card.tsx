'use client';

import { Package } from 'lucide-react';
import Image from 'next/image';
import { toRelativeImageUrl } from '@/lib/image-utils';
import type { Shipment } from '@/services/shipment.service';
import { cn } from '@/lib/utils';

interface ShipmentItemCardProps {
  shipment: Omit<Shipment, 'tripId'>;
  className?: string;
}

export function ShipmentItemCard({ shipment, className }: ShipmentItemCardProps) {
  const amount = (shipment.pricePerKg * shipment.weight).toFixed(2);
  const shortId = `SH-${shipment.id.slice(-6).toUpperCase()}`;

  return (
    <div className={cn('bg-white border border-slate-200/60 rounded-lg p-4 shadow-sm space-y-4', className)}>
      <div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
          Shipment
        </span>
        <span className="text-xs font-semibold text-slate-500">#{shortId}</span>
      </div>

      <div className="flex items-center justify-between gap-4 bg-slate-50/50 border border-slate-100 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {shipment.itemPhotos?.[0] ? (
              <Image
                src={toRelativeImageUrl(shipment.itemPhotos[0])}
                alt={shipment.itemName}
                className="object-cover w-full h-full"
                width={48}
                height={48}
              />
            ) : (
              <Package className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 leading-tight">
              {shipment.itemName}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {shipment.weight} kg &bull; {shipment.quantity}pcs
            </p>
          </div>
        </div>

        <span className="font-extrabold text-base text-[#0D307A]">
          ${amount}
        </span>
      </div>
    </div>
  );
}
