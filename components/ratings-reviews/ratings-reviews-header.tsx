'use client';

import { Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserReviewStats } from '@/hooks/use-ratings-reviews';

interface RatingsReviewsHeaderProps {
  userId: string;
  viewMode: 'overview' | 'all';
  onBackToOverview: () => void;
}

export function RatingsReviewsHeader({
  userId,
  viewMode,
  onBackToOverview,
}: RatingsReviewsHeaderProps) {
  const { data: stats } = useUserReviewStats(userId);
  const averageRating = stats?.averageRating ?? 0;
  const receivedCount = stats?.receivedCount ?? 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Left: Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          {viewMode === 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToOverview}
              className="h-8 px-2.5 text-xs text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ratings & Reviews</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Track your feedback, post reviews for completed shipments, and monitor ratings
        </p>
      </div>

      {/* Right: Beautifully Styled Average Rating Badge */}
      <div className="flex items-center gap-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-200/80 p-3.5 px-4.5 rounded-xl shrink-0">
        <div className="w-11 h-11 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
          <Star className="w-6 h-6 fill-white text-white" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs font-bold text-amber-600">out of 5.0</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            {receivedCount > 0
              ? `Based on ${receivedCount} verified ${receivedCount === 1 ? 'rating' : 'ratings'}`
              : 'Average Rating'}
          </p>
        </div>
      </div>
    </div>
  );
}
