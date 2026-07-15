'use client';

import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { getShipments, type Shipment } from '@/services/shipment.service';
import { useRole } from '@/hooks/use-role';
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
import { ShipmentDetailsModal } from '@/components/shipments/shipment-details-modal';
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
  const { isAdmin } = useRole();
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  // --- Offers (mock data, unchanged) ---
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 'offer-1',
      timeRemaining: '08:45',
      timeColor: 'red',
      itemName: 'Apple Airpods Pro (Gen 2)',
      itemImage:
        'https://images.unsplash.com/photo-1588449668338-d1f33b5c40d1?w=200&auto=format&fit=crop&q=60',
      fromCountry: 'BD',
      toCountry: 'CN',
      weight: 0.3,
      quantity: 2,
      price: 60,
      traveler: {
        name: 'Ahmed Khan',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
        code: 'BG 0306',
        date: '30 June, 2026',
        offeredPrice: 50,
      },
    },
    {
      id: 'offer-2',
      timeRemaining: '21:12',
      timeColor: 'yellow',
      itemName: 'Samsung Galaxy S25',
      itemImage:
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=60',
      fromCountry: 'VN',
      toCountry: 'US',
      weight: 0.2,
      quantity: 1,
      price: 70,
      traveler: {
        name: 'Lisa Tran',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
        code: 'BG 0307',
        date: '15 July, 2025',
        offeredPrice: 65,
      },
    },
    {
      id: 'offer-3',
      timeRemaining: '29:16',
      timeColor: 'green',
      itemName: 'Nike Jordan Shoe',
      itemImage:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=60',
      fromCountry: 'JP',
      toCountry: 'CA',
      weight: 0.3,
      quantity: 1,
      price: 80,
      traveler: {
        name: 'John Doe',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
        code: 'BG 0308',
        date: '22 August, 2026',
        offeredPrice: 75,
      },
    },
  ]);

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

  // --- Offer actions ---
  const handleAcceptOffer = (offer: Offer) => {
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    toast.success(
      `You accepted the offer from ${offer.traveler.name} for $${offer.traveler.offeredPrice}!`
    );
  };

  const handleRejectOffer = (offer: Offer) => {
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    toast.info(`Offer from ${offer.traveler.name} declined.`);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* 1. OFFERS RECEIVED SECTION */}
      <div className="space-y-4 bg-background p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-xl text-muted-foreground tracking-tight">Offers received</h2>
          <Badge className="bg-primary text-white font-bold h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
            {offers.length}
          </Badge>
        </div>

        <AnimatePresence mode="popLayout">
          {offers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-slate-100 bg-white shadow-sm text-center"
            >
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">
                No pending offers for your shipments right now.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => {
                const timeColorClass =
                  offer.timeColor === 'red'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : offer.timeColor === 'yellow'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100';

                return (
                  <motion.div
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${timeColorClass}`}
                        >
                          <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                          {offer.timeRemaining}
                        </span>
                        <span className="text-lg font-bold text-[#0B3A8E]">${offer.price}</span>
                      </div>

                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {offer.itemImage ? (
                            <Image
                              src={offer.itemImage}
                              alt={offer.itemName}
                              className="object-cover w-full h-full"
                              width={56}
                              height={56}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 truncate">
                            {offer.itemName}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Plane className="h-3.5 w-3.5 text-slate-400 rotate-45 shrink-0" />
                            {getCountryByCode(offer.fromCountry)?.name ?? offer.fromCountry} -{' '}
                            {getCountryByCode(offer.toCountry)?.name ?? offer.toCountry}
                          </p>
                          <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium pt-0.5">
                            <span className="flex items-center gap-1">
                              <Scale className="h-3 w-3 shrink-0" />
                              {offer.weight} Kg
                            </span>
                            <span className="flex items-center gap-1">
                              <Boxes className="h-3 w-3 shrink-0" />
                              {offer.quantity}pcs
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {offer.traveler.avatar ? (
                              <Image
                                src={offer.traveler.avatar}
                                alt={offer.traveler.name}
                                className="object-cover w-full h-full"
                                width={56}
                                height={56}
                              />
                            ) : (
                              <span>{offer.traveler.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800 truncate">
                              {offer.traveler.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                <Tag className="h-2.5 w-2.5 shrink-0" />
                                {offer.traveler.code}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5 shrink-0" />
                                {offer.traveler.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right pl-2 shrink-0">
                          <span className="text-sm font-bold text-[#0D307A] block">
                            ${offer.traveler.offeredPrice}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Offered price
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectOffer(offer)}
                        className="flex-1 bg-background border-slate-200 text-foreground hover:bg-slate-50 font-semibold"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptOffer(offer)}
                        className="flex-1 bg-[#0B3A8E] hover:bg-[#092E72] text-white font-semibold shadow-sm"
                      >
                        Accept
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. SHIPMENT HISTORY SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
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
                  className="h-9 w-9 rounded-lg border-slate-200 text-slate-500 hover:text-slate-700 bg-white"
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
                  const statusClass =
                    STATUS_BADGE_CLASS[item.status] || STATUS_BADGE_CLASS['AWAITING_MATCH'];
                  const displayStatus = STATUS_DISPLAY_MAP[item.status] || item.status;
                  const shortId = `SH-${item.id.slice(-6).toUpperCase()}`;
                  const route = `${getCountryByCode(item.fromCountry)?.name ?? item.fromCountry} - ${getCountryByCode(item.toCountry)?.name ?? item.toCountry}`;
                  const amount = item.pricePerKg * item.weight;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors duration-150"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                            {item.itemPhotos?.[0] ? (
                              <img
                                src={item.itemPhotos[0]}
                                alt={item.itemName}
                                className="object-cover w-full h-full"
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
                        <span className="text-xs text-slate-400 font-medium">N/A</span>
                      </td>
                      <td className="px-5 py-4 text-right">
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
                              <DropdownMenuItem onClick={() => setSelectedShipmentId(item.id)}>
                                View details
                              </DropdownMenuItem>
                              {item.status === 'AWAITING_MATCH' && (
                                <DropdownMenuItem className="text-destructive">
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

      <ShipmentDetailsModal
        shipmentId={selectedShipmentId}
        open={selectedShipmentId !== null}
        onOpenChange={(open) => !open && setSelectedShipmentId(null)}
      />
    </div>
  );
}
