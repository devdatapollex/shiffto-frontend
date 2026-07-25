'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Search,
  Copy,
  Check,
  Eye,
  Loader2,
  Package,
  Plane,
  User,
  ArrowUpDown,
  X,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { RoleGuard } from '@/components/auth/role-guard';
import {
  getAdminPayments,
  type AdminPaymentTransaction,
  type AdminPaymentsResponse,
} from '@/services/payment.service';
import { toRelativeImageUrl } from '@/lib/image-utils';

const STATUS_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Escrowed', value: 'ESCROWED' },
  { label: 'Pending Release', value: 'PENDING_RELEASE' },
  { label: 'Released', value: 'RELEASED' },
  { label: 'Refunded', value: 'REFUNDED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Pending Payment', value: 'PENDING_PAYMENT' },
] as const;

const STATUS_DISPLAY_MAP: Record<string, string> = {
  ESCROWED: 'Escrowed',
  PENDING_RELEASE: 'Pending Release',
  RELEASED: 'Released',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
  PENDING_PAYMENT: 'Pending Payment',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  ESCROWED: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_RELEASE: 'bg-blue-50 text-blue-700 border-blue-200',
  RELEASED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  PENDING_PAYMENT: 'bg-slate-50 text-slate-600 border-slate-200',
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

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

export default function AdminPaymentsPage() {
  const [data, setData] = useState<AdminPaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [customRowsInput, setCustomRowsInput] = useState('');

  // Selected Transaction for Drawer/Modal
  const [selectedTx, setSelectedTx] = useState<AdminPaymentTransaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminPayments({
        page,
        limit,
        search: search.trim() || undefined,
        status: status === 'ALL' ? undefined : status,
        sortBy,
        sortOrder,
      });
      setData(res);
    } catch {
      toast.error('Failed to load payment transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, sortBy, sortOrder]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleRowsPerPageChange = (value: string) => {
    if (value === 'custom') {
      setCustomRowsInput(String(limit));
    } else {
      setCustomRowsInput('');
      setLimit(Number(value));
      setPage(1);
    }
  };

  const handleCustomRowsSubmit = () => {
    const num = parseInt(customRowsInput, 10);
    if (!isNaN(num) && num > 0) {
      setLimit(num);
      setPage(1);
    } else {
      setCustomRowsInput('');
    }
  };

  const totalPages = data?.meta ? Math.ceil(data.meta.total / limit) : 1;
  const pageNumbers = useMemo(() => generatePageNumbers(page, totalPages), [page, totalPages]);
  const showingFrom = data?.meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, data?.meta.total || 0);

  return (
    <RoleGuard roles={['admin']}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payment Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor escrow balances, completed payouts, platform revenues, and transaction histories across SHIFFTO.
          </p>
        </div>

        {/* Top 5 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border border-border/60 shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Gross Volume
                </p>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  ${data?.stats.totalGrossVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">Processed transactions</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Funds in Escrow
                </p>
                <h3 className="text-xl font-bold text-amber-600 mt-1">
                  ${data?.stats.totalEscrowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">Held until delivery</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Released Earnings
                </p>
                <h3 className="text-xl font-bold text-blue-600 mt-1">
                  ${data?.stats.totalReleased.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">Traveler earnings released</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Platform Revenue
                </p>
                <h3 className="text-xl font-bold text-purple-600 mt-1">
                  ${data?.stats.estimatedCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">Based on 30% commission</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Refunds & Failed
                </p>
                <h3 className="text-xl font-bold text-rose-600 mt-1">
                  ${data?.stats.totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">Disputed / Canceled</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section (Matching My Shipments Page layout & styling) */}
        <div className="bg-white rounded-lg border border-slate-100 p-6 shadow-sm space-y-6">
          {/* Title and Controls Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
            <h3 className="text-xl text-muted-foreground tracking-tight">Payment Transactions History</h3>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Input */}
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full sm:w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
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
                  <DropdownMenuItem onClick={() => handleSort('createdAt')}>
                    Sort by Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('grossAmount')}>
                    Sort by Amount {sortBy === 'grossAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status Tab Filters */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
            {STATUS_TABS.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
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

          {/* Payments Table */}
          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 h-16 w-full bg-slate-50 animate-pulse rounded-lg px-4"
                />
              ))}
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Package className="h-12 w-12 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-500">No payment transactions found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try resetting your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4 font-semibold">Txn ID</th>
                    <th className="px-5 py-4 font-semibold max-w-[130px]">Shipment item</th>
                    <th className="px-5 py-4 font-semibold">Sender</th>
                    <th className="px-5 py-4 font-semibold">Traveler</th>
                    <th className="px-5 py-4 font-semibold">Gross / Commission</th>
                    <th className="px-5 py-4 font-semibold">Net Payout</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {data.data.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      {/* Txn ID */}
                      <td className="px-5 py-4 font-mono font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span title={tx.transactionId}>
                            {tx.transactionId.length > 12
                              ? `${tx.transactionId.substring(0, 10)}...`
                              : tx.transactionId}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(tx.transactionId);
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                            title="Copy Transaction ID"
                          >
                            {copiedId === tx.transactionId ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Shipment Item */}
                      <td className="px-5 py-4 font-medium text-foreground max-w-[130px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[100px] font-semibold">{tx.shipment.itemName}</span>
                        </div>
                      </td>

                      {/* Sender */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 overflow-hidden relative shrink-0">
                            {tx.sender.image ? (
                              <Image
                                src={toRelativeImageUrl(tx.sender.image)}
                                alt={tx.sender.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary">
                                {tx.sender.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="truncate max-w-[110px]">
                            <p className="font-semibold text-foreground truncate">{tx.sender.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{tx.sender.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Traveler */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 overflow-hidden relative shrink-0">
                            {tx.traveller.image ? (
                              <Image
                                src={toRelativeImageUrl(tx.traveller.image)}
                                alt={tx.traveller.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold bg-blue-500/10 text-blue-600">
                                {tx.traveller.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="truncate max-w-[110px]">
                            <p className="font-semibold text-foreground truncate">{tx.traveller.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{tx.traveller.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Gross Amount & Commission */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-foreground block">
                          ${tx.grossAmount.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          ${tx.commissionAmount.toFixed(2)} (30%)
                        </span>
                      </td>

                      {/* Net Amount */}
                      <td className="px-5 py-4 font-semibold text-emerald-700">
                        ${tx.netAmount.toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            STATUS_BADGE_CLASS[tx.status] || 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {STATUS_DISPLAY_MAP[tx.status] || tx.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer (Identical to My Shipments page layout) */}
          {data && data.meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              {/* Rows per page + custom input */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Rows per page:</span>
                <Select value={String(limit)} onValueChange={handleRowsPerPageChange}>
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

                {customRowsInput !== '' || !ROWS_PER_PAGE_OPTIONS.includes(limit) ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={
                        customRowsInput ||
                        (!ROWS_PER_PAGE_OPTIONS.includes(limit) ? String(limit) : '')
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
                Showing {showingFrom}–{showingTo} of {data.meta.total} payments
              </span>

              {/* Page navigation */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(1);
                      }}
                      aria-label="First page"
                      className={page <= 1 ? 'pointer-events-none opacity-40' : ''}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page <= 1 ? 'pointer-events-none opacity-40' : ''}
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
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p as number);
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
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={page >= totalPages ? 'pointer-events-none opacity-40' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(totalPages);
                      }}
                      aria-label="Last page"
                      className={page >= totalPages ? 'pointer-events-none opacity-40' : ''}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Transaction Details Slide-Over / Modal */}
        <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
          <DialogContent className="max-w-xl p-6 bg-card border border-border shadow-lg">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Transaction {selectedTx?.transactionId}</span>
                  {selectedTx && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_BADGE_CLASS[selectedTx.status]}`}
                    >
                      {STATUS_DISPLAY_MAP[selectedTx.status] || selectedTx.status}
                    </Badge>
                  )}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Full breakdown and party details for this peer-to-peer delivery payment.
              </DialogDescription>
            </DialogHeader>

            {selectedTx && (
              <div className="space-y-5 py-4 text-xs">
                {/* Financial Summary Card */}
                <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2.5">
                  <div className="flex justify-between items-center text-sm font-bold border-b border-border/60 pb-2">
                    <span className="text-foreground">Gross Amount Paid:</span>
                    <span className="text-foreground">${selectedTx.grossAmount.toFixed(2)} {selectedTx.currency}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Platform Commission (30%):</span>
                    <span className="font-medium text-purple-600">-${selectedTx.commissionAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Net Traveler Earnings:</span>
                    <span className="font-semibold text-emerald-700">${selectedTx.netAmount.toFixed(2)}</span>
                  </div>
                  {selectedTx.gatewayTxnId && (
                    <div className="flex justify-between items-center pt-1 text-[11px] text-muted-foreground">
                      <span>Stripe Payment Intent ID:</span>
                      <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">
                        {selectedTx.gatewayTxnId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Parties Details */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Sender Card */}
                  <div className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground border-b border-border pb-1">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>Sender</span>
                    </div>
                    <p className="font-medium text-foreground">{selectedTx.sender.name}</p>
                    <p className="text-muted-foreground truncate">{selectedTx.sender.email}</p>
                    {selectedTx.sender.phone && (
                      <p className="text-muted-foreground">{selectedTx.sender.phone}</p>
                    )}
                  </div>

                  {/* Traveler Card */}
                  <div className="p-3 rounded-lg border border-border bg-background space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground border-b border-border pb-1">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                      <span>Traveler</span>
                    </div>
                    <p className="font-medium text-foreground">{selectedTx.traveller.name}</p>
                    <p className="text-muted-foreground truncate">{selectedTx.traveller.email}</p>
                    {selectedTx.traveller.phone && (
                      <p className="text-muted-foreground">{selectedTx.traveller.phone}</p>
                    )}
                  </div>
                </div>

                {/* Shipment & Trip Details */}
                <div className="p-3 rounded-lg border border-border bg-background space-y-2">
                  <div className="flex justify-between items-center font-semibold text-foreground border-b border-border pb-1">
                    <span className="flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-amber-600" />
                      <span>{selectedTx.shipment.itemName}</span>
                    </span>
                    <span className="text-muted-foreground text-[11px]">Weight: {selectedTx.shipment.weight} kg</span>
                  </div>

                  {selectedTx.offer?.trip && (
                    <div className="flex items-center justify-between text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Plane className="h-3.5 w-3.5 text-blue-600" />
                        <span>Route: {selectedTx.offer.trip.fromCountry} → {selectedTx.offer.trip.toCountry}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="text-[11px] text-muted-foreground space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border/50">
                  <p>Created Date: {new Date(selectedTx.createdAt).toLocaleString()}</p>
                  {selectedTx.releasedAt && (
                    <p className="text-emerald-700 font-medium">
                      Released Date: {new Date(selectedTx.releasedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons Footer */}
                <div className="border-t border-border pt-4 grid grid-cols-2 gap-2">
                  <Button asChild variant="default" className="w-full text-xs">
                    <Link href={`/dashboard/admin/shipments/${selectedTx.shipmentId}`}>
                      <Package className="h-3.5 w-3.5 mr-1.5" />
                      View Shipment Details
                    </Link>
                  </Button>

                  {selectedTx.offer?.tripId ? (
                    <Button asChild variant="secondary" className="w-full text-xs">
                      <Link href={`/dashboard/admin/trips/${selectedTx.offer.tripId}`}>
                        <Plane className="h-3.5 w-3.5 mr-1.5" />
                        View Trip Details
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled variant="secondary" className="w-full text-xs">
                      <Plane className="h-3.5 w-3.5 mr-1.5" />
                      No Linked Trip
                    </Button>
                  )}

                  <Button asChild variant="outline" className="w-full text-xs">
                    <Link href={`/dashboard/users/${selectedTx.senderId}`}>
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      View Sender Profile
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full text-xs">
                    <Link href={`/dashboard/users/${selectedTx.travellerId}`}>
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      View Traveler Profile
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
