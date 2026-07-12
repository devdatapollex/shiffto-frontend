'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRIES } from '@/lib/constants/countries';
import { RestrictedItemsDialog } from '../restricted-items-dialog';
import type { CreateShipmentValues } from '@/lib/validations/shipment';

export function RoutePricingStep() {
  const { control, watch } = useFormContext<CreateShipmentValues>();

  const pricePerKg = watch('pricePerKg');
  const weight = watch('weight');

  const totalPrice = useMemo(() => {
    const p = typeof pricePerKg === 'number' ? pricePerKg : 0;
    const w = typeof weight === 'number' ? weight : 0;
    return (p * w).toFixed(2);
  }, [pricePerKg, weight]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="fromCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From (Origin)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="mr-1">{country.flag}</span>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="toCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To (Destination)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="mr-1">{country.flag}</span>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="pricePerKg"
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Price (per kg)</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={value === 0 ? '' : String(value)}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange(v === '' ? 0 : parseFloat(v));
                  }}
                  className="pl-7"
                  {...field}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  /kg
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {Number(totalPrice) > 0 && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Price</span>
            <span className="font-semibold">${totalPrice}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {`${Number(weight) > 0 ? weight : 0}kg × $${Number(pricePerKg) > 0 ? pricePerKg : 0}/kg`}
          </p>
        </div>
      )}

      <FormField
        control={control}
        name="notRestrictedConfirmation"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-lg border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm">
                I confirm that the items are not on the <RestrictedItemsDialog />
              </FormLabel>
              <FormDescription>
                Shipments containing restricted items will be rejected and may result in account
                suspension.
              </FormDescription>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
