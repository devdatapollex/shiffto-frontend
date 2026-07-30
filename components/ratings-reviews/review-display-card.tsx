'use client';

import { Star, User, Package, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toRelativeImageUrl } from '@/lib/image-utils';
import type { ReviewItem } from '@/services/review.service';
import Image from 'next/image';

interface ReviewDisplayCardProps {
  review: ReviewItem;
  type: 'given' | 'received';
  className?: string;
}

export function ReviewDisplayCard({ review, type, className = '' }: ReviewDisplayCardProps) {
  const isGiven = type === 'given';
  const targetUser = isGiven ? review.reviewee : review.reviewer;
  const userRoleLabel = isGiven ? 'Reviewed' : 'Reviewer';

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Card
      className={`border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all flex flex-col gap-0 justify-between p-0 py-0 overflow-hidden ${className}`}
    >
      <CardHeader className="bg-slate-50/60 border-b border-slate-100 px-4 py-3 block [.border-b]:pb-3">
        <div className="flex items-center justify-between gap-2">
          {/* User info */}
          <div className="flex items-center gap-2.5 min-w-0">
            {targetUser?.image ? (
              <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <Image
                  src={toRelativeImageUrl(targetUser.image)}
                  alt={targetUser.name || 'User'}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {targetUser?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500">{userRoleLabel}</p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0 flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Verified
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        {/* Star rating & shipment item */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    review.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-1.5">{review.rating}.0</span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>

          {/* Shipment name */}
          {review.shipment && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{review.shipment.itemName}</span>
            </div>
          )}
        </div>

        {/* Comment */}
        {review.comment ? (
          <p className="text-xs text-slate-600 italic leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/80">
            &quot;{review.comment}&quot;
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">No comment provided.</p>
        )}
      </CardContent>
    </Card>
  );
}
