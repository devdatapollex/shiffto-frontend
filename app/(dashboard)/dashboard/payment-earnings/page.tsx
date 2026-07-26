'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Wallet as WalletIcon,
  ArrowUpRight,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  Smartphone,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  getSenderPaymentsSummary,
  getTravelerEarningsSummary,
  type SenderSummaryResponse,
  type TravelerSummaryResponse,
} from '@/services/payment.service';
import { getMyPaymentMethods, type PaymentMethod } from '@/services/wallet.service';
import { requestWithdrawal } from '@/services/withdrawal.service';

export default function PaymentEarningsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'earnings';
  const isSuccessReturn = searchParams.get('success') === 'true';
  const rawTxId = searchParams.get('tx') || searchParams.get('transactionId');
  const mockTxId = rawTxId ? rawTxId.split('?')[0].split('&')[0] : null;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [senderData, setSenderData] = useState<SenderSummaryResponse | null>(null);
  const [travelerData, setTravelerData] = useState<TravelerSummaryResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  useEffect(() => {
    fetchData();
    if (isSuccessReturn) {
      toast.success('Payment completed successfully via Stripe!');
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [senderRes, travelerRes, methodsRes] = await Promise.all([
        getSenderPaymentsSummary(),
        getTravelerEarningsSummary(),
        getMyPaymentMethods(),
      ]);
      setSenderData(senderRes);
      setTravelerData(travelerRes);
      setPaymentMethods(methodsRes);

      const primary = methodsRes.find((m) => m.isPrimary) || methodsRes[0];
      if (primary) {
        setSelectedMethodId(primary.id);
      }
    } catch {
      toast.error('Failed to load payment & earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (!selectedMethodId) {
      toast.error('Please select a payment method for payout');
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      await requestWithdrawal({
        amount: amount,
        paymentMethodId: selectedMethodId,
      });
      toast.success('Withdrawal request submitted successfully!');
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchData();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const parsedWithdrawAmount = parseFloat(withdrawAmount) || 0;

  return (
    <div className="space-y-6 max-w-[1144px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Earnings & Payments</h1>
          <p className="text-sm text-slate-500">
            Track your earnings, manage withdrawals, and view transaction history
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="earnings" className="rounded-lg font-medium">
            Earnings (Traveler)
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg font-medium">
            Payments (Sender)
          </TabsTrigger>
        </TabsList>

        {/* EARNINGS TAB (Traveler View) */}
        <TabsContent value="earnings" className="space-y-6 mt-6">
          {/* Top Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Earnings
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    ${travelerData?.stats.totalEarnings.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-slate-400">Total net payout from released shipments</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                  $
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Awaiting Payout
                  </p>
                  <p className="text-3xl font-extrabold text-amber-600">
                    ${travelerData?.stats.awaitingPayout.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-slate-400">Withdrawal requests pending transfer</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    In Escrow
                  </p>
                  <p className="text-3xl font-extrabold text-indigo-600">
                    ${travelerData?.stats.escrowedEarnings?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-slate-400">Held in escrow for active shipments</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <WalletIcon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Pending Release
                  </p>
                  <p className="text-3xl font-extrabold text-sky-600">
                    ${travelerData?.stats.pendingReleaseEarnings.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-slate-400">Delivered, awaiting admin release</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available for Withdrawal Box */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">Available for Withdrawal</p>
                <p className="text-4xl font-extrabold text-emerald-600">
                  ${travelerData?.stats.availableForWithdrawal.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-slate-500">
                  Net withdrawable earnings balance
                </p>
              </div>

              <Button
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={!travelerData || travelerData.stats.availableForWithdrawal <= 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-6 rounded-lg text-base shadow-md transition-all"
              >
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>

          {/* Earnings History */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Earnings History</h2>
            {travelerData?.earningsHistory.length === 0 ? (
              <Card className="border-dashed border-slate-200 p-8 text-center text-slate-500">
                No earnings history found yet.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {travelerData?.earningsHistory.map((item) => (
                  <Card key={item.id} className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 text-sm">
                          #{item.transactionId}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            item.status === 'RELEASED'
                              ? 'bg-emerald-100 text-emerald-700 font-semibold'
                              : item.status === 'PENDING_RELEASE'
                                ? 'bg-amber-100 text-amber-700 font-semibold'
                                : 'bg-slate-100 text-slate-700'
                          }
                        >
                          {item.status === 'RELEASED'
                            ? 'Received'
                            : item.status === 'PENDING_RELEASE'
                              ? 'Awaiting Payout'
                              : item.status}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-slate-900 text-base">
                        {item.shipment?.itemName || 'Shipment Item'}
                      </h3>

                      <div className="text-xs space-y-1 text-slate-600 border-t pt-2 border-slate-100">
                        <div className="flex justify-between">
                          <span>Gross:</span>
                          <span className="font-semibold">${item.grossAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Commission ({Math.round((item.commissionRate || 0.3) * 100)}%):</span>
                          <span>-${item.commissionAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600 font-bold pt-1 text-sm border-t border-dashed">
                          <span>Net:</span>
                          <span>${item.netAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 pt-1">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawal History */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Withdrawal History</h2>
            {travelerData?.withdrawalHistory.length === 0 ? (
              <Card className="border-dashed border-slate-200 p-8 text-center text-slate-500">
                No withdrawal requests submitted yet.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {travelerData?.withdrawalHistory.map((wdr) => (
                  <Card key={wdr.id} className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 text-sm">#{wdr.withdrawalNo}</span>
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
                          {wdr.status === 'APPROVED'
                            ? 'Approved'
                            : wdr.status === 'PENDING'
                              ? 'Pending'
                              : 'Rejected'}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500">Amount:</p>
                        <p className="text-xl font-extrabold text-slate-900">
                          ${wdr.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Method:{' '}
                          <span className="font-medium text-slate-700">
                            {wdr.paymentMethodDetails?.type || 'Saved Method'} |{' '}
                            {wdr.paymentMethodDetails?.accountNumber}
                          </span>
                        </p>
                      </div>

                      {wdr.status === 'APPROVED' && (
                        <div className="space-y-1">
                          {wdr.processedAt && (
                            <p className="text-[11px] text-emerald-600 font-medium">
                              Paid on:{' '}
                              {new Date(wdr.processedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                          {wdr.payoutTxnId && (
                            <p className="text-xs text-slate-500 font-mono">
                              Txn ID:{' '}
                              <span className="font-semibold text-slate-700">
                                {wdr.payoutTxnId}
                              </span>
                            </p>
                          )}
                        </div>
                      )}

                      {wdr.status === 'REJECTED' && (
                        <div className="space-y-2 pt-1 border-t border-rose-100">
                          <p className="text-xs text-rose-600 font-medium">
                            {wdr.rejectionReason || 'Insufficient verification'}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8"
                          >
                            Request Again
                          </Button>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400">
                        Requested:{' '}
                        {new Date(wdr.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* PAYMENTS TAB (Sender View) */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          {/* Top Summary Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Spent
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900">
                    ${senderData?.stats.totalSpent.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Pending Amount
                  </p>
                  <p className="text-2xl font-extrabold text-amber-600">
                    ${senderData?.stats.pendingAmount.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-[11px] text-slate-400">Held in escrow</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Refunded Amount
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-600">
                    ${senderData?.stats.refundedAmount.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Dispute Money
                  </p>
                  <p className="text-2xl font-extrabold text-rose-600">
                    ${senderData?.stats.disputeMoney.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
            {senderData?.transactions.length === 0 ? (
              <Card className="border-dashed border-slate-200 p-8 text-center text-slate-500">
                No payment transactions found.
              </Card>
            ) : (
              <div className="space-y-3">
                {senderData?.transactions.map((tx) => (
                  <Card key={tx.id} className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-600 text-sm">
                            #{tx.transactionId}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              tx.status === 'RELEASED' || tx.status === 'ESCROWED'
                                ? 'bg-emerald-100 text-emerald-700 font-semibold'
                                : tx.status === 'PENDING_RELEASE'
                                  ? 'bg-amber-100 text-amber-700 font-semibold'
                                  : tx.status === 'FAILED'
                                    ? 'bg-rose-100 text-rose-700 font-semibold'
                                    : 'bg-slate-100 text-slate-700'
                            }
                          >
                            {tx.status === 'ESCROWED' || tx.status === 'RELEASED'
                              ? 'Completed'
                              : tx.status === 'PENDING_RELEASE'
                                ? 'Pending Release'
                                : tx.status === 'FAILED'
                                  ? 'Failed'
                                  : tx.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-base">
                          {tx.shipment?.itemName || 'Shipment Package'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Payment Method:{' '}
                          <span className="font-medium">
                            {tx.paymentGateway || 'Stripe / SSLCommerz'}
                          </span>{' '}
                          •{' '}
                          {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-extrabold text-slate-900">
                          ${tx.grossAmount.toFixed(2)}
                        </span>
                        {tx.status === 'FAILED' ? (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs"
                          >
                            Retry Payment
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="text-xs gap-1.5">
                            <Download className="w-3.5 h-3.5" />
                            Download Invoice
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" /> Payment Terms & Information
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-700 pl-1">
              <li>Refund requests are handled manually by admin</li>
              <li>You will receive in-app and email notifications after refund processing</li>
              <li>Disputes can only be raised from the Support module</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* WITHDRAWAL REQUEST MODAL */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request Withdrawal</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit a withdrawal request to transfer your available earnings to your saved payment
              method.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Withdrawal Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={travelerData?.stats.availableForWithdrawal || 0}
                required
                className="font-bold text-lg"
              />
              <p className="text-[11px] text-slate-500">
                Available:{' '}
                <span className="font-bold text-emerald-600">
                  ${travelerData?.stats.availableForWithdrawal.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Select Payment Method</Label>
              {paymentMethods.length === 0 ? (
                <p className="text-xs text-rose-600">
                  No payment methods found in Wallet. Please add a payment method first.
                </p>
              ) : (
                <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.type} - {m.accountNumber} {m.isPrimary ? '(Primary)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Breakdown */}
            {parsedWithdrawAmount > 0 && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1 border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Requested Withdrawal:</span>
                  <span className="font-semibold">${parsedWithdrawAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold border-t pt-1 border-slate-200 text-sm">
                  <span>Net Payout Amount:</span>
                  <span>${parsedWithdrawAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-foreground!"
                onClick={() => setIsWithdrawModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingWithdraw || paymentMethods.length === 0}
                className="bg-primary! hover:bg-primary/90! text-white! font-semibold"
              >
                {isSubmittingWithdraw ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
