'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PendingReviewCard } from './pending-review-card';
import { ReviewDisplayCard } from './review-display-card';
import {
  usePendingReviews,
  usePendingReviewsCount,
  useUserGivenReviews,
  useUserReceivedReviews,
} from '@/hooks/use-ratings-reviews';
import type { PendingReviewItem, ReviewItem } from '@/services/review.service';

interface RatingsReviewsFullViewProps {
  userId: string;
  activeTab: 'pending' | 'given' | 'received';
  onTabChange: (tab: 'pending' | 'given' | 'received') => void;
}

export function RatingsReviewsFullView({
  userId,
  activeTab,
  onTabChange,
}: RatingsReviewsFullViewProps) {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const { data: pendingCount = 0 } = usePendingReviewsCount();

  const numericRating = ratingFilter !== 'all' ? Number(ratingFilter) : undefined;

  const { data: pendingData, isLoading: isPendingLoading } = usePendingReviews({
    page,
    limit: 9,
    search: search.trim() || undefined,
  });

  const { data: givenData, isLoading: isGivenLoading } = useUserGivenReviews(userId, {
    page,
    limit: 9,
    search: search.trim() || undefined,
    rating: numericRating,
  });

  const { data: receivedData, isLoading: isReceivedLoading } = useUserReceivedReviews(userId, {
    page,
    limit: 9,
    search: search.trim() || undefined,
    rating: numericRating,
  });

  const activeData =
    activeTab === 'pending' ? pendingData : activeTab === 'given' ? givenData : receivedData;

  const isLoading =
    activeTab === 'pending'
      ? isPendingLoading
      : activeTab === 'given'
        ? isGivenLoading
        : isReceivedLoading;

  const items = activeData?.data || [];
  const meta = activeData?.meta || { page: 1, limit: 9, total: 0, totalPages: 1 };

  const handleTabClick = (tab: 'pending' | 'given' | 'received') => {
    onTabChange(tab);
    setPage(1);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
      {/* 1. Header Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => handleTabClick('pending')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Pending Reviews
            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2">
              {pendingCount}
            </Badge>
          </button>

          <button
            onClick={() => handleTabClick('given')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'given'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
            Ratings Given
          </button>

          <button
            onClick={() => handleTabClick('received')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-emerald-600" />
            Ratings Received
          </button>
        </div>
      </div>

      {/* 2. Toolbar: Search Input & Star Rating Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by shipment or user name..."
            className="pl-9 text-xs border-slate-200 focus-visible:ring-[#0D307A]"
          />
        </div>

        {activeTab !== 'pending' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Rating:
            </span>
            <Select
              value={ratingFilter}
              onValueChange={(val) => {
                setRatingFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] text-xs border-slate-200 focus:ring-[#0D307A]">
                <SelectValue placeholder="All Stars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars ★</SelectItem>
                <SelectItem value="4">4 Stars ★</SelectItem>
                <SelectItem value="3">3 Stars ★</SelectItem>
                <SelectItem value="2">2 Stars ★</SelectItem>
                <SelectItem value="1">1 Star ★</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 3. 3x3 Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="h-52 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center">
          <Star className="h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Reviews Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {search || ratingFilter !== 'all'
              ? 'No reviews match your current search or rating filter criteria.'
              : 'There are currently no reviews available in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'pending'
            ? (items as PendingReviewItem[]).map((item) => (
                <PendingReviewCard key={item.id} item={item} />
              ))
            : (items as ReviewItem[]).map((review) => (
                <ReviewDisplayCard
                  key={review.id}
                  review={review}
                  type={activeTab as 'given' | 'received'}
                />
              ))}
        </div>
      )}

      {/* 4. Bottom-Center Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  page === p
                    ? 'bg-[#0D307A] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
