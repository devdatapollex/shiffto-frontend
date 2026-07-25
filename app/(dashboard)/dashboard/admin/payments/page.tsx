'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalPages = data?.meta ? Math.ceil(data.meta.total / limit) : 1;

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payment Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor escrow balances, completed payouts, platform revenues, and transaction histories
            across SHIFFTO.
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
                  $
                  {data?.stats.totalGrossVolume.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0.00'}
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
                  $
                  {data?.stats.totalEscrowed.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0.00'}
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
                  $
                  {data?.stats.totalReleased.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0.00'}
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
                  $
                  {data?.stats.estimatedCommission.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0.00'}
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
                  $
                  {data?.stats.totalRefunded.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0.00'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">Disputed / Canceled</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar & Filters (Matching Shipments Page) */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Txn ID, Stripe ID, Item, Sender..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {STATUS_TABS.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-muted-foreground">Per page:</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt.toString()} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[140px] text-xs font-semibold">Txn ID</TableHead>
                <TableHead className="text-xs font-semibold">Shipment Item</TableHead>
                <TableHead className="text-xs font-semibold">Sender</TableHead>
                <TableHead className="text-xs font-semibold">Traveler</TableHead>
                <TableHead className="text-xs font-semibold">
                  <button
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort('grossAmount')}
                  >
                    Gross Amount <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-xs font-semibold">Commission (30%)</TableHead>
                <TableHead className="text-xs font-semibold">Net Payout</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">
                  <button
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort('createdAt')}
                  >
                    Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="w-[80px] text-right text-xs font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading payment transactions...
                    </div>
                  </TableCell>
                </TableRow>
              ) : !data?.data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-32 text-center text-muted-foreground text-sm"
                  >
                    No payment transactions found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors text-xs">
                    {/* Txn ID */}
                    <TableCell className="font-mono font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span title={tx.transactionId}>
                          {tx.transactionId.length > 12
                            ? `${tx.transactionId.substring(0, 10)}...`
                            : tx.transactionId}
                        </span>
                        <button
                          onClick={() => handleCopy(tx.transactionId)}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                          title="Copy Transaction ID"
                        >
                          {copiedId === tx.transactionId ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Shipment Item */}
                    <TableCell className="font-medium text-foreground">
                      <Link
                        href={`/dashboard/admin/shipments/${tx.shipmentId}`}
                        className="hover:underline flex items-center gap-1.5 text-primary"
                      >
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]">{tx.shipment.itemName}</span>
                      </Link>
                    </TableCell>

                    {/* Sender */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted overflow-hidden relative shrink-0">
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
                          <p className="font-medium text-foreground truncate">{tx.sender.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {tx.sender.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Traveler */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted overflow-hidden relative shrink-0">
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
                          <p className="font-medium text-foreground truncate">
                            {tx.traveller.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {tx.traveller.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Gross Amount */}
                    <TableCell className="font-semibold text-foreground">
                      ${tx.grossAmount.toFixed(2)}
                    </TableCell>

                    {/* Commission */}
                    <TableCell className="text-muted-foreground">
                      ${tx.commissionAmount.toFixed(2)}
                    </TableCell>

                    {/* Net Amount */}
                    <TableCell className="font-medium text-emerald-700">
                      ${tx.netAmount.toFixed(2)}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          STATUS_BADGE_CLASS[tx.status] ||
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {STATUS_DISPLAY_MAP[tx.status] || tx.status}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>

                    {/* Details Action Button */}
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedTx(tx)}
                        title="View Full Transaction Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Table Footer / Pagination */}
          {data && data.meta.total > 0 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {Math.min((page - 1) * limit + 1, data.meta.total)} to{' '}
                {Math.min(page * limit, data.meta.total)} of {data.meta.total} transactions
              </p>

              {totalPages > 1 && (
                <Pagination className="justify-end w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={
                          page === 1
                            ? 'pointer-events-none opacity-50 text-xs'
                            : 'cursor-pointer text-xs'
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                      .map((pNum) => (
                        <PaginationItem key={pNum}>
                          <PaginationLink
                            onClick={() => setPage(pNum)}
                            isActive={page === pNum}
                            className="cursor-pointer text-xs"
                          >
                            {pNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={
                          page === totalPages
                            ? 'pointer-events-none opacity-50 text-xs'
                            : 'cursor-pointer text-xs'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
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
                    <span className="text-foreground">
                      ${selectedTx.grossAmount.toFixed(2)} {selectedTx.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Platform Commission (30%):</span>
                    <span className="font-medium text-purple-600">
                      -${selectedTx.commissionAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Net Traveler Earnings:</span>
                    <span className="font-semibold text-emerald-700">
                      ${selectedTx.netAmount.toFixed(2)}
                    </span>
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
                    <span className="text-muted-foreground text-[11px]">
                      Weight: {selectedTx.shipment.weight} kg
                    </span>
                  </div>

                  {selectedTx.offer?.trip && (
                    <div className="flex items-center justify-between text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Plane className="h-3.5 w-3.5 text-blue-600" />
                        <span>
                          Route: {selectedTx.offer.trip.fromCountry} →{' '}
                          {selectedTx.offer.trip.toCountry}
                        </span>
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
