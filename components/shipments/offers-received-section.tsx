'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plane, Scale, Boxes, Tag, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useReceivedOffers, useAcceptOffer, useRejectOffer, useCancelCheckout } from '@/hooks/use-offers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

interface OffersReceivedSectionProps {
  layoutMode?: 'grid' | 'horizontal-scroll';
  titleClassName?: string;
}

export function getFlightTimeStatus(flightDateStr?: string) {
  if (!flightDateStr) return { label: 'Upcoming', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  const flightDate = new Date(flightDateStr);
  const now = new Date();
  const diffMs = flightDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) {
    return { label: 'Passed', class: 'bg-slate-50 text-slate-500 border-slate-200' };
  } else if (diffHours < 24) {
    return { label: `${Math.round(diffHours)}h left`, class: 'bg-red-50 text-red-600 border-red-100' };
  } else if (diffHours < 72) {
    return { label: `${Math.round(diffHours / 24)}d left`, class: 'bg-amber-50 text-amber-600 border-amber-100' };
  } else {
    return { label: `${Math.round(diffHours / 24)}d left`, class: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  }
}

export function OffersReceivedSection({
  layoutMode = 'grid',
  titleClassName = 'text-xl text-muted-foreground tracking-tight',
}: OffersReceivedSectionProps) {
  const { data: offersData, isLoading: offersLoading } = useReceivedOffers();
  const offers = offersData || [];

  const acceptOfferMutation = useAcceptOffer();
  const rejectOfferMutation = useRejectOffer();
  const cancelCheckoutMutation = useCancelCheckout();

  const handleAcceptOffer = async (offerId: string, travellerName: string) => {
    try {
      const res = await acceptOfferMutation.mutateAsync(offerId);
      toast.success(
        `Offer from ${travellerName} selected! Redirecting to payment checkout...`
      );
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to accept offer');
    }
  };

  const handleRejectOffer = async (offerId: string, travellerName: string) => {
    try {
      await rejectOfferMutation.mutateAsync(offerId);
      toast.success(`Offer from ${travellerName} declined.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to decline offer');
    }
  };

  const handleCancelCheckout = async (offerId: string, travellerName: string) => {
    try {
      await cancelCheckoutMutation.mutateAsync(offerId);
      toast.success(`Checkout for ${travellerName}'s offer canceled.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to cancel checkout');
    }
  };

  const isHorizontal = layoutMode === 'horizontal-scroll';

  return (
    <div className="space-y-4 bg-background p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <h2 className={titleClassName}>Offers received</h2>
        <Badge className="bg-primary text-white font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs rounded-full">
          {offers.length}
        </Badge>
      </div>

      <AnimatePresence mode="popLayout">
        {offersLoading ? (
          <div
            className={
              isHorizontal
                ? 'flex gap-4 sm:gap-6 overflow-x-auto pb-2 flex-nowrap'
                : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
            }
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={
                  isHorizontal
                    ? 'w-[320px] sm:w-[350px] shrink-0 animate-pulse flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm h-64'
                    : 'animate-pulse flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm h-64'
                }
              >
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                    <div className="h-6 w-12 bg-slate-100 rounded"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-14 w-14 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-10 px-4 rounded-2xl border border-slate-100 bg-white shadow-xs text-center"
          >
            <Package className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">
              No pending offers for your shipments right now.
            </p>
          </motion.div>
        ) : (
          <div
            className={
              isHorizontal
                ? 'w-full overflow-x-auto pb-3 -mb-2 scrollbar-thin [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full'
                : ''
            }
          >
            <div
              className={
                isHorizontal
                  ? 'flex items-stretch gap-4 sm:gap-6 flex-nowrap min-w-max'
                  : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
              }
            >
              {offers.map((offer) => {
                const timeStatus = getFlightTimeStatus(offer.trip?.flightDate);
                const travelerName = offer.traveller?.name || 'Unknown Traveler';
                const offeredPrice = offer.offeredPrice;

                return (
                  <motion.div
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={
                      isHorizontal
                        ? 'w-[330px] sm:w-[360px] shrink-0 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md duration-200'
                        : 'relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md duration-200'
                    }
                  >
                    <div>
                      {/* Time status & Price */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${timeStatus.class}`}
                        >
                          <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                          {timeStatus.label}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-[#0B3A8E]">${offer.senderPrice}</span>
                          <span className="text-[9px] text-slate-400 font-medium uppercase">Original Price</span>
                        </div>
                      </div>

                      {/* Shipment Item */}
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {offer.shipment?.itemPhotos?.[0] ? (
                            <Image
                              src={toRelativeImageUrl(offer.shipment.itemPhotos[0])}
                              alt={offer.shipment.itemName}
                              className="object-cover w-full h-full"
                              width={56}
                              height={56}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-800 truncate">
                            {offer.shipment?.itemName || 'Unknown Item'}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                            <Plane className="h-3.5 w-3.5 text-slate-400 rotate-45 shrink-0" />
                            {offer.shipment ? (
                              <span className="truncate">
                                {getCountryByCode(offer.shipment.fromCountry)?.name ?? offer.shipment.fromCountry} -{' '}
                                {getCountryByCode(offer.shipment.toCountry)?.name ?? offer.shipment.toCountry}
                              </span>
                            ) : (
                              'Unknown Route'
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium pt-0.5">
                            <span className="flex items-center gap-1">
                              <Scale className="h-3 w-3 shrink-0" />
                              {offer.shipment?.weight || 0} Kg
                            </span>
                            <span className="flex items-center gap-1">
                              <Boxes className="h-3 w-3 shrink-0" />
                              {offer.shipment?.quantity || 0}pcs
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Traveler info & offered price */}
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 mb-5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {offer.traveller?.image ? (
                              <Image
                                src={toRelativeImageUrl(offer.traveller.image)}
                                alt={travelerName}
                                className="object-cover w-full h-full"
                                width={56}
                                height={56}
                              />
                            ) : (
                              <span>{travelerName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800 truncate">
                              {travelerName}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium truncate">
                              <span className="flex items-center gap-1 shrink-0">
                                <Tag className="h-2.5 w-2.5 shrink-0" />
                                {offer.trip?.flightNumber || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1 truncate">
                                <Calendar className="h-2.5 w-2.5 shrink-0" />
                                {offer.trip?.flightDate ? new Date(offer.trip.flightDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right pl-2 shrink-0">
                          <span
                            className={`text-sm font-bold block ${
                              offer.isCounterOffer ? 'text-amber-600 scale-105 font-extrabold' : 'text-[#0D307A]'
                            }`}
                          >
                            ${offeredPrice}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">
                            {offer.isCounterOffer ? 'Counter Offer' : 'Offered price'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      {offer.status === 'PAYMENT_PENDING' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancelCheckoutMutation.isPending || acceptOfferMutation.isPending}
                            onClick={() => handleCancelCheckout(offer.id, travelerName)}
                            className="flex-1 bg-background border-slate-200 text-foreground hover:bg-slate-50 font-semibold"
                          >
                            {cancelCheckoutMutation.isPending ? 'Canceling...' : 'Cancel Checkout'}
                          </Button>
                          <Button
                            size="sm"
                            disabled={cancelCheckoutMutation.isPending || acceptOfferMutation.isPending}
                            onClick={() => handleAcceptOffer(offer.id, travelerName)}
                            className="flex-1 bg-[#0B3A8E] hover:bg-[#092E72] text-white font-semibold shadow-sm"
                          >
                            {acceptOfferMutation.isPending ? 'Redirecting...' : 'Pay Now'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={rejectOfferMutation.isPending || acceptOfferMutation.isPending}
                            onClick={() => handleRejectOffer(offer.id, travelerName)}
                            className="flex-1 bg-background border-slate-200 text-foreground hover:bg-slate-50 font-semibold"
                          >
                            {rejectOfferMutation.isPending ? 'Declining...' : 'Reject'}
                          </Button>
                          <Button
                            size="sm"
                            disabled={rejectOfferMutation.isPending || acceptOfferMutation.isPending}
                            onClick={() => handleAcceptOffer(offer.id, travelerName)}
                            className="flex-1 bg-[#0B3A8E] hover:bg-[#092E72] text-white font-semibold shadow-sm"
                          >
                            {acceptOfferMutation.isPending ? 'Accepting...' : 'Accept'}
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
