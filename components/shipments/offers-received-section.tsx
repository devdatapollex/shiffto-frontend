import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, PlaneTakeoff, Luggage, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  useReceivedOffers,
  useAcceptOffer,
  useRejectOffer,
  useCancelCheckout,
} from '@/hooks/use-offers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

interface OffersReceivedSectionProps {
  layoutMode?: 'grid' | 'horizontal-scroll';
  titleClassName?: string;
}

export function formatFlightDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return dateStr;
  }
}

export function getOfferExpirationStatus(createdAtStr?: string, status?: string) {
  if (status === 'EXPIRED') {
    return { label: 'Expired', class: 'bg-slate-100 text-slate-500', isExpired: true };
  }
  if (!createdAtStr) {
    return { label: '30:00 left', class: 'bg-[#DCFCE7] text-[#16A34A]', isExpired: false };
  }

  const createdAt = new Date(createdAtStr).getTime();
  const totalDurationMs = 30 * 60 * 1000;
  const expiresAt = createdAt + totalDurationMs;
  const now = Date.now();
  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    return { label: 'Expired', class: 'bg-slate-100 text-slate-500', isExpired: true };
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left`;

  const timePassedMs = now - createdAt;
  const timePassedRatio = timePassedMs / totalDurationMs;

  let colorClass = '';
  if (timePassedRatio < 1 / 3) {
    colorClass = 'bg-[#DCFCE7] text-[#16A34A]';
  } else if (timePassedRatio < 2 / 3) {
    colorClass = 'bg-[#FEF3C7] text-[#D97706]';
  } else {
    colorClass = 'bg-[#FEE2E2] text-[#DC2626]';
    if (minutes < 5) {
      colorClass += ' animate-pulse';
    }
  }

  return { label, class: colorClass, isExpired: false };
}

export function OffersReceivedSection({
  layoutMode = 'grid',
  titleClassName = 'text-xl text-muted-foreground tracking-tight',
}: OffersReceivedSectionProps) {
  const { data: offersData, isLoading: offersLoading } = useReceivedOffers();
  const offers = offersData || [];

  const [, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const acceptOfferMutation = useAcceptOffer();
  const rejectOfferMutation = useRejectOffer();
  const cancelCheckoutMutation = useCancelCheckout();

  const handleAcceptOffer = async (offerId: string, travellerName: string) => {
    try {
      const res = await acceptOfferMutation.mutateAsync(offerId);
      toast.success(`Offer from ${travellerName} selected! Redirecting to payment checkout...`);
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        errorObj?.response?.data?.message || errorObj?.message || 'Failed to accept offer'
      );
    }
  };

  const handleRejectOffer = async (offerId: string, travellerName: string) => {
    try {
      await rejectOfferMutation.mutateAsync(offerId);
      toast.success(`Offer from ${travellerName} rejected.`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        errorObj?.response?.data?.message || errorObj?.message || 'Failed to reject offer'
      );
    }
  };

  const handleCancelCheckout = async (offerId: string, travellerName: string) => {
    try {
      await cancelCheckoutMutation.mutateAsync(offerId);
      toast.success(`Checkout for ${travellerName}'s offer canceled.`);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        errorObj?.response?.data?.message || errorObj?.message || 'Failed to cancel checkout'
      );
    }
  };

  const isHorizontal = layoutMode === 'horizontal-scroll';

  return (
    <div className="space-y-4 bg-background p-4 sm:p-6 rounded-lg border border-slate-200/80 shadow-xs">
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
                    ? 'w-[320px] sm:w-[350px] shrink-0 animate-pulse flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-64'
                    : 'animate-pulse flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-64'
                }
              >
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                    <div className="h-6 w-12 bg-slate-100 rounded"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-14 w-14 bg-slate-100 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-10 px-4 rounded-lg border border-slate-100 bg-white shadow-xs text-center"
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
                  ? 'flex items-stretch gap-2 sm:gap-4 flex-nowrap min-w-max'
                  : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              }
            >
              {offers.map((offer) => {
                const timeStatus = getOfferExpirationStatus(offer.createdAt, offer.status);
                const isExpired = timeStatus.isExpired || offer.status === 'EXPIRED';
                const travelerName = offer.traveller?.name || 'Unknown Traveler';
                const offeredPrice = offer.offeredPrice;
                const shipmentWeight = offer.shipment?.weight || 1;
                const senderTotalPrice = (
                  (offer.senderPrice ?? offer.shipment?.pricePerKg ?? 0) * shipmentWeight
                ).toFixed(0);
                const offeredTotalPrice = (offeredPrice * shipmentWeight).toFixed(0);

                return (
                  <motion.div
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={
                      isHorizontal
                        ? 'w-[340px] sm:w-[370px] shrink-0 relative flex flex-col justify-between overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md duration-200'
                        : 'relative flex flex-col justify-between overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md duration-200'
                    }
                  >
                    <div>
                      {/* Time status badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${timeStatus.class}`}
                        >
                          <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                          {timeStatus.label}
                        </span>
                      </div>

                      {/* Shipment Item */}
                      <div className="flex gap-3.5 items-start mb-4">
                        <div className="w-14 h-14 bg-slate-200/80 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
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
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-bold text-[#0B3A8E] truncate">
                              {offer.shipment?.itemName || 'Unknown Item'}
                            </h3>
                            <span className="text-xl font-bold text-[#94A3B8] shrink-0">
                              ${senderTotalPrice}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                            <PlaneTakeoff className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {offer.shipment ? (
                              <span className="truncate">
                                {getCountryByCode(offer.shipment.fromCountry)?.name ??
                                  offer.shipment.fromCountry}{' '}
                                -{' '}
                                {getCountryByCode(offer.shipment.toCountry)?.name ??
                                  offer.shipment.toCountry}
                              </span>
                            ) : (
                              'Unknown Route'
                            )}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                            <Luggage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>
                              {offer.shipment?.weight || 0} Kg • {offer.shipment?.quantity || 1}pcs
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Traveler info & offered price */}
                      <div className="bg-[#F4F6F9] rounded-lg p-3.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 overflow-hidden">
                            {offer.traveller?.image ? (
                              <Image
                                src={toRelativeImageUrl(offer.traveller.image)}
                                alt={travelerName}
                                className="object-cover w-full h-full"
                                width={36}
                                height={36}
                              />
                            ) : (
                              <span>{travelerName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-sm font-normal text-[#0B3A8E] truncate">
                              {travelerName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 text-nowrap">
                              <PlaneTakeoff className="h-3.5 w-3.5 text-slate-400" />
                              <span>
                                {offer.trip?.flightNumber || 'N/A'} •{' '}
                                {formatFlightDate(offer.trip?.flightDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right pl-2 shrink-0">
                          <span className="text-xl font-bold text-[#0B3A8E] block">
                            ${offeredTotalPrice}
                          </span>
                          <span className="text-xs text-slate-400 font-normal block leading-tight">
                            {offer.isCounterOffer ? (
                              <>
                                Counter
                                <br />
                                Offer
                              </>
                            ) : (
                              <>
                                Offered
                                <br />
                                Price
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {offer.status === 'PAYMENT_CANCELED' ? (
                      <div className="text-xs text-red-500 font-semibold flex items-center justify-start gap-1 my-1 animate-in fade-in duration-200">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Previous payment canceled</span>
                      </div>
                    ) : (
                      <hr className="border-slate-200/80 my-3" />
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      {isExpired ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="col-span-2 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        >
                          Offer Expired
                        </Button>
                      ) : offer.status === 'PAYMENT_PENDING' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              cancelCheckoutMutation.isPending || acceptOfferMutation.isPending
                            }
                            onClick={() => handleCancelCheckout(offer.id, travelerName)}
                            className="border-foreground text-foreground hover:bg-foreground/10"
                          >
                            {cancelCheckoutMutation.isPending ? 'Canceling...' : 'Cancel Checkout'}
                          </Button>
                          <Button
                            size="sm"
                            disabled={
                              cancelCheckoutMutation.isPending || acceptOfferMutation.isPending
                            }
                            onClick={() => handleAcceptOffer(offer.id, travelerName)}
                            className="bg-foreground hover:bg-foreground/90 text-white shadow-xs"
                          >
                            {acceptOfferMutation.isPending ? 'Redirecting...' : 'Pay Now'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              rejectOfferMutation.isPending || acceptOfferMutation.isPending
                            }
                            onClick={() => handleRejectOffer(offer.id, travelerName)}
                            className="border-destructive text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            {rejectOfferMutation.isPending ? 'Rejecting...' : 'Reject'}
                          </Button>

                          <Button
                            size="sm"
                            disabled={
                              rejectOfferMutation.isPending || acceptOfferMutation.isPending
                            }
                            onClick={() => handleAcceptOffer(offer.id, travelerName)}
                            className="bg-foreground hover:bg-foreground/90 text-white shadow-xs"
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
