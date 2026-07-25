'use client';

import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  Lock,
  Plus,
  Building2,
  Smartphone,
  CreditCard,
  Coins,
  CheckCircle2,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  getMyPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setPrimaryPaymentMethod,
  type PaymentMethod,
  type PaymentMethodType,
} from '@/services/wallet.service';

export default function WalletPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    type: 'BKASH' as PaymentMethodType,
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    routingNumber: '',
    cryptoAddress: '',
    isPrimary: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const data = await getMyPaymentMethods();
      setMethods(data);
    } catch (err: any) {
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMethod(null);
    setFormData({
      type: 'BKASH',
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      routingNumber: '',
      cryptoAddress: '',
      isPrimary: methods.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      accountName: method.accountName || '',
      accountNumber: method.accountNumber || '',
      bankName: method.bankName || '',
      branchName: method.branchName || '',
      routingNumber: method.routingNumber || '',
      cryptoAddress: method.cryptoAddress || '',
      isPrimary: method.isPrimary,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountNumber && !formData.cryptoAddress) {
      toast.error('Please enter account number or crypto address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, formData);
        toast.success('Payment method updated successfully');
      } else {
        await addPaymentMethod(formData);
        toast.success('Payment method added successfully');
      }
      setIsModalOpen(false);
      fetchMethods();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      await deletePaymentMethod(id);
      toast.success('Payment method deleted');
      fetchMethods();
    } catch (err: any) {
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryPaymentMethod(id);
      toast.success('Primary payment method updated');
      fetchMethods();
    } catch (err: any) {
      toast.error('Failed to set primary method');
    }
  };

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'BKASH':
      case 'NAGAD':
        return <Smartphone className="w-5 h-5 text-pink-600" />;
      case 'BANK_ACCOUNT':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'CRYPTO':
        return <Coins className="w-5 h-5 text-purple-600" />;
      case 'CARD':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      default:
        return <WalletIcon className="w-5 h-5 text-slate-600" />;
    }
  };

  const maskAccountNumber = (num: string) => {
    if (!num) return '';
    if (num.length <= 6) return num;
    return num.slice(0, 3) + '*****' + num.slice(-2);
  };

  return (
    <div className="space-y-6 max-w-[1144px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wallet</h1>
        <p className="text-sm text-slate-500">Manage your payment methods</p>
      </div>

      {/* Security Banner */}
      <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 flex items-center gap-3 text-sm text-blue-900">
        <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="font-medium">Your payment details are used for withdrawal purposes only</p>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">My Payment Methods</h2>
          <Button
            onClick={handleOpenAddModal}
            className="bg-primary! hover:bg-primary/90! text-white! font-medium shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </Button>
        </div>

        {methods.length === 0 && !loading ? (
          <Card className="border-dashed border-slate-200 p-8 text-center text-slate-500">
            No payment methods added yet. Click "+ Add Payment Method" to set up payout options.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <Card
                key={method.id}
                className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {getMethodIcon(method.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{method.type}</h3>
                        <p className="text-xs text-slate-500 font-mono">
                          {method.cryptoAddress
                            ? maskAccountNumber(method.cryptoAddress)
                            : maskAccountNumber(method.accountNumber)}
                        </p>
                      </div>
                    </div>

                    {method.isPrimary && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-0.5 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>

                  {method.bankName && (
                    <div className="text-xs text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg">
                      <p className="font-semibold text-slate-800">{method.bankName}</p>
                      <p>{method.branchName ? `${method.branchName} Branch` : ''}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {!method.isPrimary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetPrimary(method.id)}
                        className="text-xs border-slate-300! text-foreground! hover:bg-slate-50!"
                      >
                        Set as Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(method)}
                      className="text-xs border-slate-300! text-foreground! hover:bg-slate-50! gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(method.id)}
                      className="text-xs border-rose-100 text-rose-600 hover:bg-rose-50 gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter details for receiving payout transfers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Payment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val: PaymentMethodType) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BKASH">bKash</SelectItem>
                  <SelectItem value="NAGAD">Nagad</SelectItem>
                  <SelectItem value="BANK_ACCOUNT">Bank Account</SelectItem>
                  <SelectItem value="CRYPTO">Crypto Wallet</SelectItem>
                  <SelectItem value="CARD">Card / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Account Holder Name</Label>
              <Input
                placeholder="e.g. John Doe"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            {formData.type === 'CRYPTO' ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Crypto Address</Label>
                <Input
                  placeholder="0x1a2b...3c4d"
                  value={formData.cryptoAddress}
                  onChange={(e) => setFormData({ ...formData, cryptoAddress: e.target.value })}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  {formData.type === 'BANK_ACCOUNT' ? 'Account Number' : 'Phone Number'}
                </Label>
                <Input
                  placeholder={formData.type === 'BANK_ACCOUNT' ? '1234567890' : '01700000000'}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>
            )}

            {formData.type === 'BANK_ACCOUNT' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Bank Name</Label>
                  <Input
                    placeholder="e.g. Dutch Bangla Bank"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Branch Name</Label>
                    <Input
                      placeholder="e.g. Gulshan Branch"
                      value={formData.branchName}
                      onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-700">Routing Number</Label>
                    <Input
                      placeholder="e.g. 123456"
                      value={formData.routingNumber}
                      onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrimary: Boolean(checked) })
                }
              />
              <Label
                htmlFor="isPrimary"
                className="text-xs font-medium text-slate-700 cursor-pointer"
              >
                Set as Primary Payment Method
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-foreground!"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary! hover:bg-primary/90! text-white! font-semibold"
              >
                {isSubmitting ? 'Saving...' : 'Save Method'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
