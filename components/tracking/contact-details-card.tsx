'use client';

import { cn } from '@/lib/utils';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

interface ContactDetailsCardProps {
  title: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  address?: string;
  instruction?: string;
  className?: string;
}

export function ContactDetailsCard({
  title,
  name,
  phone,
  avatar,
  address,
  instruction,
  className,
}: ContactDetailsCardProps) {
  return (
    <div className={cn('bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4', className)}>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
        {title}
      </h3>

      <div className="space-y-3.5 text-xs md:text-sm">
        {/* Name Row */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400 font-medium shrink-0">Name</span>
          <div className="flex items-center gap-2">
            {avatar ? (
              <div className="w-6 h-6 rounded-full border border-slate-200 overflow-hidden shrink-0">
                <Image
                  src={toRelativeImageUrl(avatar)}
                  alt={name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                {name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-slate-800">{name}</span>
          </div>
        </div>

        {/* Phone Row */}
        {phone && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-medium shrink-0">Phone</span>
            <span className="font-semibold text-slate-700">{phone}</span>
          </div>
        )}

        {/* Address Row */}
        {address && (
          <div className="flex items-start justify-between gap-4">
            <span className="text-slate-400 font-medium shrink-0">Address</span>
            <span className="font-semibold text-slate-700 text-right max-w-[70%] break-words">
              {address}
            </span>
          </div>
        )}

        {/* Instruction Row */}
        {instruction && (
          <div className="flex items-start justify-between gap-4 border-t border-slate-50 pt-3">
            <span className="text-slate-400 font-medium shrink-0">Instruction</span>
            <span className="font-semibold text-slate-600 text-right max-w-[70%] break-words">
              {instruction}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
