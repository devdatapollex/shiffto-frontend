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
import Link from 'next/link';
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
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
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
                            <Link href={`/dashboard/admin/trips/${trip.id}`} passHref legacyBehavior>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="rounded-lg h-8 cursor-pointer"
                              >
                                <a>
                                  <Eye className="mr-1.5 h-4 w-4" />
                                  See Details
                                </a>
                              </Button>
                            </Link>
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
    </RoleGuard>
  );
}
