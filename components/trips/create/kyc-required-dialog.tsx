'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface KycRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KycRequiredDialog({ open, onOpenChange }: KycRequiredDialogProps) {
  const router = useRouter();

  const handleNavigateToKyc = () => {
    onOpenChange(false);
    router.push('/dashboard/profile?tab=kyc');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/10">
        <DialogHeader className="flex flex-col items-center gap-3 text-center sm:text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-primary">
            KYC Verification Required
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            To maintain a secure and trusted community, we require all users to complete their
            identity verification before creating trips or shipments. This helps us ensure safety,
            trust, and compliance across the platform.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Not Now
          </Button>
          <Button
            onClick={handleNavigateToKyc}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            Verify Identity
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
