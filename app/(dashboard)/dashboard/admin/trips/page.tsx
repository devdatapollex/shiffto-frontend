'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Check,
  X,
  Plane,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RoleGuard } from '@/components/auth/role-guard';
import { getCountryByCode } from '@/lib/constants/countries';
import { useAllTrips, useVerifyTrip } from '@/hooks/use-trips';
import type { Trip } from '@/services/trip.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminTripsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Detail Dialog State
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Reject Reason Dialog State
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Ticket Preview modal state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data: tripsResponse, isLoading: tripsLoading } = useAllTrips({
    page,
    limit,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    searchTerm: debouncedSearch.trim() || undefined,
  });

  const verifyTripMutation = useVerifyTrip();

  const trips = tripsResponse?.data || [];
  const total = tripsResponse?.meta?.total || 0;

  // Pagination calculations
  const startIdx = (page - 1) * limit;
  const endIdx = Math.min(startIdx + limit, total);
  const totalPages = Math.ceil(total / limit) || 1;

  const handleApprove = async (tripId: string) => {
    try {
      await verifyTripMutation.mutateAsync({
        id: tripId,
        payload: { approved: true },
      });
      toast.success('Trip approved successfully!');
      setShowDetailDialog(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to approve trip');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedTrip) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await verifyTripMutation.mutateAsync({
        id: selectedTrip.id,
        payload: { approved: false, rejectionReason },
      });
      toast.success('Trip rejected successfully');
      setShowRejectDialog(false);
      setShowDetailDialog(false);
      setRejectionReason('');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to reject trip');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600 border border-orange-200">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 border border-blue-200">
            <Check className="h-3 w-3" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-200">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 border border-red-200">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const formatTime12h = (time24?: string | null) => {
    if (!time24) return 'N/A';
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mStr} ${suffix}`;
  };

  return (
    <RoleGuard
      roles={['admin']}
      fallback={
        <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B3A8E]">Manage Trips</h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, or reject user flight trip ticket uploads and details.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-muted/60 p-1 flex flex-wrap h-auto gap-1">
              <TabsTrigger value="PENDING" className="flex items-center gap-1.5 py-1.5 px-3">
                <Clock className="h-4 w-4 text-orange-500" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="ACTIVE" className="flex items-center gap-1.5 py-1.5 px-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Active
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="flex items-center gap-1.5 py-1.5 px-3">
                <Check className="h-4 w-4 text-blue-600" />
                Completed
              </TabsTrigger>
              <TabsTrigger value="REJECTED" className="flex items-center gap-1.5 py-1.5 px-3">
                <XCircle className="h-4 w-4 text-destructive" />
                Rejected
              </TabsTrigger>
              <TabsTrigger value="ALL" className="flex items-center gap-1.5 py-1.5 px-3">
                All Trips
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by ID, User, Flight..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-slate-200 focus-visible:ring-[#0B3A8E] focus-visible:border-[#0B3A8E] rounded-xl"
            />
          </div>
        </div>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">
              {statusFilter === 'PENDING' && 'Pending Verification'}
              {statusFilter === 'ACTIVE' && 'Active Flight Trips'}
              {statusFilter === 'COMPLETED' && 'Completed Trips'}
              {statusFilter === 'REJECTED' && 'Rejected Trips'}
              {statusFilter === 'ALL' && 'All Trips System Registry'}
            </CardTitle>
            <CardDescription>
              Displaying user-uploaded flight tickets waiting for validation or active in matching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tripsLoading ? (
              <div className="flex h-48 w-full flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading flight trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg">
                <Plane className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No trips found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  There are no trips matching the selected criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trip ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Flight Date</TableHead>
                      <TableHead>Flight No.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip: Trip) => {
                      const fromCountry = getCountryByCode(trip.fromCountry);
                      const toCountry = getCountryByCode(trip.toCountry);
                      const shortId = `#TR-${trip.id.slice(-4).toUpperCase()}`;

                      return (
                        <TableRow key={trip.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono text-xs font-semibold text-slate-500">
                            {shortId}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">
                                {trip.user?.name}
                              </span>
                              <span className="text-xs text-slate-500">{trip.user?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            {fromCountry?.name} → {toCountry?.name}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {new Date(trip.flightDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-600 text-sm">
                            {trip.flightNumber}
                          </TableCell>
                          <TableCell>{renderStatusBadge(trip.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg h-8 cursor-pointer"
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="mr-1.5 h-4 w-4" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {!tripsLoading && trips.length > 0 && (
              <div className="border-t border-[#e2e8f0]/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
                {/* Left: Entries selector and showing info */}
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <Select
                      value={limit.toString()}
                      onValueChange={(val) => {
                        setLimit(Number(val));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-16 rounded-lg border-[#e2e8f0] bg-white text-xs">
                        <SelectValue placeholder="10" />
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
                      {total === 0 ? 0 : startIdx + 1}
                    </span>{' '}
                    to <span className="font-semibold text-slate-700">{endIdx}</span> of{' '}
                    <span className="font-semibold text-slate-700">{total}</span> entries
                  </span>
                </div>

                {/* Right: Page buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="h-8 rounded-lg border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600 px-3 cursor-pointer text-xs"
                  >
                    Previous
                  </Button>

                  {/* Render dynamic page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      totalPages > 5 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - page) > 1
                    ) {
                      if (pageNum === 2 && page > 3) {
                        return (
                          <span key="dots-left" className="px-1.5 text-slate-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      if (pageNum === totalPages - 1 && page < totalPages - 2) {
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
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold cursor-pointer ${
                          page === pageNum
                            ? 'bg-[#FF6F3F] hover:bg-[#e05626] text-white border-transparent'
                            : 'border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="h-8 rounded-lg border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600 px-3 cursor-pointer text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
          {selectedTrip &&
            (() => {
              const fromCountry = getCountryByCode(selectedTrip.fromCountry);
              const toCountry = getCountryByCode(selectedTrip.toCountry);
              const shortId = `#TR-${selectedTrip.id.slice(-4).toUpperCase()}`;

              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#0B3A8E] flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Trip Details {shortId}
                    </DialogTitle>
                    <DialogDescription>
                      Review user details and ticket verification upload.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6 py-4 grid-cols-1">
                    {/* Details Column */}
                    <div className="space-y-4">
                      <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 border-b pb-1 text-sm uppercase tracking-wide">
                          Traveler Info
                        </h4>
                        <div className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2 text-sm items-baseline">
                          <span className="text-slate-400 font-medium">Name:</span>
                          <span className="font-semibold text-slate-800 break-all">
                            {selectedTrip.user?.name}
                          </span>
                          <span className="text-slate-400 font-medium">Email:</span>
                          <span className="text-slate-700 break-all">
                            {selectedTrip.user?.email}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 border-b pb-1 text-sm uppercase tracking-wide">
                          Flight Details
                        </h4>
                        <div className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2 text-sm items-baseline">
                          <span className="text-slate-400 font-medium">Flight No:</span>
                          <span className="font-semibold text-slate-800">
                            {selectedTrip.flightNumber}
                          </span>
                          <span className="text-slate-400 font-medium">Origin:</span>
                          <span className="text-slate-800 font-semibold">
                            {fromCountry?.name} ({selectedTrip.fromCountry})
                          </span>
                          <span className="text-slate-400 font-medium">Destination:</span>
                          <span className="text-slate-800 font-semibold">
                            {toCountry?.name} ({selectedTrip.toCountry})
                          </span>
                          <span className="text-slate-400 font-medium">Departure Date:</span>
                          <span className="text-slate-800 font-semibold">
                            {new Date(selectedTrip.flightDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-slate-400 font-medium">Departure Time:</span>
                          <span className="text-slate-800 font-semibold">
                            {formatTime12h(selectedTrip.flightTime)}
                          </span>
                          <span className="text-slate-400 font-medium">Arrival Time:</span>
                          <span className="text-slate-800 font-semibold">
                            {formatTime12h(selectedTrip.airportArrivalTime)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 border-b pb-1 text-sm uppercase tracking-wide">
                          Baggage Allowance
                        </h4>
                        <div className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2 text-sm items-baseline">
                          <span className="text-slate-400 font-medium">Cabin Bag:</span>
                          <span className="font-bold text-[#0B3A8E]">
                            {selectedTrip.cabinBagCapacity} KG
                          </span>
                          <span className="text-slate-400 font-medium">Check-in Bag:</span>
                          <span className="font-bold text-[#0B3A8E]">
                            {selectedTrip.checkInBagCapacity} KG
                          </span>
                        </div>
                      </div>

                      {selectedTrip.status === 'REJECTED' && selectedTrip.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-destructive flex gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <div>
                            <div className="font-bold uppercase">Rejection Reason</div>
                            <div className="mt-0.5 font-medium">{selectedTrip.rejectionReason}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ticket Photo Column */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 border-b pb-1 text-sm uppercase tracking-wide flex justify-between items-center">
                        Uploaded Ticket Scan
                        {selectedTrip.ticketPhoto && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs p-0 text-[#FF6F3F] hover:text-[#e05626]"
                            onClick={() => setPreviewPhotoUrl(selectedTrip.ticketPhoto)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" /> View Full
                          </Button>
                        )}
                      </h4>

                      {selectedTrip.ticketPhoto ? (
                        <div className="border rounded-xl overflow-hidden bg-slate-50 p-2">
                          <div
                            className="h-64 w-full bg-contain bg-center bg-no-repeat rounded-lg border cursor-zoom-in"
                            style={{ backgroundImage: `url(${selectedTrip.ticketPhoto})` }}
                            onClick={() => setPreviewPhotoUrl(selectedTrip.ticketPhoto)}
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-xl bg-slate-50 text-slate-400 text-sm">
                          <FileText className="h-8 w-8 mb-2" />
                          No ticket file uploaded
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="gap-2 border-t pt-4">
                    <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                      Close
                    </Button>

                    {selectedTrip.status === 'PENDING' && (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => setShowRejectDialog(true)}
                          disabled={verifyTripMutation.isPending}
                        >
                          <X className="mr-1.5 h-4 w-4" /> Reject
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(selectedTrip.id)}
                          disabled={verifyTripMutation.isPending}
                        >
                          {verifyTripMutation.isPending ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-1.5 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Reject Flight Trip</DialogTitle>
            <DialogDescription>
              Provide an explanation of why this flight trip is rejected. The user will see this
              notification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="reject-reason">Reason for Rejection</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Unreadable flight ticket photo / Flight number mismatch"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={verifyTripMutation.isPending}
            >
              {verifyTripMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Preview Dialog */}
      <Dialog open={!!previewPhotoUrl} onOpenChange={(open) => !open && setPreviewPhotoUrl(null)}>
        <DialogContent className="max-w-4xl p-1 bg-black/95 border-0">
          <div className="relative flex items-center justify-center max-h-[85vh] w-full min-h-[400px]">
            {previewPhotoUrl && (
              <img
                src={previewPhotoUrl}
                alt="Flight Ticket Preview"
                className="max-h-[85vh] max-w-full object-contain rounded-lg"
              />
            )}
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white rounded-full h-8 w-8 flex items-center justify-center border border-white/20 font-bold"
            >
              ✕
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
