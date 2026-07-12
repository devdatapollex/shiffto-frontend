'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RESTRICTED_ITEMS } from '@/lib/constants/restricted-items';

export function RestrictedItemsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-primary underline underline-offset-2 text-sm">
          Restricted Items List
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restricted Items</DialogTitle>
          <DialogDescription>
            The following items are prohibited. Your shipment must not contain any of these.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <ul className="space-y-2">
            {RESTRICTED_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
