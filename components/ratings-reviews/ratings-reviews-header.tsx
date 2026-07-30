'use client';

import { Star, Award, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-6">
      {/* Title & Description Header */}
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ratings & Reviews</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track your feedback, post reviews for completed shipments, and monitor ratings
          </p>
        </div>
      </div>

      {/* Top Summary Stat Cards (matching Payments & Earnings page layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Rating */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Average Rating
              </p>
              <p className="text-3xl font-extrabold text-slate-900">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-xs text-slate-400">Based on verified reviews</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Reviews
              </p>
              <p className="text-3xl font-extrabold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-slate-400">Completed shipments awaiting review</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Ratings Received */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ratings Received
              </p>
              <p className="text-3xl font-extrabold text-emerald-600">{receivedCount}</p>
              <p className="text-xs text-slate-400">Feedback received from counterparties</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Ratings Given */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ratings Given
              </p>
              <p className="text-3xl font-extrabold text-blue-600">{givenCount}</p>
              <p className="text-xs text-slate-400">Reviews submitted for others</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
