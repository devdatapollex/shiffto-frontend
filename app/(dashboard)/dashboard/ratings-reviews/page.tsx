'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import { RatingsReviewsHeader } from '@/components/ratings-reviews/ratings-reviews-header';
import { RatingsReviewsOverview } from '@/components/ratings-reviews/ratings-reviews-overview';
import { RatingsReviewsFullView } from '@/components/ratings-reviews/ratings-reviews-full-view';

function RatingsReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const userId = session?.user?.id;

  const viewParam = searchParams.get('view');
  const tabParam = searchParams.get('tab');

  const viewMode: 'overview' | 'all' = viewParam === 'all' ? 'all' : 'overview';
  const activeTab: 'pending' | 'given' | 'received' =
    tabParam === 'pending' || tabParam === 'given' || tabParam === 'received'
      ? tabParam
      : 'pending';

  const handleSeeAll = (tab: 'pending' | 'given' | 'received') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', 'all');
    params.set('tab', tab);
    router.push(`/dashboard/ratings-reviews?${params.toString()}`);
  };

  const handleBackToOverview = () => {
    router.push('/dashboard/ratings-reviews');
  };

  const handleTabChange = (tab: 'pending' | 'given' | 'received') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', 'all');
    params.set('tab', tab);
    router.push(`/dashboard/ratings-reviews?${params.toString()}`);
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D307A]" />
        <p className="text-xs text-slate-500 font-medium">Loading Ratings & Reviews...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
        <p className="text-sm font-semibold text-slate-700">
          Please log in to access Ratings & Reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <RatingsReviewsHeader
        userId={userId}
        viewMode={viewMode}
        onBackToOverview={handleBackToOverview}
      />

      {/* Body View */}
      {viewMode === 'overview' ? (
        <RatingsReviewsOverview userId={userId} onSeeAll={handleSeeAll} />
      ) : (
        <RatingsReviewsFullView
          userId={userId}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}

export default function RatingsReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D307A]" />
          <p className="text-xs text-slate-500 font-medium">Loading Ratings & Reviews...</p>
        </div>
      }
    >
      <RatingsReviewsContent />
    </Suspense>
  );
}
