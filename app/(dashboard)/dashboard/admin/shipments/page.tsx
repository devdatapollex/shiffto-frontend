'use client';

import { useState, useEffect, useMemo, useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Package,
  Search,
  ArrowUpDown,
  X,
  ChevronsLeft,
  ChevronsRight,
  Tags,
  ListChecks,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Eye,
} from 'lucide-react';
import { ShipmentStepsModal } from '@/components/admin/shipment-steps-modal';
import { getShipments, type Shipment, type ShipmentCategory } from '@/services/shipment.service';
import { getStepDefinitions, type StepDefinition } from '@/services/step-definition.service';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/use-admin-categories';
import { useUpdateStepDefinition } from '@/hooks/use-step-definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { RoleGuard } from '@/components/auth/role-guard';
import apiClient from '@/lib/api-client';

// --- Tabs ---

type TabValue = 'shipments' | 'categories' | 'step-definitions';

const MAIN_TABS: { label: string; value: TabValue; icon: React.ElementType }[] = [
  { label: 'Shipments', value: 'shipments', icon: Package },
  { label: 'Categories', value: 'categories', icon: Tags },
  { label: 'Step Definitions', value: 'step-definitions', icon: ListChecks },
];

// --- Shipment Constants ---

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

// --- Step Definition Helpers ---

const STAGE_DISPLAY_MAP: Record<string, string> = {
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  PICKED_UP: 'Picked Up',
  CHECKED_IN: 'Checked In',
  IN_TRANSIT: 'In Transit',
  ARRIVED_AT_DESTINATION: 'Arrived at Destination',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

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

// --- Category Validation ---

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  maxWeight: z.coerce.number().positive().optional().nullable(),
  minPrice: z.coerce.number().positive('Minimum price is required'),
  maxPrice: z.coerce.number().positive().optional().nullable(),
  maxQuantity: z.coerce.number().int().positive().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// --- Step Definition Validation ---

const stepDefinitionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  description: z.string().nullable(),
});

type StepDefinitionFormValues = z.infer<typeof stepDefinitionSchema>;

// --- Category Payload Type ---

interface CategoryPayload {
  name: string;
  slug: string;
  maxWeight?: number | null;
  minPrice: number;
  maxPrice?: number | null;
  maxQuantity?: number | null;
}

// ============================================
// SHIPMENTS TAB
// ============================================

