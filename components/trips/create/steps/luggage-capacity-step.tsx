'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CreateTripValues } from '@/lib/validations/trip';
import { Briefcase, Luggage } from 'lucide-react';

export function LuggageCapacityStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateTripValues>();

  const isTotalCapacityError = errors.checkInBagCapacity?.message?.includes('Total bag capacity');

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Cabin Bag Capacity */}
          <FormField
            control={control}
            name="cabinBagCapacity"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[#0B3A8E] font-semibold text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-500" />
                  Cabin bag capacity (in KG) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 7"
                      value={
                        value === undefined || value === null || Number.isNaN(value)
                          ? ''
                          : String(value)
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        onChange(v === '' ? undefined : parseFloat(v));
                      }}
                      className="h-11 pl-4 pr-12 bg-white border-[#e2e8f0] text-slate-700 rounded-lg font-medium"
                      {...field}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      KG
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-In Bag Capacity */}
          <FormField
            control={control}
            name="checkInBagCapacity"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[#0B3A8E] font-semibold text-sm flex items-center gap-2">
                  <Luggage className="h-4 w-4 text-orange-500" />
                  Check-in bag capacity (in KG) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 23"
                      value={
                        value === undefined || value === null || Number.isNaN(value)
                          ? ''
                          : String(value)
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        onChange(v === '' ? undefined : parseFloat(v));
                      }}
                      className="h-11 pl-4 pr-12 bg-white border-[#e2e8f0] text-slate-700 rounded-lg font-medium"
                      {...field}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      KG
                    </span>
                  </div>
                </FormControl>
                {!isTotalCapacityError && <FormMessage />}
              </FormItem>
            )}
          />
        </div>

        {isTotalCapacityError && (
          <p data-slot="form-message" className="text-destructive text-sm mt-2">
            {errors.checkInBagCapacity?.message}
          </p>
        )}
      </div>

      <div className="rounded-lg bg-orange-50/50 border border-orange-100 p-4 text-xs md:text-sm text-slate-600">
        <p className="font-semibold text-orange-600 mb-1">Important Note:</p>
        Please freely specify the luggage capacity you are willing to offer for shipping. These
        limits will help Senders request shipment matches that align with your travel capacities.
      </div>
    </div>
  );
}
