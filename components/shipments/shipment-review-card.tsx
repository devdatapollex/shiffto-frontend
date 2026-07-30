'use client';

import { useState } from 'react';
import { Star, Clock, User, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useShipmentReviews, useCreateReview } from '@/hooks/use-shipment-reviews';
import { toRelativeImageUrl } from '@/lib/image-utils';
import type { ShipmentDetails } from '@/services/shipment.service';
import Image from 'next/image';

interface ShipmentReviewCardProps {
  shipment: ShipmentDetails;
  currentUser?: { id: string; name?: string; role?: string | null } | null;
  isAdmin?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Poor',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Very Good',
  5: '5 - Excellent',
};

export function ShipmentReviewCard({ shipment, currentUser, isAdmin }: ShipmentReviewCardProps) {
  const { data: reviews = [], isLoading } = useShipmentReviews(
    shipment.id,
    shipment.status === 'DELIVERED'
  );
  const createReviewMutation = useCreateReview(shipment.id);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  if (shipment.status !== 'DELIVERED') {
    return null;
  }

  const isSender = Boolean(currentUser?.id && shipment.userId === currentUser.id);
  const isTraveler = Boolean(currentUser?.id && shipment.trip?.user?.id === currentUser.id);
  const isParticipant = isSender || isTraveler;

  if (!isParticipant && !isAdmin) {
    return null;
  }

  const senderId = shipment.userId || shipment.user?.id;
  const travelerId = shipment.trip?.user?.id;

  const senderName = shipment.user?.name || 'Sender';
  const travelerName = shipment.trip?.user?.name || 'Traveler';

  const senderReview = reviews.find(
    (r) => (senderId && r.reviewerId === senderId) || r.revieweeId === travelerId
  );
  const travelerReview = reviews.find(
    (r) => (travelerId && r.reviewerId === travelerId) || r.revieweeId === senderId
  );

  const userReview = reviews.find((r) => r.reviewerId === currentUser?.id);
  const partnerReview = reviews.find((r) => r.reviewerId !== currentUser?.id);

  const counterpartyName = isSender ? travelerName : senderName;
  const counterpartyRole = isSender ? 'Traveler' : 'Sender';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    createReviewMutation.mutate({
      shipmentId: shipment.id,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden p-0 gap-0">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 block [.border-b]:pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Shipment Rating & Feedback
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {isAdmin
                  ? 'Overview of ratings & feedback for this completed shipment'
                  : `Review your completed shipment experience with ${counterpartyName}`}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
          >
            Delivered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="h-24 w-full bg-slate-50 animate-pulse rounded-lg" />
        ) : isAdmin ? (
          /* Admin View: Shows both Sender's and Traveler's reviews */
          !senderReview && !travelerReview ? (
            <div className="p-6 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center py-8">
              <Clock className="h-8 w-8 text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Reviews Submitted Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Neither the sender ({senderName}) nor the traveler ({travelerName}) has left a review for this shipment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sender's Review */}
              {senderReview ? (
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {senderReview.reviewer?.image ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
                          <Image
                            src={toRelativeImageUrl(senderReview.reviewer.image)}
                            alt={senderReview.reviewer.name || senderName}
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <User className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {senderName}&apos;s Review <span className="font-normal text-slate-500">(Sender)</span>
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800">
                      Verified Review
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          senderReview.rating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">
                      {senderReview.rating}.0
                    </span>
                  </div>
                  {senderReview.comment && (
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      &quot;{senderReview.comment}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-500">
                    Awaiting review from Sender ({senderName}).
                  </p>
                </div>
              )}

              {/* Traveler's Review */}
              {travelerReview ? (
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {travelerReview.reviewer?.image ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
                          <Image
                            src={toRelativeImageUrl(travelerReview.reviewer.image)}
                            alt={travelerReview.reviewer.name || travelerName}
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <User className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {travelerName}&apos;s Review <span className="font-normal text-slate-500">(Traveler)</span>
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800">
                      Verified Review
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          travelerReview.rating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">
                      {travelerReview.rating}.0
                    </span>
                  </div>
                  {travelerReview.comment && (
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      &quot;{travelerReview.comment}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-500">
                    Awaiting review from Traveler ({travelerName}).
                  </p>
                </div>
              )}
            </div>
          )
        ) : !userReview && isParticipant ? (
          /* Form to submit review */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                How was your experience with {counterpartyName} ({counterpartyRole})?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your rating and share your thoughts to help other users on Shiffto.
              </p>
            </div>

            {/* Star selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
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
                        className={`h-6 w-6 ${
                          active ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>

            {/* Comment area */}
            <div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Write a review about ${counterpartyName}... (optional)`}
                rows={3}
                className="text-xs md:text-sm border-slate-200 focus-visible:ring-[#0D307A]"
              />
            </div>

            <Button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="bg-[#0D307A] hover:bg-[#092E72] text-white rounded-lg text-xs font-semibold h-9 px-5 shadow-sm cursor-pointer"
            >
              {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        ) : (
          /* Submitted view */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User's own review */}
              {userReview ? (
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Your Review</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-slate-200 text-slate-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Submitted
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          userReview.rating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">
                      {userReview.rating}.0
                    </span>
                  </div>
                  {userReview.comment && (
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      &quot;{userReview.comment}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/60 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 font-medium">
                    You haven&apos;t left a review for this shipment yet.
                  </p>
                </div>
              )}

              {/* Partner review */}
              {partnerReview ? (
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {partnerReview.reviewer?.image ? (
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
                          <Image
                            src={toRelativeImageUrl(partnerReview.reviewer.image)}
                            alt={partnerReview.reviewer.name}
                            width={20}
                            height={20}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <User className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {partnerReview.reviewer?.name || 'Partner'}&apos;s Review
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-100 text-emerald-800"
                    >
                      Verified Review
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          partnerReview.rating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">
                      {partnerReview.rating}.0
                    </span>
                  </div>
                  {partnerReview.comment && (
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      &quot;{partnerReview.comment}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50/50 border border-dashed border-slate-200 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-500">Awaiting review from {counterpartyName}.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
