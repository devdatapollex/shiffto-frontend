'use client';

import { useState } from 'react';
import { useMyTrips, useCancelTrip, useCompleteTrip, useAcceptShipment } from '@/hooks/use-trips';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { getCountryByCode } from '@/lib/constants/countries';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import type { Shipment } from '@/services/shipment.service';
import type { Trip } from '@/services/trip.service';

export default function MyTripsPage() {
  // Tabs and search states
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog states
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [acceptingTripId, setAcceptingTripId] = useState<string>('');
  const [bagType, setBagType] = useState<'cabin' | 'checkIn'>('checkIn');

  // React Query data fetching
  const { data: tripsData, isLoading: tripsLoading } = useMyTrips();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useAvailableShipments();

  // Mutations
  const cancelTripMutation = useCancelTrip();
  const completeTripMutation = useCompleteTrip();
  const acceptShipmentMutation = useAcceptShipment();

  // Helper lists
  const trips: Trip[] = tripsData?.data || [];
  const availableShipments: Shipment[] = shipmentsData?.data || [];

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
      const tripId = `tr-${trip.id.slice(0, 4)}`.toLowerCase();

      return fromName.includes(query) || toName.includes(query) || flightNum.includes(query) || tripId.includes(query);
    }

    return true;
  });

  const handleCancelTrip = async (id: string) => {
    try {
      await cancelTripMutation.mutateAsync(id);
      toast.success('Trip cancelled successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel trip');
    }
  };

  const handleCompleteTrip = async (id: string) => {
    try {
      await completeTripMutation.mutateAsync(id);
      toast.success('Trip completed successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete trip');
    }
  };

  const handleOpenAcceptDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    if (activeTrips.length > 0) {
      setAcceptingTripId(activeTrips[0].id);
    } else {
      setAcceptingTripId('');
    }
    setBagType('checkIn');
  };

  const handleAcceptShipmentSubmit = async () => {
    if (!selectedShipment || !acceptingTripId) return;

    try {
      await acceptShipmentMutation.mutateAsync({
        tripId: acceptingTripId,
        payload: {
          shipmentId: selectedShipment.id,
          bagType,
        },
      });
      toast.success('Shipment accepted for your trip!');
      setSelectedShipment(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept shipment');
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-[#EEF2FF] hover:bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FF] font-medium px-2.5 py-0.5 rounded-full">Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-[#FFFBEB] hover:bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7] font-medium px-2.5 py-0.5 rounded-full">Pending</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-[#ECFDF5] hover:bg-[#ECFDF5] text-[#059669] border-[#D1FAE5] font-medium px-2.5 py-0.5 rounded-full">Completed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-[#FEF2F2] hover:bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2] font-medium px-2.5 py-0.5 rounded-full">Cancelled</Badge>;
      case 'REJECTED':
        return <Badge className="bg-[#F3F4F6] hover:bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB] font-medium px-2.5 py-0.5 rounded-full">Rejected</Badge>;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableShipments.map((shipment, index) => {
              const clockBadge = getClockBadge(index);
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
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${clockBadge.class}`}>
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
                          <img
                            src={shipment.itemPhotos[0]}
                            alt={shipment.itemName}
                            className="h-full w-full object-cover"
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
                        onClick={() => toast.info('Counter feature is coming soon!')}
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
        )}
      </div>

      {/* 2. Trips History section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#0B3A8E] tracking-tight">Trips History</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
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
            <Button variant="outline" size="icon" className="border-[#e2e8f0] h-10 w-10 rounded-xl text-slate-600">
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </Button>
            <Button variant="outline" size="icon" className="border-[#e2e8f0] h-10 w-10 rounded-xl text-slate-600">
              <ArrowUpDown className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>

        {tripsLoading ? (
          <div className="border border-[#e2e8f0] rounded-2xl bg-white p-6 space-y-4 animate-pulse">
            <div className="h-8 bg-slate-100 rounded w-1/3" />
            <div className="h-20 bg-slate-100 rounded" />
            <div className="h-20 bg-slate-100 rounded" />
          </div>
        ) : filteredTrips.length === 0 ? (
          <Card className="border border-dashed border-[#e2e8f0] p-12 text-center text-slate-500 bg-white rounded-2xl">
            <Plane className="h-12 w-12 text-slate-300 mx-auto mb-3 stroke-[1.2]" />
            <p className="text-base font-medium">No trips history found.</p>
            <p className="text-sm text-slate-400 mt-1">Try creating a new trip or modifying your search.</p>
          </Card>
        ) : (
          <div className="border border-[#e2e8f0] rounded-2xl bg-white overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-55/40 border-b border-[#e2e8f0]">
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
                {filteredTrips.map((trip) => {
                  const fromCountry = getCountryByCode(trip.fromCountry);
                  const toCountry = getCountryByCode(trip.toCountry);
                  const tripIdLabel = `#TR-${trip.id.slice(0, 4).toUpperCase()}`;

                  const totalCap = (trip.cabinBagCapacity || 0) + (trip.checkInBagCapacity || 0);
                  const remCap = (trip.remainingCabinCapacity || 0) + (trip.remainingCheckInCapacity || 0);

                  return (
                    <TableRow key={trip.id} className="hover:bg-slate-50/50 border-b border-[#e2e8f0]/60 last:border-0 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-slate-400 font-semibold">{tripIdLabel}</span>
                          <span className="text-[#0B3A8E] font-bold text-sm md:text-base">
                            {fromCountry?.name} - {toCountry?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {renderStatusBadge(trip.status)}
                      </TableCell>
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
                            onClick={() => toast.info(`Viewing details for trip ${tripIdLabel}`)}
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
                            <DropdownMenuContent align="end" className="w-44 rounded-xl border-[#e2e8f0] p-1">
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
                                onClick={() => toast.info('Additional trip configurations coming soon!')}
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
      </div>

      {/* 3. Accept Shipment Coord Dialog */}
      <Dialog open={selectedShipment !== null} onOpenChange={(open) => !open && setSelectedShipment(null)}>
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

          {activeTrips.length === 0 ? (
            <div className="py-4 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active trips found</p>
              <p className="text-xs text-slate-400">
                You must have an approved, ACTIVE trip with route matching the shipment to accept it.
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
                  Required capacity: <strong className="text-slate-800">{selectedShipment?.weight} KG</strong>
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
                    {activeTrips.map((t) => {
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
                <Select value={bagType} onValueChange={(val: any) => setBagType(val)}>
                  <SelectTrigger className="w-full rounded-xl border-[#e2e8f0] h-11 bg-white">
                    <SelectValue placeholder="Choose bag slot" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#e2e8f0]">
                    <SelectItem value="checkIn" className="cursor-pointer">Check-in luggage</SelectItem>
                    <SelectItem value="cabin" className="cursor-pointer">Cabin luggage</SelectItem>
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
              disabled={activeTrips.length === 0 || acceptShipmentMutation.isPending}
              className="bg-[#0B3A8E] hover:bg-[#082a66] text-white font-semibold rounded-xl"
              onClick={handleAcceptShipmentSubmit}
            >
              {acceptShipmentMutation.isPending ? 'Accepting...' : 'Accept Shipment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
