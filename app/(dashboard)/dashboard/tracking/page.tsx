'use client';

import { useState, useMemo, useReducer, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Crosshair,
  Mail,
  MoreHorizontal,
  Plane,
  Search,
  ArrowUpDown,
  X,
  Package,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
} from 'lucide-react';
import { getShipments, type Shipment } from '@/services/shipment.service';
import { useMyTrips } from '@/hooks/use-trips';
import type { Trip } from '@/services/trip.service';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';

// --- Types & Constants (mirrored from my-shipments) ---

type ShipmentStatus = 'AWAITING_MATCH' | 'ACTIVE' | 'DELIVERED' | 'CANCELED';

const STATUS_DISPLAY_MAP: Record<string, string> = {
  AWAITING_MATCH: 'Awaiting match',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  CANCELED: 'Canceled',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  AWAITING_MATCH: 'bg-amber-50 text-amber-700 border-amber-100',
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-100',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CANCELED: 'bg-slate-50 text-slate-500 border-slate-200',
};

const TRIP_STATUS_DISPLAY_MAP: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

const TRIP_STATUS_BADGE_CLASS: Record<string, string> = {
  ACTIVE: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CANCELLED: 'bg-red-50 text-red-700 border-red-100',
  REJECTED: 'bg-slate-50 text-slate-500 border-slate-200',
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ROWS_PER_PAGE = 10;

// --- Filter state ---

type FiltersState = {
  page: number;
  search: string;
  status: string | undefined;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type FiltersAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_STATUS'; status: string | undefined }
  | { type: 'SET_LIMIT'; limit: number }
  | { type: 'SET_SORT'; sortBy: string; sortOrder: 'asc' | 'desc' };

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.page };
    case 'SET_SEARCH':
      return { ...state, page: 1, search: action.search };
    case 'SET_STATUS':
      return { ...state, page: 1, status: action.status };
    case 'SET_LIMIT':
      return { ...state, page: 1, limit: action.limit };
    case 'SET_SORT':
      return { ...state, page: 1, sortBy: action.sortBy, sortOrder: action.sortOrder };
  }
}

// --- Helpers ---

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function generatePageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  if (currentPage > 3) pages.push('...');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

const MOCK_ASSIGNEES: Record<string, { name: string; avatar?: string }> = {
  'SH-2345': { name: 'Ahmed Khan' },
  'SH-2654': { name: 'Jerry Daniel' },
  'SH-2654-2': { name: 'Harry Styles' },
  'BG-4371': { name: 'Dua Lipa' },
  'GL-1123': { name: 'Ed Sheeran' },
  'KT-9812': { name: 'Ariana Grande' },
  'RG-3005': { name: 'Billie Eilish' },
};

