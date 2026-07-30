'use client';

import { Star, Award, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePendingReviewsCount, useUserReviewStats } from '@/hooks/use-ratings-reviews';

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
  const { data: pendingCount = 0 } = usePendingReviewsCount();

  const averageRating = stats?.averageRating ?? 0;
  const receivedCount = stats?.receivedCount ?? 0;
  const givenCount = stats?.givenCount ?? 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Ratings & Reviews
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage pending feedback requests, inspect reviews given, and monitor your received
            ratings.
          </p>
        </div>

        {/* Summary Metric Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Average Rating Pill */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg text-amber-900">
            <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
            <span className="text-xs font-bold">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-[10px] text-amber-700 font-medium hidden xs:inline">
              Avg Rating
            </span>
          </div>

          {/* Pending Reviews Badge Pill */}
          <div className="flex items-center gap-1.5 bg-amber-100/60 border border-amber-300 px-3 py-1.5 rounded-lg text-amber-900">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold">{pendingCount}</span>
            <span className="text-[10px] text-amber-800 font-medium hidden xs:inline">Pending</span>
          </div>

          {/* Received Pill */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
            <Award className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold">{receivedCount}</span>
            <span className="text-[10px] text-slate-500 font-medium hidden xs:inline">
              Received
            </span>
          </div>

          {/* Given Pill */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
            <MessageSquare className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold">{givenCount}</span>
            <span className="text-[10px] text-slate-500 font-medium hidden xs:inline">Given</span>
          </div>
        </div>
      </div>
    </div>
  );
}
