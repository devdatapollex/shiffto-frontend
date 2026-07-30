'use client';

import { useState } from 'react';
import { Star, Package, MapPin, User, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSubmitPendingReview } from '@/hooks/use-ratings-reviews';
import { toRelativeImageUrl } from '@/lib/image-utils';
import type { PendingReviewItem } from '@/services/review.service';
import Image from 'next/image';

interface PendingReviewCardProps {
  item: PendingReviewItem;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Poor',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Very Good',
  5: '5 - Excellent',
};

export function PendingReviewCard({ item, className = '' }: PendingReviewCardProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const submitMutation = useSubmitPendingReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    submitMutation.mutate({
      shipmentId: item.id,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Card
      className={`border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-all flex flex-col justify-between p-0 overflow-hidden ${className}`}
    >
      {/* Header */}
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 block [.border-b]:pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
              <Package className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <CardTitle
                className="text-sm font-bold text-slate-800 truncate"
                title={item.itemName}
              >
                {item.itemName}
              </CardTitle>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">
                  {item.fromCountry || 'Origin'} → {item.toCountry || 'Destination'}
                </span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0 font-medium"
          >
            Delivered
          </Badge>
        </div>
      </CardHeader>

      {/* Body / Form */}
      <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
        {/* Counterparty Info */}
        <div className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            {item.counterparty.image ? (
              <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <Image
                  src={toRelativeImageUrl(item.counterparty.image)}
                  alt={item.counterparty.name}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {item.counterparty.name}
              </p>
              <p className="text-[10px] text-slate-500">{item.counterparty.role}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] bg-amber-100/70 text-amber-800 border-amber-200/50 font-medium shrink-0"
          >
            Review Pending
          </Badge>
        </div>

        {/* Inline Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Star selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        active ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-semibold text-slate-600">
              {RATING_LABELS[hoverRating || rating]}
            </span>
          </div>

          {/* Comment */}
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share feedback for ${item.counterparty.name}... (optional)`}
            rows={2}
            className="text-xs border-slate-200 focus-visible:ring-[#0D307A] resize-none bg-slate-50/30"
          />

          {/* Submit button */}
          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full bg-[#0D307A] hover:bg-[#092E72] text-white text-xs font-semibold h-8 rounded-lg shadow-sm gap-1.5 cursor-pointer"
          >
            {submitMutation.isPending ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
