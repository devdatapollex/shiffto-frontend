'use client';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ShipmentChatContent } from './shipment-chat-content';

interface ShipmentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
}

export function ShipmentChatDrawer({ isOpen, onClose, shipmentId }: ShipmentChatDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 border-l border-slate-200 w-full sm:max-w-md">
        <SheetTitle className="sr-only">Shipment Chat Drawer</SheetTitle>

        {/* Decoupled lazy rendering: Chat UI is mounted ONLY when drawer is active */}
        {isOpen && shipmentId ? (
          <ShipmentChatContent shipmentId={shipmentId} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