// --- Component ---

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState<'shipment' | 'trip'>('shipment');
  const [trackId, setTrackId] = useState('');

  // --- Shipment Filters & Queries ---
  const [filters, dispatch] = useReducer(filtersReducer, {
    page: 1,
    search: '',
    status: undefined,
    limit: DEFAULT_ROWS_PER_PAGE,
    sortBy: 'itemName',
    sortOrder: 'asc' as const,
  });
  const [customRowsInput, setCustomRowsInput] = useState('');

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: [
      'shipments',
      {
        page: filters.page,
        limit: filters.limit,
        search: debouncedSearch,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    ],
    queryFn: () =>
      getShipments({
        page: filters.page,
        limit: filters.limit,
        search: debouncedSearch || undefined,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
  });

  const shipments: Shipment[] = apiResponse?.data ?? [];
  const meta = apiResponse?.meta ?? { page: 1, limit: DEFAULT_ROWS_PER_PAGE, total: 0 };
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch({ type: 'SET_SORT', sortBy: field, sortOrder: newOrder });
  };

  const sortIndicator = (field: string) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleRowsPerPageChange = (value: string) => {
    if (value === 'custom') {
      setCustomRowsInput('');
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      dispatch({ type: 'SET_LIMIT', limit: num });
      setCustomRowsInput('');
    }
  };

  const handleCustomRowsSubmit = () => {
    const num = Number(customRowsInput);
    if (!isNaN(num) && num > 0) {
      dispatch({ type: 'SET_LIMIT', limit: num });
    }
  };

  const pageNumbers = useMemo(
    () => generatePageNumbers(meta.page, totalPages),
    [meta.page, totalPages]
  );

  const showingFrom = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const showingTo = Math.min(meta.page * meta.limit, meta.total);

  // --- Trip State & Queries ---
  const [tripSearch, setTripSearch] = useState('');
  const debouncedTripSearch = useDebouncedValue(tripSearch, 300);

  const [tripSortBy, setTripSortBy] = useState<'flightNumber' | 'flightDate' | 'createdAt'>('flightDate');
  const [tripSortOrder, setTripSortOrder] = useState<'asc' | 'desc'>('desc');

  const [tripPage, setTripPage] = useState(1);
  const [tripLimit, setTripLimit] = useState(DEFAULT_ROWS_PER_PAGE);

  const { data: tripsResponse, isLoading: isTripsLoading } = useMyTrips();
  const rawTrips: Trip[] = tripsResponse?.data ?? [];

  // Client-side filtering & sorting for trips
  const filteredTrips = useMemo(() => {
    let result = [...rawTrips];

    if (debouncedTripSearch.trim()) {
      const query = debouncedTripSearch.toLowerCase();
      const cleanQuery = query.replace(/^(tr|sh)-?/, "");
      result = result.filter((trip) => {
        const fromName = getCountryByCode(trip.fromCountry)?.name.toLowerCase() || '';
        const toName = getCountryByCode(trip.toCountry)?.name.toLowerCase() || '';
        const flightNum = trip.flightNumber.toLowerCase();
        const tripId = trip.id.toLowerCase();
        const tripShortId = trip.id.slice(-6).toLowerCase();

        return (
          fromName.includes(query) ||
          toName.includes(query) ||
          flightNum.includes(query) ||
          tripId.includes(cleanQuery) ||
          tripShortId.includes(cleanQuery)
        );
      });
    }

    result.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valA: any = a[tripSortBy];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valB: any = b[tripSortBy];

      if (tripSortBy === 'flightDate' || tripSortBy === 'createdAt') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return tripSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return tripSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [rawTrips, debouncedTripSearch, tripSortBy, tripSortOrder]);

  const totalTrips = filteredTrips.length;
  const tripTotalPages = Math.max(1, Math.ceil(totalTrips / tripLimit));

  useEffect(() => {
    if (tripPage > tripTotalPages) {
      setTripPage(1);
    }
  }, [tripTotalPages, tripPage]);

  const paginatedTrips = useMemo(() => {
    const start = (tripPage - 1) * tripLimit;
    const end = start + tripLimit;
    return filteredTrips.slice(start, end);
  }, [filteredTrips, tripPage, tripLimit]);

  const tripShowingFrom = totalTrips === 0 ? 0 : (tripPage - 1) * tripLimit + 1;
  const tripShowingTo = Math.min(tripPage * tripLimit, totalTrips);

  const tripPageNumbers = useMemo(
    () => generatePageNumbers(tripPage, tripTotalPages),
    [tripPage, tripTotalPages]
  );

  const handleTripSort = (field: 'flightNumber' | 'flightDate' | 'createdAt') => {
    const newOrder = tripSortBy === field && tripSortOrder === 'asc' ? 'desc' : 'asc';
    setTripSortBy(field);
    setTripSortOrder(newOrder);
  };

  const tripSortIndicator = (field: 'flightNumber' | 'flightDate' | 'createdAt') => {
    if (tripSortBy !== field) return null;
    return tripSortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // --- Top Search Lookup Logic ---
  const handleTrackSubmit = () => {
    if (!trackId.trim()) return;

    const formattedId = trackId.trim().toUpperCase();
    const cleanId = formattedId.replace(/^(SH|TR)-?/, "");

    // Check if the cleanId matches any of the user's trips
    const hasTripMatch = rawTrips.some((trip) => {
      const tripShortId = trip.id.slice(-6).toUpperCase();
      const tripFullId = trip.id.toUpperCase();
      return tripShortId.includes(cleanId) || tripFullId.includes(cleanId);
    });

    const isTrip = hasTripMatch || formattedId.startsWith('TR');

    if (isTrip) {
      setActiveTab('trip');
      setTripSearch(trackId.trim());
    } else {
      setActiveTab('shipment');
      dispatch({ type: 'SET_SEARCH', search: trackId.trim() });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Track your consignment header */}
      <div className="relative rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D307A]/10 text-[#0D307A]">
              <Crosshair className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Track your consignment</h1>
              <p className="text-sm text-slate-500">
                Use your shipment or trip id to track them in real-time.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-80">
            <label className="text-xs font-semibold text-slate-700">
              Shipment/trip ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your shipment/trip ID"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTrackSubmit();
                }}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-12 text-sm transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
              />
              <button
                type="button"
                onClick={handleTrackSubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md bg-[#0D307A] text-white hover:bg-[#092E72] transition-colors"
                aria-label="Track"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consignment History */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        {/* Title and Controls Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <h3 className="text-xl text-muted-foreground tracking-tight">Consignment History</h3>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'shipment' ? 'Search shipment' : 'Search trip'}
                value={activeTab === 'shipment' ? filters.search : tripSearch}
                onChange={(e) => {
                  if (activeTab === 'shipment') {
                    dispatch({ type: 'SET_SEARCH', search: e.target.value });
                  } else {
                    setTripSearch(e.target.value);
                  }
                }}
                className="h-9 w-full sm:w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
              />
              {(activeTab === 'shipment' ? filters.search : tripSearch) && (
                <button
                  onClick={() => {
                    if (activeTab === 'shipment') {
                      dispatch({ type: 'SET_SEARCH', search: '' });
                    } else {
                      setTripSearch('');
                    }
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter button */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-slate-200 text-slate-500 hover:text-slate-700 bg-white"
            >
              <Crosshair className="h-4 w-4" />
            </Button>

            {/* Export/sort button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-slate-200 text-slate-500 hover:text-slate-700 bg-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {activeTab === 'shipment' ? (
                  <>
                    <DropdownMenuItem onClick={() => handleSort('itemName')}>
                      Sort by Name{sortIndicator('itemName')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('pricePerKg')}>
                      Sort by Price{sortIndicator('pricePerKg')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                      Sort by Date{sortIndicator('createdAt')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('weight')}>
                      Sort by Weight{sortIndicator('weight')}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => handleTripSort('flightNumber')}>
                      Sort by Flight Number{tripSortIndicator('flightNumber')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTripSort('flightDate')}>
                      Sort by Flight Date{tripSortIndicator('flightDate')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTripSort('createdAt')}>
                      Sort by Date Created{tripSortIndicator('createdAt')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('shipment')}
            className={`text-xs font-semibold px-5 py-2 rounded-full border transition-all ${
              activeTab === 'shipment'
                ? 'bg-[#0D307A]/10 text-[#0D307A] border-transparent'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Shipment
          </button>
          <button
            onClick={() => setActiveTab('trip')}
            className={`text-xs font-semibold px-5 py-2 rounded-full border transition-all ${
              activeTab === 'trip'
                ? 'bg-[#0D307A]/10 text-[#0D307A] border-transparent'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Trip
          </button>
        </div>

        {/* Table */}
        {activeTab === 'shipment' ? (
          isLoading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 h-16 w-full bg-slate-50 animate-pulse rounded-lg px-4"
                />
              ))}
            </div>
          ) : shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Package className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-500">No shipments found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try resetting your search query or creating a new shipment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4 font-semibold">Shipment name & ID</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Route</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Assigned to</th>
                    <th className="px-5 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {shipments.map((item) => {
                    const status = item.status as ShipmentStatus;
                    const statusClass =
                      STATUS_BADGE_CLASS[status] || STATUS_BADGE_CLASS['AWAITING_MATCH'];
                    const displayStatus = STATUS_DISPLAY_MAP[status] || status;
                    const shortId = `SH-${item.id.slice(-6).toUpperCase()}`;
                    const route = `${getCountryByCode(item.fromCountry)?.name ?? item.fromCountry} - ${getCountryByCode(item.toCountry)?.name ?? item.toCountry}`;
                    const amount = item.pricePerKg * item.weight;

                    const assignee = MOCK_ASSIGNEES[shortId] ?? { name: 'N/A' };

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors duration-150"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {item.itemPhotos?.[0] ? (
                                <Image
                                  src={toRelativeImageUrl(item.itemPhotos[0])}
                                  alt={item.itemName}
                                  className="object-cover w-full h-full"
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                <Package className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#0D307A] block truncate">
                                {item.itemName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold tracking-wider block mt-0.5">
                                #{shortId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-muted-foreground font-light">{route}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-muted-foreground">
                            ${amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden">
                              {assignee.name.charAt(0)}
                            </div>
                            <span className="text-xs text-slate-600 font-medium">
                              {assignee.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {}}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-[#0D307A] hover:bg-[#0D307A]/10 transition-colors"
                              aria-label="Track"
                            >
                              <Crosshair className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {}}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              aria-label="Message"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {}}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              aria-label="More"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : isTripsLoading ? (
          <div className="space-y-4 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 h-16 w-full bg-slate-50 animate-pulse rounded-lg px-4"
              />
            ))}
          </div>
        ) : totalTrips === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Plane className="h-12 w-12 text-slate-200 mb-3 rotate-45" />
            <p className="text-sm font-medium text-slate-500">No trips found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try resetting your search query or creating a new trip.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4 font-semibold">Trip ID & Route</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Flight</th>
                  <th className="px-5 py-4 font-semibold">Total capacity</th>
                  <th className="px-5 py-4 font-semibold">Remaining capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {paginatedTrips.map((item) => {
                  const statusClass =
                    TRIP_STATUS_BADGE_CLASS[item.status] || TRIP_STATUS_BADGE_CLASS['PENDING'];
                  const displayStatus = TRIP_STATUS_DISPLAY_MAP[item.status] || item.status;
                  const shortId = `TR-${item.id.slice(-6).toUpperCase()}`;
                  const route = `${getCountryByCode(item.fromCountry)?.name ?? item.fromCountry} - ${getCountryByCode(item.toCountry)?.name ?? item.toCountry}`;
                  const totalCapacity = (item.cabinBagCapacity || 0) + (item.checkInBagCapacity || 0);
                  const remainingCapacity = (item.remainingCabinCapacity || 0) + (item.remainingCheckInCapacity || 0);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors duration-150"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                            <Plane className="h-5 w-5 text-slate-400 rotate-45" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-[#0D307A] block truncate">
                              {route}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold tracking-wider block mt-0.5">
                              #{shortId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-600 font-semibold">{item.flightNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-600 font-medium">{totalCapacity} KG</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[#0D307A]">{remainingCapacity} KG</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer - Shipment */}
        {activeTab === 'shipment' && meta.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Rows per page + custom input */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Rows per page:</span>
              <Select value={String(filters.limit)} onValueChange={handleRowsPerPageChange}>
                <SelectTrigger className="h-8 w-[70px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROWS_PER_PAGE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {(customRowsInput !== '' || !ROWS_PER_PAGE_OPTIONS.includes(filters.limit)) && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={
                      customRowsInput ||
                      (!ROWS_PER_PAGE_OPTIONS.includes(filters.limit) ? String(filters.limit) : '')
                    }
                    onChange={(e) => setCustomRowsInput(e.target.value)}
                    onBlur={handleCustomRowsSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCustomRowsSubmit();
                    }}
                    className="h-8 w-16 text-xs px-2"
                    placeholder="n"
                  />
                </div>
              )}
            </div>

            {/* Showing X-Y of Z */}
            <span className="text-xs text-slate-500">
              Showing {showingFrom}–{showingTo} of {meta.total} shipments
            </span>

            {/* Page navigation */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch({ type: 'SET_PAGE', page: 1 });
                    }}
                    aria-label="First page"
                    className={meta.page <= 1 ? 'pointer-events-none opacity-40' : ''}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (meta.page > 1) dispatch({ type: 'SET_PAGE', page: meta.page - 1 });
                    }}
                    className={meta.page <= 1 ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>
                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === meta.page}
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch({ type: 'SET_PAGE', page: p });
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (meta.page < totalPages)
                        dispatch({ type: 'SET_PAGE', page: meta.page + 1 });
                    }}
                    className={meta.page >= totalPages ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch({ type: 'SET_PAGE', page: totalPages });
                    }}
                    aria-label="Last page"
                    className={meta.page >= totalPages ? 'pointer-events-none opacity-40' : ''}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Pagination Footer - Trip */}
        {activeTab === 'trip' && totalTrips > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Rows per page */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Rows per page:</span>
              <Select value={String(tripLimit)} onValueChange={(val) => {
                const num = Number(val);
                if (!isNaN(num) && num > 0) {
                  setTripLimit(num);
                  setTripPage(1);
                }
              }}>
                <SelectTrigger className="h-8 w-[70px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROWS_PER_PAGE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Showing X-Y of Z */}
            <span className="text-xs text-slate-500">
              Showing {tripShowingFrom}–{tripShowingTo} of {totalTrips} trips
            </span>

            {/* Page navigation */}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTripPage(1);
                    }}
                    aria-label="First page"
                    className={tripPage <= 1 ? 'pointer-events-none opacity-40' : ''}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (tripPage > 1) setTripPage(tripPage - 1);
                    }}
                    className={tripPage <= 1 ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>
                {tripPageNumbers.map((p, i) =>
                  p === '...' ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === tripPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setTripPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (tripPage < tripTotalPages) setTripPage(tripPage + 1);
                    }}
                    className={tripPage >= tripTotalPages ? 'pointer-events-none opacity-40' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTripPage(tripTotalPages);
                    }}
                    aria-label="Last page"
                    className={tripPage >= tripTotalPages ? 'pointer-events-none opacity-40' : ''}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
