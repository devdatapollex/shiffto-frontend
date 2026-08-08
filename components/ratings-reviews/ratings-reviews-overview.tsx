'use client';

import { Star, Clock, MessageSquare, Award, ArrowRight, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PendingReviewCard } from './pending-review-card';
import { ReviewDisplayCard } from './review-display-card';
import {
  usePendingReviews,
  usePendingReviewsCount,
  useUserGivenReviews,
  useUserReceivedReviews,
} from '@/hooks/use-ratings-reviews';

interface RatingsReviewsOverviewProps {
  userId: string;
  onSeeAll: (tab: 'pending' | 'given' | 'received') => void;
}

export function RatingsReviewsOverview({ userId, onSeeAll }: RatingsReviewsOverviewProps) {
  const { data: pendingCount = 0 } = usePendingReviewsCount();

  const { data: pendingData, isLoading: isPendingLoading } = usePendingReviews({
    page: 1,
    limit: 6,
  });

  const { data: givenData, isLoading: isGivenLoading } = useUserGivenReviews(userId, {
    page: 1,
    limit: 6,
  });

  const { data: receivedData, isLoading: isReceivedLoading } = useUserReceivedReviews(userId, {
    page: 1,
    limit: 6,
  });

  const pendingItems = pendingData?.data || [];
  const givenItems = givenData?.data || [];
  const receivedItems = receivedData?.data || [];

  return (
    <div className="space-y-8">
      {/* 1. Pending Reviews Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Pending Reviews
            </h2>
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2 py-0.5 rounded-full">
              {pendingCount}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSeeAll('pending')}
            className="text-xs font-semibold text-[#0D307A] hover:text-[#092E72] hover:bg-slate-100/70 gap-1 cursor-pointer"
          >
            See all pending
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Carousel / Cards List */}
        {isPendingLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[320px] md:w-[360px] shrink-0 h-48 bg-slate-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No pending reviews</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All completed shipment reviews have been posted!
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-thin scrollbar-thumb-slate-200">
            {pendingItems.map((item) => (
              <PendingReviewCard
                key={item.id}
                item={item}
                className="w-[320px] md:w-[360px] shrink-0 snap-start"
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. Ratings Given Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Ratings Given
            </h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSeeAll('given')}
            className="text-xs font-semibold text-[#0D307A] hover:text-[#092E72] hover:bg-slate-100/70 gap-1 cursor-pointer"
          >
            See all given ratings
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isGivenLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[320px] md:w-[360px] shrink-0 h-44 bg-slate-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : givenItems.length === 0 ? (
          <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
            <PackageX className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No given ratings yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reviews you submit for counterparties will appear here.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-thin scrollbar-thumb-slate-200">
            {givenItems.map((review) => (
              <ReviewDisplayCard
                key={review.id}
                review={review}
                type="given"
                className="w-[320px] md:w-[360px] shrink-0 snap-start"
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Ratings Received Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Ratings Received
            </h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSeeAll('received')}
            className="text-xs font-semibold text-[#0D307A] hover:text-[#092E72] hover:bg-slate-100/70 gap-1 cursor-pointer"
          >
            See all received ratings
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isReceivedLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[320px] md:w-[360px] shrink-0 h-44 bg-slate-100 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : receivedItems.length === 0 ? (
          <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
            <Star className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No received ratings yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Feedback from counterparties will be displayed here.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-thin scrollbar-thumb-slate-200">
            {receivedItems.map((review) => (
              <ReviewDisplayCard
                key={review.id}
                review={review}
                type="received"
                className="w-[320px] md:w-[360px] shrink-0 snap-start"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
