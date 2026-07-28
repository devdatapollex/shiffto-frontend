'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRestrictedItems } from '@/hooks/use-restricted-items';

interface RestrictedItemsDialogProps {
  className?: string;
}

export function RestrictedItemsDialog({ className }: RestrictedItemsDialogProps) {
  const { data, isLoading } = useRestrictedItems({ activeOnly: true, limit: 100 });
  const items = data?.data || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            className ||
            'text-primary underline underline-offset-2 text-sm hover:opacity-80 transition-opacity'
          }
        >
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
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Loading restricted items...</span>
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No restricted items found.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <span className="font-medium text-foreground">{item.name}</span>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
