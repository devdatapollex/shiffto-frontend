'use client';

import { useState } from 'react';
import { adminCancelShipment } from '@/services/payment.service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Calculator } from 'lucide-react';

interface AdminCancelShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: {
    id: string;
    itemName: string;
    status: string;
    paymentTransaction?: {
      grossAmount: number;
      commissionRate?: number;
      commissionAmount?: number;
    } | null;
  } | null;
  onSuccess?: () => void;
}

export function AdminCancelShipmentModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
}: AdminCancelShipmentModalProps) {
  const [reason, setReason] = useState('');
  const [feeType, setFeeType] = useState<'COMMISSION' | 'PERCENT' | 'FLAT' | 'NONE'>('COMMISSION');
  const [feeValue, setFeeValue] = useState<string>('15');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonTouched, setReasonTouched] = useState(false);

  if (!shipment) return null;

  const grossAmount = shipment.paymentTransaction?.grossAmount || 0;
  const commissionRate = shipment.paymentTransaction?.commissionRate ?? 0.3;
  const maxCommissionPercent = Math.round(commissionRate * 100);
  const maxCommissionAmount =
    shipment.paymentTransaction?.commissionAmount && shipment.paymentTransaction.commissionAmount > 0
      ? shipment.paymentTransaction.commissionAmount
      : grossAmount * commissionRate;

  const getReasonError = () => {
    if (!reasonTouched && !isSubmitting) return null;
    if (!reason.trim()) return 'Cancellation reason is required.';
    return null;
  };

  const getFeeValueError = () => {
    if (feeType !== 'PERCENT' && feeType !== 'FLAT') return null;
    if (feeValue === '' || feeValue === null || feeValue === undefined) {
      return 'Fee amount is required.';
    }
    const val = parseFloat(feeValue);
    if (isNaN(val)) return 'Please enter a valid number.';
    if (val < 1) {
      return feeType === 'PERCENT'
        ? 'Fee percentage must be at least 1%.'
        : 'Flat fee amount must be at least $1.00.';
    }
    if (feeType === 'PERCENT' && val > maxCommissionPercent) {
      return `Fee percentage cannot exceed platform commission rate (${maxCommissionPercent}%).`;
    }
    if (feeType === 'FLAT' && val > maxCommissionAmount) {
      return `Flat fee amount cannot exceed platform commission amount ($${maxCommissionAmount.toFixed(2)}).`;
    }
    return null;
  };

  const reasonError = getReasonError();
  const feeValueError = getFeeValueError();

  let computedFee = 0;
  if (feeType === 'COMMISSION') {
    computedFee = grossAmount * commissionRate;
  } else if (feeType === 'PERCENT') {
    const val = parseFloat(feeValue) || 0;
    computedFee = grossAmount * (val / 100);
  } else if (feeType === 'FLAT') {
    const val = parseFloat(feeValue) || 0;
    computedFee = Math.min(grossAmount, val);
  } else if (feeType === 'NONE') {
    computedFee = 0;
  }

  const computedNetRefund = Math.max(0, grossAmount - computedFee);

  const handleSubmit = async () => {
    setReasonTouched(true);
    if (!reason.trim() || feeValueError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await adminCancelShipment(shipment.id, {
        reason: reason.trim(),
        feeType,
        feeValue:
          feeType === 'PERCENT' || feeType === 'FLAT' ? parseFloat(feeValue) || 0 : undefined,
      });
      toast.success(`Shipment "${shipment.itemName}" successfully canceled by admin.`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { message?: string; data?: { message?: string }; response?: { data?: { message?: string } } })?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to cancel shipment';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-destructive font-semibold text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Admin Cancel Shipment
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 mt-1">
            Cancel shipment &quot;
            <span className="font-semibold text-slate-900">{shipment.itemName}</span>&quot; and
            configure refund fee rule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Reason Input */}
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-xs font-semibold text-slate-700">
              Cancellation Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="Provide reason for admin cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setReasonTouched(true)}
              className={`text-xs min-h-[80px] ${
                reasonError ? 'border-destructive focus-visible:ring-destructive text-destructive' : ''
              }`}
            />
            {reasonError && (
              <p className="text-[11px] font-medium text-destructive mt-1">{reasonError}</p>
            )}
          </div>

          {/* Fee Options */}
          {grossAmount > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-xs font-semibold text-slate-700 block">
                Platform Cancellation Fee Rule
              </Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFeeType('COMMISSION')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition ${
                    feeType === 'COMMISSION'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Standard Cancellation Fee ({maxCommissionPercent}%)
                </button>
                <button
                  type="button"
                  onClick={() => setFeeType('NONE')}
                  className={`p-2.5 rounded-lg border text-left font-medium transition ${
                    feeType === 'NONE'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  No Fee (100% Refund)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeeType('PERCENT');
                    setFeeValue(String(maxCommissionPercent));
                  }}
                  className={`p-2.5 rounded-lg border text-left font-medium transition ${
                    feeType === 'PERCENT'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Custom Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeeType('FLAT');
                    setFeeValue(String(Math.max(1, Math.min(10, Number(maxCommissionAmount.toFixed(2))))));
                  }}
                  className={`p-2.5 rounded-lg border text-left font-medium transition ${
                    feeType === 'FLAT'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Custom Dollar Amount ($)
                </button>
              </div>

              {(feeType === 'PERCENT' || feeType === 'FLAT') && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="custom-fee-val" className="text-xs font-semibold text-slate-700">
                      {feeType === 'PERCENT' ? 'Fee Percentage (%)' : 'Flat Fee Amount ($)'}
                    </Label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {feeType === 'PERCENT'
                        ? `Allowed: 1% – ${maxCommissionPercent}%`
                        : `Allowed: $1.00 – $${maxCommissionAmount.toFixed(2)}`}
                    </span>
                  </div>
                  <Input
                    id="custom-fee-val"
                    type="number"
                    min={1}
                    max={feeType === 'PERCENT' ? maxCommissionPercent : maxCommissionAmount}
                    step={feeType === 'PERCENT' ? '1' : '0.01'}
                    value={feeValue}
                    onChange={(e) => setFeeValue(e.target.value)}
                    className={`text-xs h-8 ${
                      feeValueError ? 'border-destructive focus-visible:ring-destructive text-destructive' : ''
                    }`}
                  />
                  {feeValueError ? (
                    <p className="text-[11px] font-medium text-destructive mt-1">
                      {feeValueError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      {feeType === 'PERCENT'
                        ? `Value must be between 1% and platform commission rate (${maxCommissionPercent}%).`
                        : `Value must be between $1.00 and max platform commission amount ($${maxCommissionAmount.toFixed(2)}).`}
                    </p>
                  )}
                </div>
              )}

              {/* Financial Calculation Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold pb-1 border-b border-slate-200">
                  <Calculator className="h-3.5 w-3.5 text-blue-600" />
                  <span>Calculation Preview</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Gross Amount Paid:</span>
                  <span className="font-medium">${grossAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Fee Retained by Platform:</span>
                  <span className="font-medium">-${computedFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800 pt-1 border-t border-slate-200">
                  <span>Net Refund Payout:</span>
                  <span>${computedNetRefund.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm Admin Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
