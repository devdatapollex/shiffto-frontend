'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { COUNTRIES } from '@/lib/constants/countries';
import { CountryFlag } from '../country-flag';
import type { CreateShipmentValues } from '@/lib/validations/shipment';
import { SearchableCountrySelect } from '@/components/ui/searchable-country-select';


export function ReceiverDetailsStep() {
  const { control, watch, setValue } = useFormContext<CreateShipmentValues>();
  const toCountryCode = watch('toCountry');
  const receiverPhoneExt = watch('receiverPhoneExt');
  const receiverPhoneNum = watch('receiverPhoneNum');

  // Default the extension to destination country on mount if empty
  useEffect(() => {
    if (!receiverPhoneExt && toCountryCode) {
      setValue('receiverPhoneExt', toCountryCode);
    } else if (!receiverPhoneExt) {
      setValue('receiverPhoneExt', 'US');
    }
  }, [toCountryCode, receiverPhoneExt, setValue]);

  // Keep combined receiverPhone in sync without triggering full form re-validation on every keypress
  useEffect(() => {
    const country = COUNTRIES.find((c) => c.code === receiverPhoneExt);
    const callingCode = country?.callingCode ?? '';
    setValue('receiverPhone', `${callingCode}${receiverPhoneNum || ''}`);
  }, [receiverPhoneExt, receiverPhoneNum, setValue]);


  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="receiverName"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[#0b3a8e] font-semibold text-sm">
              Receiver name <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter the name of receiver"
                className="h-11 bg-white border-[#e2e8f0] text-slate-700 rounded-lg placeholder:text-slate-400"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-1.5">
        <label className="text-[#0b3a8e] font-semibold text-sm block">
          Receiver phone number <span className="text-red-500">*</span>
        </label>

        <div className="flex items-center w-full h-11 border border-[#e2e8f0] rounded-lg px-3 bg-white focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]">
          <FormField
            control={control}
            name="receiverPhoneExt"
            render={({ field }) => (
              <FormItem className="space-y-0 flex items-center">
                <SearchableCountrySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  showCallingCode
                  triggerClassName="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none gap-1 hover:opacity-80 transition-opacity [&>svg]:hidden shrink-0 cursor-pointer select-none"
                />
              </FormItem>
            )}
          />


          <span className="h-5 w-px bg-slate-200 mx-3 self-center shrink-0" />

          <FormField
            control={control}
            name="receiverPhoneNum"
            render={({ field }) => (
              <FormItem className="flex-1 space-y-0 h-full">
                <FormControl>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter the phone number of receiver"
                    className="border-0 focus:outline-hidden focus-visible:ring-0 shadow-none bg-transparent w-full h-full pl-0 text-sm text-slate-700 placeholder:text-slate-400"
                    value={field.value}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(digits);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="receiverPhoneNum"
          render={() => <FormMessage className="text-xs" />}
        />
        <FormField
          control={control}
          name="receiverPhoneExt"
          render={() => <FormMessage className="text-xs" />}
        />
      </div>

      <FormField
        control={control}
        name="receiverAddress"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[#0b3a8e] font-semibold text-sm">
              Receiver address <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter the address of receiver"
                className="min-h-[100px] bg-white border-[#e2e8f0] text-slate-700 placeholder:text-slate-400 rounded-lg"
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
