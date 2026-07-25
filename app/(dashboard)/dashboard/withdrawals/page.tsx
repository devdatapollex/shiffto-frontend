'use client';

import { useState, useEffect, useMemo } from 'react';
import { Banknote, Search, ArrowUpDown, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from '@/services/withdrawal.service';
import type { WithdrawalHistoryItem } from '@/services/payment.service';

export interface AdminWithdrawalItem extends WithdrawalHistoryItem {
  user?: {
    name?: string;
    email?: string;
  };
}

const STATUS_TABS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
] as const;

const STATUS_BADGE_CLASS: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_ROWS_PER_PAGE = 10;

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

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters, sorting, and pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_ROWS_PER_PAGE);
  const [customRowsInput, setCustomRowsInput] = useState('');

  // Approve Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawalItem | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [payoutTxnId, setPayoutTxnId] = useState('');
  const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await getAllWithdrawals();
      setWithdrawals(data as AdminWithdrawalItem[]);
    } catch {
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const sortIndicator = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleRowsPerPageChange = (value: string) => {
    if (value === 'custom') {
      setCustomRowsInput('');
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      setLimit(num);
      setPage(1);
      setCustomRowsInput('');
    }
  };

  const handleCustomRowsSubmit = () => {
    const num = Number(customRowsInput);
    if (!isNaN(num) && num > 0) {
      setLimit(num);
      setPage(1);
    }
  };

  // Filtered and sorted withdrawals
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((wdr) => {
      // Status filter
      if (statusFilter && wdr.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const withdrawalNoMatches =
          `#${wdr.withdrawalNo}`.toLowerCase().includes(query) ||
          wdr.withdrawalNo.toLowerCase().includes(query);
        const userNameMatches = wdr.user?.name?.toLowerCase().includes(query);
        const userEmailMatches = wdr.user?.email?.toLowerCase().includes(query);
        const txnIdMatches = wdr.payoutTxnId?.toLowerCase().includes(query);
        const methodMatches =
          wdr.paymentMethodDetails?.type?.toLowerCase().includes(query) ||
          wdr.paymentMethodDetails?.accountNumber?.toLowerCase().includes(query);

        if (
          !withdrawalNoMatches &&
          !userNameMatches &&
          !userEmailMatches &&
          !txnIdMatches &&
          !methodMatches
        ) {
          return false;
        }
      }
      return true;
    });
  }, [withdrawals, statusFilter, search]);

  const sortedWithdrawals = useMemo(() => {
    return [...filteredWithdrawals].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortBy === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortBy === 'withdrawalNo') {
        aValue = a.withdrawalNo;
        bValue = b.withdrawalNo;
      } else {
        // Default: createdAt
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredWithdrawals, sortBy, sortOrder]);

  const totalCount = sortedWithdrawals.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const paginatedWithdrawals = useMemo(() => {
    const start = (page - 1) * limit;
    return sortedWithdrawals.slice(start, start + limit);
  }, [sortedWithdrawals, page, limit]);

  const showingFrom = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, totalCount);

  const pageNumbers = useMemo(() => generatePageNumbers(page, totalPages), [page, totalPages]);

  const handleOpenApprove = (wdr: AdminWithdrawalItem) => {
    setSelectedWithdrawal(wdr);
    setPayoutTxnId('');
    setIsApproveModalOpen(true);
  };

  const handleOpenReject = (wdr: AdminWithdrawalItem) => {
    setSelectedWithdrawal(wdr);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;
    if (!payoutTxnId.trim()) {
      toast.error('Please enter the offline transfer reference code');
      return;
    }

    setIsSubmittingApprove(true);
    try {
      await approveWithdrawal(selectedWithdrawal.id, payoutTxnId);
      toast.success(`Withdrawal #${selectedWithdrawal.withdrawalNo} approved!`);
      setIsApproveModalOpen(false);
      fetchWithdrawals();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || 'Failed to approve withdrawal');
    } finally {
      setIsSubmittingApprove(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    setIsSubmittingReject(true);
    try {
      await rejectWithdrawal(selectedWithdrawal.id, rejectionReason);
      toast.success(`Withdrawal #${selectedWithdrawal.withdrawalNo} rejected.`);
      setIsRejectModalOpen(false);
      fetchWithdrawals();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || 'Failed to reject withdrawal');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* SHIPMENT-STYLE TABLE CONTAINER */}
      <div className="bg-white rounded-lg border border-slate-100 p-6 shadow-sm space-y-6">
        {/* Title and Controls Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <h3 className="text-xl text-muted-foreground tracking-tight">Withdrawals & Payouts</h3>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search withdrawals..."
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
                  Sort by Date{sortIndicator('createdAt')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('withdrawalNo')}>
                  Sort by ID{sortIndicator('withdrawalNo')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('amount')}>
                  Sort by Amount{sortIndicator('amount')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setStatusFilter(tab.value);
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

        {/* Table Body / Loading / Empty State */}
        {loading ? (
          <div className="space-y-4 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 h-16 w-full bg-slate-50 animate-pulse rounded-lg px-4"
              />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Banknote className="h-12 w-12 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No withdrawal requests found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or status filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4 font-semibold">Withdrawal #</th>
                  <th className="px-5 py-4 font-semibold">Traveler</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Payout Method</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {paginatedWithdrawals.map((wdr) => {
                  const statusClass =
                    STATUS_BADGE_CLASS[wdr.status] || STATUS_BADGE_CLASS['PENDING'];

                  return (
                    <tr
                      key={wdr.id}
                      className="hover:bg-slate-50/60 transition-colors duration-150"
                    >
                      <td className="px-5 py-4 font-semibold text-blue-600">#{wdr.withdrawalNo}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground text-sm">
                          {wdr.user?.name || 'Traveler'}
                        </p>
                        <p className="text-xs text-slate-400">{wdr.user?.email}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-600">
                        ${wdr.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-xs space-y-0.5">
                        <p className="font-semibold text-slate-800">
                          {wdr.paymentMethodDetails?.type}
                        </p>
                        <p className="text-slate-400 font-mono">
                          {wdr.paymentMethodDetails?.accountNumber}
                        </p>
                        {wdr.paymentMethodDetails?.bankName && (
                          <p className="text-slate-400">{wdr.paymentMethodDetails.bankName}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
                        >
                          {wdr.status}
                        </span>
                        {wdr.payoutTxnId && (
                          <p className="text-xs text-slate-400 font-mono mt-1">
                            Txn ID:{' '}
                            <span className="font-semibold text-slate-600">{wdr.payoutTxnId}</span>
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {wdr.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleOpenApprove(wdr)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReject(wdr)}
                              className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs h-8"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > 0 && (
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

            {/* Showing X–Y of Z */}
            <span className="text-xs text-slate-500">
              Showing {showingFrom}–{showingTo} of {totalCount} withdrawals
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
                          setPage(p);
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

      {/* APPROVE MODAL */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Approve & Mark Transferred</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter the transaction reference ID after manually transferring funds offline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApproveSubmit} className="space-y-4 py-2">
            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 border">
              <p>
                <span className="text-slate-500">Traveler:</span>{' '}
                <span className="font-semibold text-slate-900">
                  {selectedWithdrawal?.user?.name}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Payout Amount:</span>{' '}
                <span className="font-bold text-emerald-600">
                  ${selectedWithdrawal?.amount.toFixed(2)}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Method:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {selectedWithdrawal?.paymentMethodDetails?.type} (
                  {selectedWithdrawal?.paymentMethodDetails?.accountNumber})
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Offline Transfer Reference / Transaction ID
              </Label>
              <Input
                placeholder="e.g. TRX-987654321 or Bank Ref #123"
                value={payoutTxnId}
                onChange={(e) => setPayoutTxnId(e.target.value)}
                required
                className="font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-foreground!"
                onClick={() => setIsApproveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingApprove}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSubmittingApprove ? 'Processing...' : 'Confirm Approval'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REJECT MODAL */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reject Withdrawal Request</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              State the reason for rejecting this request. Funds will be unlocked back to
              traveler&apos;s available balance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Rejection Reason</Label>
              <Input
                placeholder="e.g. Invalid bKash account number"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-foreground!"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingReject}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {isSubmittingReject ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
