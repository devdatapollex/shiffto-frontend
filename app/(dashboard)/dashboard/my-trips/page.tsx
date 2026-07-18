'use client';

import { useState, useEffect } from 'react';
import { useMyTrips, useCancelTrip, useCompleteTrip } from '@/hooks/use-trips';
import { useCreateOffer } from '@/hooks/use-offers';
import { useAvailableShipments } from '@/hooks/use-available-shipments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MoreVertical,
  Plane,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  FileText,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { getCountryByCode } from '@/lib/constants/countries';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import type { Shipment } from '@/services/shipment.service';
import type { Trip } from '@/services/trip.service';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

export default function MyTripsPage() {
  // Tabs and search states
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shipmentIndex, setShipmentIndex] = useState<number>(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Dialog states
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [acceptingTripId, setAcceptingTripId] = useState<string>('');
  const [bagType, setBagType] = useState<'cabin' | 'checkIn'>('checkIn');
  const [selectedViewTrip, setSelectedViewTrip] = useState<Trip | null>(null);

  // Counter offer dialog states
  const [selectedCounterShipment, setSelectedCounterShipment] = useState<Shipment | null>(null);
  const [counterPrice, setCounterPrice] = useState<string>('');
  const [counterTripId, setCounterTripId] = useState<string>('');
  const [counterBagType, setCounterBagType] = useState<'cabin' | 'checkIn'>('checkIn');

  // React Query data fetching
  const { data: tripsData, isLoading: tripsLoading } = useMyTrips();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useAvailableShipments();

  // Fetch matching trips for Accept dialog
  const { data: acceptMatchingTripsData, isLoading: acceptMatchingLoading } = useMyTrips(
    {
      status: 'ACTIVE',
      fromCountry: selectedShipment?.fromCountry,
      toCountry: selectedShipment?.toCountry,
    },
    {
      enabled: !!selectedShipment,
    }
  );

  // Fetch matching trips for Counter-Offer dialog
  const { data: counterMatchingTripsData, isLoading: counterMatchingLoading } = useMyTrips(
    {
      status: 'ACTIVE',
      fromCountry: selectedCounterShipment?.fromCountry,
      toCountry: selectedCounterShipment?.toCountry,
    },
    {
      enabled: !!selectedCounterShipment,
    }
  );

  const matchingAcceptTrips = acceptMatchingTripsData?.data || [];
  useEffect(() => {
    if (selectedShipment && matchingAcceptTrips.length > 0) {
      if (!matchingAcceptTrips.some((t) => t.id === acceptingTripId)) {
        setAcceptingTripId(matchingAcceptTrips[0].id);
      }
    } else if (selectedShipment && matchingAcceptTrips.length === 0 && !acceptMatchingLoading) {
      setAcceptingTripId('');
    }
  }, [matchingAcceptTrips, selectedShipment, acceptMatchingLoading, acceptingTripId]);

  const matchingCounterTrips = counterMatchingTripsData?.data || [];
  useEffect(() => {
    if (selectedCounterShipment && matchingCounterTrips.length > 0) {
      if (!matchingCounterTrips.some((t) => t.id === counterTripId)) {
        setCounterTripId(matchingCounterTrips[0].id);
      }
    } else if (selectedCounterShipment && matchingCounterTrips.length === 0 && !counterMatchingLoading) {
      setCounterTripId('');
    }
  }, [matchingCounterTrips, selectedCounterShipment, counterMatchingLoading, counterTripId]);

  // Mutations
  const cancelTripMutation = useCancelTrip();
  const completeTripMutation = useCompleteTrip();
  const createOfferMutation = useCreateOffer();

  // Helper lists
  const trips: Trip[] = tripsData?.data || [];
  const availableShipments: Shipment[] = shipmentsData?.data || [];
  const visibleShipments = availableShipments.slice(shipmentIndex, shipmentIndex + 3);

  // Active trips for accepting shipments
  const activeTrips = trips.filter((t) => t.status === 'ACTIVE');

  // Filtering trips based on tab and search
  const filteredTrips = trips.filter((trip) => {
    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'canceled' && trip.status !== 'CANCELLED') return false;
      if (activeTab !== 'canceled' && trip.status.toLowerCase() !== activeTab) return false;
    }

    // Search filter (Origin, Destination, or Flight Number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const fromName = getCountryByCode(trip.fromCountry)?.name.toLowerCase() || '';
      const toName = getCountryByCode(trip.toCountry)?.name.toLowerCase() || '';
      const flightNum = trip.flightNumber.toLowerCase();
      const tripId = `tr-${trip.id.slice(-4)}`.toLowerCase();

      return (
        fromName.includes(query) ||
        toName.includes(query) ||
        flightNum.includes(query) ||
        tripId.includes(query)
      );
    }

    return true;
  });

  // Pagination calculations
  const totalItems = filteredTrips.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalItems);
  const paginatedTrips = filteredTrips.slice(startIdx, startIdx + pageSize);

  const handleCancelTrip = async (id: string) => {
    try {
      await cancelTripMutation.mutateAsync(id);
      toast.success('Trip cancelled successfully');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel trip');
    }
  };

  const handleCompleteTrip = async (id: string) => {
    try {
      await completeTripMutation.mutateAsync(id);
      toast.success('Trip completed successfully');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete trip');
    }
  };

  const handleOpenAcceptDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setAcceptingTripId('');
    setBagType('checkIn');
  };

  const handleAcceptShipmentSubmit = async () => {
    if (!selectedShipment || !acceptingTripId) return;

    try {
      await createOfferMutation.mutateAsync({
        tripId: acceptingTripId,
        shipmentId: selectedShipment.id,
        bagType,
        offeredPrice: selectedShipment.pricePerKg,
      });
      toast.success("Offer submitted successfully at sender's price!");
      setSelectedShipment(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit offer');
    }
  };

  const handleOpenCounterDialog = (shipment: Shipment) => {
    setSelectedCounterShipment(shipment);
    setCounterPrice(shipment.pricePerKg.toString());
    setCounterTripId('');
    setCounterBagType('checkIn');
  };

  const handleCounterOfferSubmit = async () => {
    if (!selectedCounterShipment || !counterTripId) return;

    const price = parseFloat(counterPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid positive price');
      return;
    }

    const category = selectedCounterShipment.category;
    if (!category) {
      toast.error('Shipment category is missing');
      return;
    }
    if (price < category.minPrice) {
      toast.error(`Price cannot be less than the category minimum of $${category.minPrice}`);
      return;
    }
    if (category.maxPrice !== null && price > category.maxPrice) {
      toast.error(`Price cannot be more than the category maximum of $${category.maxPrice}`);
      return;
    }

    try {
      await createOfferMutation.mutateAsync({
        tripId: counterTripId,
        shipmentId: selectedCounterShipment.id,
        bagType: counterBagType,
        offeredPrice: price,
      });
      toast.success('Counter-offer submitted successfully!');
      setSelectedCounterShipment(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit counter-offer');
    }
  };

  const handleNextShipments = () => {
    if (shipmentIndex + 3 < availableShipments.length) {
      setShipmentIndex((prev) => prev + 1);
    }
  };

  const handlePrevShipments = () => {
    if (shipmentIndex > 0) {
      setShipmentIndex((prev) => prev - 1);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-[#EEF2FF] hover:bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FF] font-medium px-2.5 py-0.5 rounded-full">
            Active
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-[#FFFBEB] hover:bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7] font-medium px-2.5 py-0.5 rounded-full">
            Pending
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-[#ECFDF5] hover:bg-[#ECFDF5] text-[#059669] border-[#D1FAE5] font-medium px-2.5 py-0.5 rounded-full">
            Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-[#FEF2F2] hover:bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2] font-medium px-2.5 py-0.5 rounded-full">
            Cancelled
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-[#F3F4F6] hover:bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB] font-medium px-2.5 py-0.5 rounded-full">
            Rejected
          </Badge>
        );
    }
  };

  // Mock remaining time clock for Available Shipments
  const getClockBadge = (index: number) => {
    const times = [
      { time: '08:45', class: 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]' },
      { time: '21:12', class: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]' },
      { time: '29:16', class: 'bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]' },
    ];
    return times[index % times.length];
  };

  return (
    <div className="space-y-8">
      {/* 1. New Shipments Carousel/List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-[#0B3A8E] tracking-tight">New Shipments</h2>
          <Badge className="bg-[#FF6F3F] text-white hover:bg-[#FF6F3F] rounded-full px-2 py-0.5 text-xs font-semibold">
            {availableShipments.length}
          </Badge>
        </div>

        {shipmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="animate-pulse bg-slate-50 border-slate-200">
                <CardContent className="h-48" />
              </Card>
            ))}
          </div>
        ) : availableShipments.length === 0 ? (
          <Card className="border border-dashed border-[#e2e8f0] p-8 text-center text-slate-500">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No new matching shipments available at the moment.</p>
          </Card>
        ) : (
          <div className="flex items-center gap-4">
            {shipmentIndex > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevShipments}
                className="h-10 w-10 rounded-full border-[#e2e8f0] bg-white shadow-xs hover:bg-slate-50 transition-all shrink-0 cursor-pointer flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5 text-[#0B3A8E]" />
              </Button>
            )}

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleShipments.map((shipment, index) => {
                const clockBadge = getClockBadge(shipmentIndex + index);
                const fromCountry = getCountryByCode(shipment.fromCountry);
                const toCountry = getCountryByCode(shipment.toCountry);

                return (
                  <Card
                    key={shipment.id}
                    className="border border-[#e2e8f0] hover:border-slate-300 transition-all rounded-2xl overflow-hidden bg-white shadow-xs"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      {/* Time limit badge */}
                      <div className="flex justify-between items-center">
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${clockBadge.class}`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{clockBadge.time}</span>
                        </div>
                        <span className="text-[#0B3A8E] font-bold text-lg">
                          ${shipment.pricePerKg}/kg
                        </span>
                      </div>

                      <div className="flex gap-4 items-start">
                        {/* Product image placeholder */}
                        <div className="h-16 w-16 rounded-xl border border-slate-100 bg-slate-50 shrink-0 overflow-hidden flex items-center justify-center">
                          {shipment.itemPhotos && shipment.itemPhotos.length > 0 ? (
                            <Image
                              src={toRelativeImageUrl(shipment.itemPhotos[0])}
                              alt={shipment.itemName}
                              className="h-full w-full object-cover"
                              width={64}
                              height={64}
                            />
                          ) : (
                            <Package className="h-7 w-7 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[#0B3A8E] text-base truncate">
                            {shipment.itemName}
                          </h4>
                          <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs font-medium">
                            <span>{fromCountry?.name}</span>
                            <span>&rarr;</span>
                            <span>{toCountry?.name}</span>
                          </div>
                          <p className="text-slate-400 text-xs mt-1">
                            {shipment.weight} Kg &bull; {shipment.quantity}pcs
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                          variant="outline"
                          className="border-[#e2e8f0] text-slate-700 hover:bg-slate-50 rounded-xl h-10 font-semibold text-sm"
                          onClick={() => handleOpenCounterDialog(shipment)}
                        >
                          Counter
                        </Button>
                        <Button
                          className="bg-[#0B3A8E] hover:bg-[#082a66] text-white rounded-xl h-10 font-semibold text-sm transition-colors"
                          onClick={() => handleOpenAcceptDialog(shipment)}
                        >
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {shipmentIndex + 3 < availableShipments.length && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextShipments}
                className="h-10 w-10 rounded-full border-[#e2e8f0] bg-white shadow-xs hover:bg-slate-50 transition-all shrink-0 cursor-pointer flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5 text-[#0B3A8E]" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 2. Trips History section (inside card) */}
      <Card className="border border-[#e2e8f0] rounded-2xl bg-white shadow-xs overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-[#e2e8f0]/60 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0B3A8E] tracking-tight">Trips History</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl flex flex-wrap h-auto gap-1">
                {['all', 'active', 'pending', 'completed', 'canceled', 'rejected'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-lg text-xs md:text-sm font-semibold capitalize data-[state=active]:bg-white data-[state=active]:text-[#0b3a8e] data-[state=active]:shadow-xs px-3 py-1.5 transition-all cursor-pointer"
                  >
                    {tab === 'all' ? 'All' : tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search shipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 rounded-xl border-[#e2e8f0] focus:border-[#0B3A8E] bg-white h-10 text-sm w-full"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-[#e2e8f0] h-10 w-10 rounded-xl text-slate-600"
              >
                <SlidersHorizontal className="h-4.5 w-4.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-[#e2e8f0] h-10 w-10 rounded-xl text-slate-600"
              >
                <ArrowUpDown className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {tripsLoading ? (
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-8 bg-slate-100 rounded w-1/3" />
              <div className="h-20 bg-slate-100 rounded" />
              <div className="h-20 bg-slate-100 rounded" />
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white">
              <Plane className="h-12 w-12 text-slate-300 mx-auto mb-3 stroke-[1.2]" />
              <p className="text-base font-medium">No trips history found.</p>
              <p className="text-sm text-slate-400 mt-1">
                Try creating a new trip or modifying your search.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/40 border-b border-[#e2e8f0]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-500 text-xs md:text-sm py-4 pl-6">
                      Trip ID & route
                    </TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs md:text-sm py-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs md:text-sm py-4">
                      Flight
                    </TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs md:text-sm py-4">
                      Total capacity
                    </TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs md:text-sm py-4">
                      Remaining capacity
                    </TableHead>
                    <TableHead className="font-semibold text-slate-500 text-xs md:text-sm py-4 text-right pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTrips.map((trip) => {
                    const fromCountry = getCountryByCode(trip.fromCountry);
                    const toCountry = getCountryByCode(trip.toCountry);
                    const tripIdLabel = `#TR-${trip.id.slice(-4).toUpperCase()}`;

                    const totalCap = (trip.cabinBagCapacity || 0) + (trip.checkInBagCapacity || 0);
                    const remCap =
                      (trip.remainingCabinCapacity || 0) + (trip.remainingCheckInCapacity || 0);

                    return (
                      <TableRow
                        key={trip.id}
                        className="hover:bg-slate-50/50 border-b border-[#e2e8f0]/60 last:border-0 transition-colors"
                      >
                        <TableCell className="py-4 pl-6">
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs text-slate-400 font-semibold">
                              {tripIdLabel}
                            </span>
                            <span className="text-[#0B3A8E] font-bold text-sm md:text-base">
                              {fromCountry?.name} - {toCountry?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">{renderStatusBadge(trip.status)}</TableCell>
                        <TableCell className="py-4 text-slate-700 font-semibold text-sm">
                          {trip.flightNumber}
                        </TableCell>
                        <TableCell className="py-4 text-slate-600 font-medium text-sm">
                          {totalCap} KG
                        </TableCell>
                        <TableCell className="py-4 text-[#0B3A8E] font-bold text-sm">
                          {remCap} KG
                        </TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              className="border-[#e2e8f0] hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs md:text-sm h-9 px-4"
                              onClick={() => setSelectedViewTrip(trip)}
                            >
                              View details
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500"
                                >
                                  <MoreVertical className="h-4.5 w-4.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-44 rounded-xl border-[#e2e8f0] p-1"
                              >
                                {trip.status === 'ACTIVE' && (
                                  <DropdownMenuItem
                                    className="text-emerald-600 font-medium rounded-lg cursor-pointer"
                                    onClick={() => handleCompleteTrip(trip.id)}
                                  >
                                    Complete Trip
                                  </DropdownMenuItem>
                                )}
                                {(trip.status === 'ACTIVE' || trip.status === 'PENDING') && (
                                  <DropdownMenuItem
                                    className="text-red-600 font-medium rounded-lg cursor-pointer"
                                    onClick={() => handleCancelTrip(trip.id)}
                                  >
                                    Cancel Trip
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-slate-700 font-medium rounded-lg cursor-pointer"
                                  onClick={() =>
                                    toast.info('Additional trip configurations coming soon!')
                                  }
                                >
                                  Configure
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination controls */}
          {filteredTrips.length > 0 && (
            <div className="border-t border-[#e2e8f0]/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
              {/* Left: Entries selector and showing info */}
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-16 rounded-lg border-[#e2e8f0] bg-white text-xs">
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[#e2e8f0] min-w-[4rem] bg-white">
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem
                          key={size}
                          value={size.toString()}
                          className="text-xs rounded-lg cursor-pointer"
                        >
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                </div>
                <span className="hidden sm:inline-block h-4 w-[1px] bg-slate-200" />
                <span>
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {totalItems === 0 ? 0 : startIdx + 1}
                  </span>{' '}
                  to <span className="font-semibold text-slate-700">{endIdx}</span> of{' '}
                  <span className="font-semibold text-slate-700">{totalItems}</span> entries
                </span>
              </div>

              {/* Right: Page buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 rounded-lg border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600 px-3 cursor-pointer text-xs"
                >
                  Previous
                </Button>

                {/* Render dynamic page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    totalPages > 5 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (page === 2 && currentPage > 3) {
                      return (
                        <span key="dots-left" className="px-1.5 text-slate-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    if (page === totalPages - 1 && currentPage < totalPages - 2) {
                      return (
                        <span key="dots-right" className="px-1.5 text-slate-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#0B3A8E] hover:bg-[#082a66] text-white border-transparent'
                          : 'border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 rounded-lg border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600 px-3 cursor-pointer text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Accept Shipment Coord Dialog */}
      <Dialog
        open={selectedShipment !== null}
        onOpenChange={(open) => !open && setSelectedShipment(null)}
      >
        <DialogContent className="max-w-md rounded-2xl border-[#e2e8f0] p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#0B3A8E] flex items-center gap-2">
              <Navigation className="h-5 w-5 text-orange-500" />
              Accept Shipment
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Coordinate this shipment with one of your active flight trips.
            </DialogDescription>
          </DialogHeader>

          {acceptMatchingLoading ? (
            <div className="py-8 text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B3A8E] mx-auto"></div>
              <p className="text-xs text-slate-400">Fetching matching trips...</p>
            </div>
          ) : matchingAcceptTrips.length === 0 ? (
            <div className="py-4 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active matching trips found</p>
              <p className="text-xs text-slate-400">
                You must have an approved, ACTIVE trip with route matching the shipment to accept
                it.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-3">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Shipment Item
                </span>
                <p className="font-bold text-[#0B3A8E] text-base">{selectedShipment?.itemName}</p>
                <p className="text-slate-500 text-sm">
                  Required capacity:{' '}
                  <strong className="text-slate-800">{selectedShipment?.weight} KG</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select flight trip
                </label>
                <Select value={acceptingTripId} onValueChange={setAcceptingTripId}>
                  <SelectTrigger className="w-full rounded-xl border-[#e2e8f0] h-11 bg-white">
                    <SelectValue placeholder="Choose a trip" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e2e8f0]">
                    {matchingAcceptTrips.map((t) => {
                      const fromCountry = getCountryByCode(t.fromCountry);
                      const toCountry = getCountryByCode(t.toCountry);
                      return (
                        <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                          {fromCountry?.name} - {toCountry?.name} ({t.flightNumber})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select bag slot
                </label>
                <Select
                  value={bagType}
                  onValueChange={(val) => setBagType(val as 'cabin' | 'checkIn')}
                >
                  <SelectTrigger className="w-full rounded-xl border-[#e2e8f0] h-11 bg-white">
                    <SelectValue placeholder="Choose bag slot" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e2e8f0]">
                    <SelectItem value="checkIn" className="cursor-pointer">
                      Check-in luggage
                    </SelectItem>
                    <SelectItem value="cabin" className="cursor-pointer">
                      Cabin luggage
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-[#e2e8f0] hover:bg-slate-50 font-semibold rounded-xl"
              onClick={() => setSelectedShipment(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={matchingAcceptTrips.length === 0 || createOfferMutation.isPending || acceptMatchingLoading}
              className="bg-[#0B3A8E] hover:bg-[#082a66] text-white font-semibold rounded-xl"
              onClick={handleAcceptShipmentSubmit}
            >
              {createOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Counter-Offer Dialog */}
      <Dialog
        open={selectedCounterShipment !== null}
        onOpenChange={(open) => !open && setSelectedCounterShipment(null)}
      >
        <DialogContent className="max-w-md w-full rounded-2xl border-[#e2e8f0] p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0B3A8E]">
              Submit Counter-Offer
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Propose a custom price per kg for this shipment.
            </DialogDescription>
          </DialogHeader>

          {counterMatchingLoading ? (
            <div className="py-8 text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B3A8E] mx-auto"></div>
              <p className="text-xs text-slate-400">Fetching matching trips...</p>
            </div>
          ) : matchingCounterTrips.length === 0 ? (
            <div className="py-4 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active matching trips found</p>
              <p className="text-xs text-slate-400">
                You must have an approved, ACTIVE trip with route matching the shipment to make a counter-offer.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-3">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Shipment Item
                </span>
                <p className="font-bold text-[#0B3A8E] text-base">{selectedCounterShipment?.itemName}</p>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Required capacity:</span>
                  <strong className="text-slate-800">{selectedCounterShipment?.weight} KG</strong>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Current price per KG:</span>
                  <strong className="text-slate-800">${selectedCounterShipment?.pricePerKg}</strong>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Allowed price range:</span>
                  <strong className="text-indigo-600">
                    ${selectedCounterShipment?.category?.minPrice || 0} - {selectedCounterShipment?.category?.maxPrice ? `$${selectedCounterShipment?.category?.maxPrice}` : 'Unlimited'}
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Your Offered Price (per KG)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-7 rounded-xl border-[#e2e8f0] h-11 bg-white text-slate-800"
                    placeholder="Enter your price"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select flight trip
                </label>
                <Select value={counterTripId} onValueChange={setCounterTripId}>
                  <SelectTrigger className="w-full rounded-xl border-[#e2e8f0] h-11 bg-white">
                    <SelectValue placeholder="Choose a trip" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e2e8f0]">
                    {matchingCounterTrips.map((t) => {
                      const fromCountry = getCountryByCode(t.fromCountry);
                      const toCountry = getCountryByCode(t.toCountry);
                      return (
                        <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                          {fromCountry?.name} - {toCountry?.name} ({t.flightNumber})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select bag slot
                </label>
                <Select
                  value={counterBagType}
                  onValueChange={(val) => setCounterBagType(val as 'cabin' | 'checkIn')}
                >
                  <SelectTrigger className="w-full rounded-xl border-[#e2e8f0] h-11 bg-white">
                    <SelectValue placeholder="Choose bag slot" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e2e8f0]">
                    <SelectItem value="checkIn" className="cursor-pointer">
                      Check-in luggage
                    </SelectItem>
                    <SelectItem value="cabin" className="cursor-pointer">
                      Cabin luggage
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-[#e2e8f0] hover:bg-slate-50 font-semibold rounded-xl"
              onClick={() => setSelectedCounterShipment(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={matchingCounterTrips.length === 0 || createOfferMutation.isPending || counterMatchingLoading}
              className="bg-[#0B3A8E] hover:bg-[#082a66] text-white font-semibold rounded-xl"
              onClick={handleCounterOfferSubmit}
            >
              {createOfferMutation.isPending ? 'Submitting...' : 'Submit Counter-Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Trip Details Dialog */}
      <Dialog
        open={selectedViewTrip !== null}
        onOpenChange={(open) => !open && setSelectedViewTrip(null)}
      >
        <DialogContent className="max-w-4xl w-full rounded-2xl border-[#e2e8f0] p-6 bg-white overflow-y-auto max-h-[90vh] pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
          {selectedViewTrip &&
            (() => {
              const fromCountry = getCountryByCode(selectedViewTrip.fromCountry);
              const toCountry = getCountryByCode(selectedViewTrip.toCountry);
              const tripIdLabel = `#TR-${selectedViewTrip.id.slice(-4).toUpperCase()}`;

              const cabinUsed =
                selectedViewTrip.cabinBagCapacity - selectedViewTrip.remainingCabinCapacity;
              const cabinPercentage =
                selectedViewTrip.cabinBagCapacity > 0
                  ? Math.min((cabinUsed / selectedViewTrip.cabinBagCapacity) * 100, 100)
                  : 0;

              const checkInUsed =
                selectedViewTrip.checkInBagCapacity - selectedViewTrip.remainingCheckInCapacity;
              const checkInPercentage =
                selectedViewTrip.checkInBagCapacity > 0
                  ? Math.min((checkInUsed / selectedViewTrip.checkInBagCapacity) * 100, 100)
                  : 0;

              const formatDateString = (dateStr: string) => {
                if (!dateStr) return '';
                try {
                  const onlyDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
                  const parts = onlyDate.split('-');
                  if (parts.length === 3) {
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    const date = new Date(year, month, day);
                    if (!isNaN(date.getTime())) {
                      return date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                    }
                  }
                  const fallbackDate = new Date(dateStr);
                  if (!isNaN(fallbackDate.getTime())) {
                    return fallbackDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                  }
                  return dateStr;
                } catch (e) {
                  return dateStr;
                }
              };

              const formatTimeString = (timeStr: string | null) => {
                if (!timeStr) return 'Not specified';
                try {
                  const [hoursStr, minutesStr] = timeStr.split(':');
                  const hours = parseInt(hoursStr, 10);
                  const minutes = parseInt(minutesStr, 10);
                  if (isNaN(hours) || isNaN(minutes)) return timeStr;

                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  const displayHours = hours % 12 || 12;
                  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
                  return `${displayHours}:${displayMinutes} ${ampm}`;
                } catch (e) {
                  return timeStr;
                }
              };

              return (
                <>
                  <DialogHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-400 font-semibold">{tripIdLabel}</span>
                        <DialogTitle className="text-xl font-bold text-[#0B3A8E]">
                          Trip Details
                        </DialogTitle>
                      </div>
                      {renderStatusBadge(selectedViewTrip.status)}
                    </div>
                  </DialogHeader>

                  {/* Rejection Reason Alert if Rejected */}
                  {selectedViewTrip.status === 'REJECTED' && selectedViewTrip.rejectionReason && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 mt-4 items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-800 text-sm">Trip Rejected</h4>
                        <p className="text-red-700 text-xs mt-1">
                          {selectedViewTrip.rejectionReason}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="py-4 space-y-6">
                    {/* Route card */}
                    <div className="relative overflow-hidden bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between">
                      <div className="flex flex-col space-y-1 z-10">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Departure
                        </span>
                        <span className="font-bold text-[#0B3A8E] text-base">
                          {fromCountry?.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {fromCountry?.code}
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center flex-1 px-4 relative z-10">
                        <div className="w-full flex items-center justify-between relative">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <div className="flex-1 border-t border-dashed border-slate-300 mx-2 relative flex justify-center">
                            <Plane className="h-5 w-5 text-[#0B3A8E] rotate-90 absolute -top-2.5 bg-transparent px-0.5" />
                          </div>
                          <div className="h-1.5 w-1.5 rounded-full bg-[#0B3A8E]" />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 items-end text-right z-10">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Destination
                        </span>
                        <span className="font-bold text-[#0B3A8E] text-base">
                          {toCountry?.name}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {toCountry?.code}
                        </span>
                      </div>
                    </div>

                    {/* Flight Info Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-100 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            Flight Number
                          </p>
                          <p className="text-[#0B3A8E] font-bold text-sm mt-0.5 truncate">
                            {selectedViewTrip.flightNumber}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-100 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
                        <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            Flight Date
                          </p>
                          <p className="text-[#0B3A8E] font-bold text-sm mt-0.5 truncate">
                            {formatDateString(selectedViewTrip.flightDate)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-100 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            Flight Time
                          </p>
                          <p className="text-[#0B3A8E] font-bold text-sm mt-0.5 truncate">
                            {formatTimeString(selectedViewTrip.flightTime)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-100 p-3.5 rounded-xl flex items-center gap-3 shadow-xs">
                        <div className="h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            Airport Arrival
                          </p>
                          <p className="text-[#0B3A8E] font-bold text-sm mt-0.5 truncate">
                            {formatTimeString(selectedViewTrip.airportArrivalTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Baggage Capacities */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                        <Briefcase className="h-4.5 w-4.5 text-[#0B3A8E]" />
                        Baggage Capacity Usage
                      </h4>

                      {/* Cabin baggage capacity */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Cabin luggage slot</span>
                          <span className="text-[#0B3A8E] font-bold">
                            {selectedViewTrip.remainingCabinCapacity} /{' '}
                            {selectedViewTrip.cabinBagCapacity} KG remaining
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0B3A8E] rounded-full transition-all duration-500"
                            style={{ width: `${cabinPercentage}%` }}
                          />
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Used: {cabinUsed.toFixed(1)} KG ({cabinPercentage.toFixed(0)}%)
                        </p>
                      </div>

                      {/* Check-in baggage capacity */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Check-in luggage slot</span>
                          <span className="text-[#0B3A8E] font-bold">
                            {selectedViewTrip.remainingCheckInCapacity} /{' '}
                            {selectedViewTrip.checkInBagCapacity} KG remaining
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${checkInPercentage}%` }}
                          />
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Used: {checkInUsed.toFixed(1)} KG ({checkInPercentage.toFixed(0)}%)
                        </p>
                      </div>
                    </div>

                    {/* Flight Ticket Photo */}
                    {selectedViewTrip.ticketPhoto && selectedViewTrip.ticketPhoto !== 'pending' && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                          <Eye className="h-4.5 w-4.5 text-[#0B3A8E]" />
                          Flight Ticket Document
                        </h4>
                        <div className="relative group overflow-hidden border border-slate-200 rounded-xl bg-slate-900 flex items-center justify-center max-h-64 w-full">
                          <Image
                            src={toRelativeImageUrl(selectedViewTrip.ticketPhoto)}
                            alt="Flight Ticket"
                            className="object-contain max-h-64 w-full transition-all group-hover:scale-102"
                            fill
                          />
                          <a
                            href={selectedViewTrip.ticketPhoto}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-sm gap-2"
                          >
                            <Eye className="h-5 w-5" />
                            View Full Screen
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="border-t border-slate-100 pt-4">
                    <Button
                      className="bg-[#0B3A8E] hover:bg-[#082a66] text-white font-semibold rounded-xl w-full sm:w-auto"
                      onClick={() => setSelectedViewTrip(null)}
                    >
                      Close Details
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
