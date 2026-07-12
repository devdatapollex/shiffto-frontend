'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateShipmentValues } from '@/lib/validations/shipment';

export function ReceiverDetailsStep() {
  const { control } = useFormContext<CreateShipmentValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="receiverName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Receiver Name</FormLabel>
            <FormControl>
              <Input placeholder="Full name of the recipient" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="receiverPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input type="tel" inputMode="tel" placeholder="e.g. +971501234567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="receiverAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Receiver Address</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Full delivery address including city, state, zip code..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
