'use client';

import { useMemo, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRIES, getCountryByCode } from '@/lib/constants/countries';
import { CountryFlag } from '../country-flag';
import { RestrictedItemsDialog } from '../restricted-items-dialog';
import { useCategories } from '@/hooks/use-categories';
import type { CreateShipmentValues } from '@/lib/validations/shipment';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export function RoutePricingStep() {
  const { control, watch, setValue, setError, clearErrors } =
    useFormContext<CreateShipmentValues>();
  const { data: categories } = useCategories();

  const fromCountry = watch('fromCountry');
  const toCountry = watch('toCountry');
  const pricePerKg = watch('pricePerKg');
  const weight = watch('weight');
  const categoryId = watch('categoryId');

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const minPrice = selectedCategory?.minPrice ?? null;
  const maxPrice = selectedCategory?.maxPrice ?? null;

  const totalPrice = useMemo(() => {
    const p = typeof pricePerKg === 'number' ? pricePerKg : 0;
    const w = typeof weight === 'number' ? weight : 0;
    return (p * w).toFixed(2);
  }, [pricePerKg, weight]);

  useEffect(() => {
    if (typeof pricePerKg !== 'number' || pricePerKg <= 0) {
      clearErrors('pricePerKg');
      return;
    }
    if (!selectedCategory) {
      return;
    }
    const below = minPrice !== null && pricePerKg < minPrice;
    const above = maxPrice !== null && pricePerKg > maxPrice;
    if (below || above) {
      const minStr = minPrice !== null ? `$${minPrice}` : '$0';
      const maxStr = maxPrice !== null ? `$${maxPrice}` : 'any amount';
      setError('pricePerKg', {
        type: 'manual',
        message: `Price must be between ${minStr} and ${maxStr}`,
      });
    } else {
      clearErrors('pricePerKg');
    }
  }, [pricePerKg, selectedCategory, minPrice, maxPrice, setError, clearErrors]);

  const handleSwapCountries = () => {
    setValue('fromCountry', toCountry, { shouldDirty: true, shouldValidate: true });
    setValue('toCountry', fromCountry, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3 w-full">
        <FormField
          control={control}
          name="fromCountry"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1.5">
              <FormLabel className="text-[#0b3a8e] font-semibold text-sm">
                From <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger className="w-full h-11 bg-white border-[#e2e8f0] text-slate-700 rounded-lg">
                    {field.value ? (
                      <span className="flex items-center gap-2">
                        <CountryFlag code={field.value} className="h-5 w-7" />
                        <span>{getCountryByCode(field.value)?.name}</span>
                      </span>
                    ) : (
                      <SelectValue placeholder="Select country of departure" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <CountryFlag code={country.code} className="h-4 w-6" />
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex-none h-11 flex items-center justify-center">
          <button
            type="button"
            onClick={handleSwapCountries}
            className="w-10 h-10 rounded-full bg-[#FFF1EB] flex items-center justify-center hover:bg-[#FFE5D9] transition-colors border-0 cursor-pointer"
            title="Swap countries"
          >
            <ArrowLeftRight className="h-4 w-4 text-[#F16522]" />
          </button>
        </div>

        <FormField
          control={control}
          name="toCountry"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1.5">
              <FormLabel className="text-[#0b3a8e] font-semibold text-sm">
                To <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger className="w-full h-11 bg-white border-[#e2e8f0] text-slate-700 rounded-lg">
                    {field.value ? (
                      <span className="flex items-center gap-2">
                        <CountryFlag code={field.value} className="h-5 w-7" />
                        <span>{getCountryByCode(field.value)?.name}</span>
                      </span>
                    ) : (
                      <SelectValue placeholder="Select country of arrival" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <CountryFlag code={country.code} className="h-4 w-6" />
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

      <div className="border border-[#e2e8f0] rounded-xl p-5 bg-white space-y-6">
        <h3 className="text-[#8292a1] text-lg font-medium">Pricing details</h3>

        <div className="flex items-start gap-4">
          <FormField
            control={control}
            name="pricePerKg"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem className="flex-1 space-y-1.5">
                <FormLabel className="text-[#0b3a8e] font-semibold text-sm">
                  Price (per KG) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      $
                    </span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={value === 0 ? '' : String(value)}
                      onChange={(e) => {
                        const v = e.target.value;
                        onChange(
                          v === '' || /^\d*\.?\d*$/.test(v) ? (v === '' ? 0 : parseFloat(v)) : value
                        );
                      }}
                      className="pl-8 h-11 bg-white border-[#e2e8f0] text-slate-700 rounded-lg"
                      {...field}
                    />
                  </div>
                </FormControl>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 select-none">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>
                    {selectedCategory
                      ? minPrice !== null && maxPrice !== null
                        ? `Allowed range : $${minPrice} - $${maxPrice} (per KG)`
                        : minPrice !== null
                          ? `Minimum price : $${minPrice} (per KG)`
                          : 'Allowed range will be applied on continue'
                      : 'Select a category in Step 1 to see allowed price range'}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex-none h-11 flex items-center justify-center mt-[28px]">
            <span className="text-slate-400 text-xl font-light">×</span>
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-semibold text-[#0b3a8e] block">Weight</label>
            <Input
              type="text"
              disabled
              value={`${weight || 0} Kg`}
              className="h-11 bg-[#F8FAFC] border-[#e2e8f0] text-slate-400 font-semibold rounded-lg opacity-100 disabled:opacity-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="w-full bg-[#FFF1EB] rounded-lg py-3 px-4 flex justify-end items-center">
          <span className="text-[#0b3a8e] font-bold text-sm sm:text-base">
            Total price : ${totalPrice}
          </span>
        </div>
      </div>

      <FormField
        control={control}
        name="notRestrictedConfirmation"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0 py-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-[#0B3A8E] data-[state=checked]:border-[#0B3A8E] border-slate-300 text-white rounded-[4px] cursor-pointer"
              />
            </FormControl>
            <FormLabel className="text-sm font-normal text-slate-700 cursor-pointer select-none">
              I confirm that my item is not in the{' '}
              <RestrictedItemsDialog className="text-[#0b3a8e] hover:text-[#0b3a8e]/80 font-medium underline underline-offset-2 text-sm inline bg-transparent p-0 border-0 cursor-pointer" />{' '}
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
