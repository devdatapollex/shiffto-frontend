'use client';

import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Plane,
  Scale,
  Boxes,
  Calendar,
  Tag,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  X,
  Package,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getShipments, cancelShipment, type Shipment } from '@/services/shipment.service';
import { useRole } from '@/hooks/use-role';
import {
  useReceivedOffers,
  useAcceptOffer,
  useRejectOffer,
  useCancelCheckout,
} from '@/hooks/use-offers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { OffersReceivedSection } from '@/components/shipments/offers-received-section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import Image from 'next/image';

// --- Types ---

interface Traveler {
  name: string;
  avatar?: string;
  code: string;
  date: string;
  offeredPrice: number;
}

interface Offer {
  id: string;
  timeRemaining: string;
  timeColor: 'red' | 'yellow' | 'green';
  itemName: string;
  itemImage?: string;
  fromCountry: string;
  toCountry: string;
  weight: number;
  quantity: number;
  price: number;
  traveler: Traveler;
}

// --- Constants ---

const STATUS_TABS = [
  { label: 'All', value: undefined },
  { label: 'Awaiting match', value: 'AWAITING_MATCH' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Canceled', value: 'CANCELED' },
] as const;

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

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ROWS_PER_PAGE = 10;

// --- Filter reducer ---

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

// --- Component ---

export default function MyShipmentsPage() {
  const router = useRouter();
  const { isAdmin } = useRole();
  const queryClient = useQueryClient();

  const [shipmentToCancel, setShipmentToCancel] = useState<Shipment | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelShipment(id),
    onSuccess: () => {
      toast.success('Shipment canceled successfully');
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setShipmentToCancel(null);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to cancel shipment';
      toast.error(message);
    },
  });

  // --- Backend-driven state ---
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

  // --- Fetch from backend ---
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

  // --- Sort helpers ---
  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch({ type: 'SET_SORT', sortBy: field, sortOrder: newOrder });
  };

  const sortIndicator = (field: string) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // --- Rows per page handler ---
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

  // --- Pagination range ---
  const pageNumbers = useMemo(
    () => generatePageNumbers(meta.page, totalPages),
    [meta.page, totalPages]
  );

  const showingFrom = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const showingTo = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* 1. OFFERS RECEIVED SECTION */}
      <OffersReceivedSection layoutMode="grid" />

      {/* 2. SHIPMENT HISTORY SECTION */}
      <div className="bg-white rounded-lg border border-slate-100 p-6 shadow-sm space-y-6">
        {/* Title and Controls Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <h3 className="text-xl text-muted-foreground tracking-tight">Shipment History</h3>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={filters.search}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', search: e.target.value })}
                className="h-9 w-full sm:w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
              />
              {filters.search && (
                <button
                  onClick={() => dispatch({ type: 'SET_SEARCH', search: '' })}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-slate-200 text-foreground! hover:text-foreground! bg-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = filters.status === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => dispatch({ type: 'SET_STATUS', status: tab.value })}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0D307A]/10 text-[#0D307A] border-transparent'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Shipments Table */}
        {isLoading ? (
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
          <div className="overflow-x-auto rounded-lg border border-slate-100">
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
                  const statusClass =
                    STATUS_BADGE_CLASS[item.status] || STATUS_BADGE_CLASS['AWAITING_MATCH'];
                  const displayStatus = STATUS_DISPLAY_MAP[item.status] || item.status;
                  const shortId = `SH-${item.id.slice(-6).toUpperCase()}`;
                  const route = `${getCountryByCode(item.fromCountry)?.name ?? item.fromCountry} - ${getCountryByCode(item.toCountry)?.name ?? item.toCountry}`;
                  const amount = item.pricePerKg * item.weight;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer"
                      onClick={() => router.push(`/dashboard/tracking/shipment/${item.id}`)}
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
                            <span className="font-semibold text-foreground block truncate">
                              {item.itemName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold tracking-wider block mt-0.5">
                              #{shortId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
                          >
                            {displayStatus}
                          </span>
                          {item.status === 'CANCELED' && item.paymentTransaction && (
                            <>
                              {item.paymentTransaction.status === 'PENDING_REFUND' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                  <RotateCcw className="h-3 w-3 animate-spin text-rose-600" />
                                  Refund Pending
                                </span>
                              )}
                              {item.paymentTransaction.status === 'REFUNDED' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3 text-purple-600" />
                                  Refunded {item.paymentTransaction.refundTxnId ? `(#${item.paymentTransaction.refundTxnId})` : ''}
                                </span>
                              )}
                            </>
                          )}
                        </div>
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
                        <span className="text-xs text-slate-400 font-medium">N/A</span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4.5 w-4.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/tracking/shipment/${item.id}`)
                                }
                              >
                                View details
                              </DropdownMenuItem>
                              {(item.status === 'AWAITING_MATCH' || item.status === 'ACTIVE') && (
                                <DropdownMenuItem
                                  className="text-destructive font-medium focus:bg-primary focus:text-white cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShipmentToCancel(item);
                                  }}
                                >
                                  Cancel shipment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.total > 0 && (
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
              {customRowsInput !== '' || !ROWS_PER_PAGE_OPTIONS.includes(filters.limit) ? (
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
              ) : null}
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
      </div>

      {/* Cancel Shipment Confirmation Dialog */}
      <Dialog open={!!shipmentToCancel} onOpenChange={(open) => !open && setShipmentToCancel(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive font-semibold text-lg">Cancel Shipment</DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-1">
              Are you sure you want to cancel &quot;<span className="font-semibold text-slate-900">{shipmentToCancel?.itemName}</span>&quot;?
              {shipmentToCancel?.status === 'ACTIVE' && (
                <span className="block mt-2 font-medium text-slate-700 bg-amber-50 p-2.5 rounded-md border border-amber-200/60 text-xs">
                  Since this shipment is active, any payment held in escrow will automatically be queued for a refund payout by the admin.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShipmentToCancel(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Shipment
            </Button>
            <Button
              variant="destructive"
              onClick={() => shipmentToCancel && cancelMutation.mutate(shipmentToCancel.id)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Canceling...' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