function ShipmentsTab() {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [filters, dispatch] = useReducer(filtersReducer, {
    page: 1,
    search: '',
    status: undefined,
    limit: DEFAULT_ROWS_PER_PAGE,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
  });
  const [customRowsInput, setCustomRowsInput] = useState('');

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: [
      'admin-shipments',
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <h3 className="text-xl text-muted-foreground tracking-tight">All Shipments</h3>

        <div className="flex flex-wrap items-center gap-2.5">
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
            Try adjusting your search or filter criteria.
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
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
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
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors duration-150">
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
                      <span className="text-xs text-slate-500 font-medium">
                        {item.category?.name ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400 font-medium">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedShipmentId(item.id)}
                        className="h-8 text-xs font-semibold text-[#0D307A] border-[#0D307A]/20 bg-[#0D307A]/5 hover:bg-[#0D307A]/10 rounded-lg"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View Steps
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Steps & Proofs Modal */}
      <ShipmentStepsModal
        shipmentId={selectedShipmentId}
        open={selectedShipmentId !== null}
        onOpenChange={(open) => !open && setSelectedShipmentId(null)}
      />

      {/* Pagination Footer */}
      {meta.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
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

          <span className="text-xs text-slate-500">
            Showing {showingFrom}–{showingTo} of {meta.total} shipments
          </span>

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
                    if (meta.page < totalPages) dispatch({ type: 'SET_PAGE', page: meta.page + 1 });
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
  );
}

// ============================================
// CATEGORIES TAB
// ============================================

function CategoriesTab() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ShipmentCategory | null>(null);

  const { data: response, isLoading } = useAdminCategories({ page, limit });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = response?.data ?? [];
  const meta = response?.meta ?? { page: 1, limit: 10, total: 0 };
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const createForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      maxWeight: null,
      minPrice: 0,
      maxPrice: null,
      maxQuantity: null,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(categorySchema),
  });

  const handleCreate = async (data: CategoryFormValues) => {
    try {
      await createMutation.mutateAsync(data as CategoryPayload);
      toast.success('Category created successfully');
      setShowCreateDialog(false);
      createForm.reset();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to create category');
    }
  };

  const handleEdit = async (data: CategoryFormValues) => {
    if (!selectedCategory) return;
    try {
      await updateMutation.mutateAsync({ id: selectedCategory.id, payload: data });
      toast.success('Category updated successfully');
      setShowEditDialog(false);
      setSelectedCategory(null);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteMutation.mutateAsync(selectedCategory.id);
      toast.success('Category deleted successfully');
      setShowDeleteDialog(false);
      setSelectedCategory(null);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to delete category');
    }
  };

  const openEditDialog = (category: ShipmentCategory) => {
    setSelectedCategory(category);
    editForm.reset({
      name: category.name,
      slug: category.slug,
      maxWeight: category.maxWeight,
      minPrice: category.minPrice,
      maxPrice: category.maxPrice,
      maxQuantity: category.maxQuantity,
    });
    setShowEditDialog(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <h3 className="text-xl text-muted-foreground tracking-tight">Shipment Categories</h3>
        <Button
          onClick={() => {
            createForm.reset();
            setShowCreateDialog(true);
          }}
          className="bg-[#0B3A8E] hover:bg-[#092E72] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-48 w-full flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Tags className="h-12 w-12 text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-500">No categories found</p>
          <p className="text-xs text-slate-400 mt-1">Create your first shipment category.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Max Weight</TableHead>
                <TableHead>Min Price</TableHead>
                <TableHead>Max Price</TableHead>
                <TableHead>Max Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-semibold">{category.name}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{category.slug}</TableCell>
                  <TableCell>{category.maxWeight ? `${category.maxWeight} kg` : '—'}</TableCell>
                  <TableCell>${category.minPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {category.maxPrice ? `$${category.maxPrice.toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell>{category.maxQuantity ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-[#0B3A8E]"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-destructive"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {meta.total > limit && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Showing {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} categories
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Create Category
            </DialogTitle>
            <DialogDescription>Add a new shipment category.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                placeholder="e.g. Electronics"
                {...createForm.register('name')}
              />
              {createForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-slug">Slug</Label>
              <Input
                id="create-slug"
                placeholder="e.g. electronics"
                {...createForm.register('slug')}
              />
              {createForm.formState.errors.slug && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.slug.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-minPrice">Min Price ($)</Label>
                <Input
                  id="create-minPrice"
                  type="number"
                  step="0.01"
                  {...createForm.register('minPrice')}
                />
                {createForm.formState.errors.minPrice && (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.minPrice.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-maxPrice">Max Price ($)</Label>
                <Input
                  id="create-maxPrice"
                  type="number"
                  step="0.01"
                  {...createForm.register('maxPrice')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-maxWeight">Max Weight (kg)</Label>
                <Input
                  id="create-maxWeight"
                  type="number"
                  step="0.01"
                  {...createForm.register('maxWeight')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-maxQuantity">Max Quantity</Label>
                <Input
                  id="create-maxQuantity"
                  type="number"
                  {...createForm.register('maxQuantity')}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0B3A8E] hover:bg-[#092E72] text-white"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Category
            </DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" placeholder="e.g. Electronics" {...editForm.register('name')} />
              {editForm.formState.errors.name && (
                <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input id="edit-slug" placeholder="e.g. electronics" {...editForm.register('slug')} />
              {editForm.formState.errors.slug && (
                <p className="text-xs text-destructive">{editForm.formState.errors.slug.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-minPrice">Min Price ($)</Label>
                <Input
                  id="edit-minPrice"
                  type="number"
                  step="0.01"
                  {...editForm.register('minPrice')}
                />
                {editForm.formState.errors.minPrice && (
                  <p className="text-xs text-destructive">
                    {editForm.formState.errors.minPrice.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxPrice">Max Price ($)</Label>
                <Input
                  id="edit-maxPrice"
                  type="number"
                  step="0.01"
                  {...editForm.register('maxPrice')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-maxWeight">Max Weight (kg)</Label>
                <Input
                  id="edit-maxWeight"
                  type="number"
                  step="0.01"
                  {...editForm.register('maxWeight')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxQuantity">Max Quantity</Label>
                <Input id="edit-maxQuantity" type="number" {...editForm.register('maxQuantity')} />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0B3A8E] hover:bg-[#092E72] text-white"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedCategory?.name}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// STEP DEFINITIONS TAB
// ============================================

function StepDefinitionsTab() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState<StepDefinition | null>(null);

  const [steps, setSteps] = useState<StepDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateMutation = useUpdateStepDefinition();

  const form = useForm<StepDefinitionFormValues>({
    resolver: zodResolver(stepDefinitionSchema),
  });

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const data = await getStepDefinitions();
        setSteps(data);
      } catch {
        toast.error('Failed to load step definitions');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSteps();
  }, []);

  const handleEdit = async (data: StepDefinitionFormValues) => {
    if (!selectedStep) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedStep.id,
        payload: {
          label: data.label,
          description: data.description || null,
        },
      });
      setSteps((prev) =>
        prev.map((s) =>
          s.id === selectedStep.id
            ? { ...s, label: data.label, description: data.description || null }
            : s
        )
      );
      toast.success('Step definition updated successfully');
      setShowEditDialog(false);
      setSelectedStep(null);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to update step definition');
    }
  };

  const openEditDialog = (step: StepDefinition) => {
    setSelectedStep(step);
    form.reset({
      label: step.label,
      description: step.description || '',
    });
    setShowEditDialog(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h3 className="text-xl text-muted-foreground tracking-tight">Step Definitions</h3>
        <p className="text-sm text-slate-400 mt-1">
          Manage the labels and descriptions for shipment tracking steps.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-48 w-full flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading step definitions...</p>
        </div>
      ) : steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <ListChecks className="h-12 w-12 text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-500">No step definitions found</p>
          <p className="text-xs text-slate-400 mt-1">
            Step definitions are created via database seed.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-400">
                      <GripVertical className="h-4 w-4" />
                      <span className="font-mono text-sm font-semibold">{step.order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      {STAGE_DISPLAY_MAP[step.stage] || step.stage}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{step.label}</TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-xs truncate">
                    {step.description || (
                      <span className="text-slate-300 italic">No description</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-[#0B3A8E]"
                      onClick={() => openEditDialog(step)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Step Definition
            </DialogTitle>
            <DialogDescription>
              Update the label and description for this tracking step.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4 py-2">
            {selectedStep && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Stage</Label>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                  {STAGE_DISPLAY_MAP[selectedStep.stage] || selectedStep.stage}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                placeholder="e.g. Payment confirmed"
                {...form.register('label')}
              />
              {form.formState.errors.label && (
                <p className="text-xs text-destructive">{form.formState.errors.label.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Optional description for this step..."
                rows={3}
                {...form.register('description')}
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0B3A8E] hover:bg-[#092E72] text-white"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function AdminShipmentsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('shipments');

  return (
    <RoleGuard
      roles={['admin']}
      fallback={
        <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
      }
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B3A8E]">Manage Shipments</h1>
          <p className="text-muted-foreground mt-1">
            View shipments, manage categories, and customize tracking steps.
          </p>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200">
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  isActive
                    ? 'border-[#0B3A8E] text-[#0B3A8E]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'shipments' && <ShipmentsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'step-definitions' && <StepDefinitionsTab />}
      </div>
    </RoleGuard>
  );
}
