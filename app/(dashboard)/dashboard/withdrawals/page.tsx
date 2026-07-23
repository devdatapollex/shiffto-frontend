'use client';

import { useState, useEffect } from 'react';
import {
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Smartphone,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from '@/services/withdrawal.service';
import type { WithdrawalHistoryItem } from '@/services/payment.service';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Approve Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalHistoryItem | null>(null);
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
      setWithdrawals(data);
    } catch (err: any) {
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprove = (wdr: WithdrawalHistoryItem) => {
    setSelectedWithdrawal(wdr);
    setPayoutTxnId('');
    setIsApproveModalOpen(true);
  };

  const handleOpenReject = (wdr: WithdrawalHistoryItem) => {
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
      toast.success(`Withdrawal ${selectedWithdrawal.withdrawalNo} approved!`);
      setIsApproveModalOpen(false);
      fetchWithdrawals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve withdrawal');
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
      toast.success(`Withdrawal ${selectedWithdrawal.withdrawalNo} rejected.`);
      setIsRejectModalOpen(false);
      fetchWithdrawals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject withdrawal');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1144px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Withdrawals & Payouts</h1>
        <p className="text-sm text-slate-500">Process traveler withdrawal requests and enter transfer references</p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0">
          {withdrawals.length === 0 && !loading ? (
            <div className="p-8 text-center text-slate-500">
              No withdrawal requests found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Withdrawal #</TableHead>
                  <TableHead className="font-bold">Traveler</TableHead>
                  <TableHead className="font-bold">Gross Amount</TableHead>
                  <TableHead className="font-bold">Commission Cut</TableHead>
                  <TableHead className="font-bold">Net Payout</TableHead>
                  <TableHead className="font-bold">Payout Method</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((wdr) => (
                  <TableRow key={wdr.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-blue-600">#{wdr.withdrawalNo}</TableCell>
                    <TableCell>
                      <p className="font-semibold text-slate-900 text-sm">{(wdr as any).user?.name || 'Traveler'}</p>
                      <p className="text-xs text-slate-500">{(wdr as any).user?.email}</p>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">${wdr.grossAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-slate-500">
                      -${wdr.commissionAmount.toFixed(2)} ({Math.round(wdr.commissionRate * 100)}%)
                    </TableCell>
                    <TableCell className="font-extrabold text-emerald-600">${wdr.netAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-xs space-y-0.5">
                      <p className="font-semibold text-slate-800">{wdr.paymentMethodDetails?.type}</p>
                      <p className="text-slate-500 font-mono">{wdr.paymentMethodDetails?.accountNumber}</p>
                      {wdr.paymentMethodDetails?.bankName && (
                        <p className="text-slate-400">{wdr.paymentMethodDetails.bankName}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          wdr.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-700 font-semibold'
                            : wdr.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700 font-semibold'
                            : 'bg-rose-100 text-rose-700 font-semibold'
                        }
                      >
                        {wdr.status}
                      </Badge>
                      {wdr.payoutTxnId && (
                        <p className="text-xs text-slate-500 font-mono mt-1">
                          Txn ID: <span className="font-semibold text-slate-700">{wdr.payoutTxnId}</span>
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
              <p><span className="text-slate-500">Traveler:</span> <span className="font-semibold text-slate-900">{(selectedWithdrawal as any)?.user?.name}</span></p>
              <p><span className="text-slate-500">Net Payout:</span> <span className="font-bold text-emerald-600">${selectedWithdrawal?.netAmount.toFixed(2)}</span></p>
              <p><span className="text-slate-500">Method:</span> <span className="font-semibold text-slate-800">{selectedWithdrawal?.paymentMethodDetails?.type} ({selectedWithdrawal?.paymentMethodDetails?.accountNumber})</span></p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Offline Transfer Reference / Transaction ID</Label>
              <Input
                placeholder="e.g. TRX-987654321 or Bank Ref #123"
                value={payoutTxnId}
                onChange={(e) => setPayoutTxnId(e.target.value)}
                required
                className="font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
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
              State the reason for rejecting this request. Funds will be unlocked back to traveler's available balance.
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
              <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingReject} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                {isSubmittingReject ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
