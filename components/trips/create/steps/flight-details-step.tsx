'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRIES, getCountryByCode } from '@/lib/constants/countries';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import type { CreateTripValues } from '@/lib/validations/trip';
import { ArrowLeftRight } from 'lucide-react';
import { DatePicker, TimePicker } from '@/components/ui/custom-picker';

export function FlightDetailsStep() {
  const { control, setValue, watch } = useFormContext<CreateTripValues>();
  const [recentFlights, setRecentFlights] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['BG-0306', 'BG-0307', 'BG-0308', 'BG-0309'];
    try {
      const stored = localStorage.getItem('recent_flights');
      if (stored) return JSON.parse(stored);
      const defaultFlights = ['BG-0306', 'BG-0307', 'BG-0308', 'BG-0309'];
      localStorage.setItem('recent_flights', JSON.stringify(defaultFlights));
      return defaultFlights;
    } catch {
      return ['BG-0306', 'BG-0307', 'BG-0308', 'BG-0309'];
    }
  });

  const fromCountry = watch('fromCountry');
  const toCountry = watch('toCountry');

  const handleSwapCountries = () => {
    setValue('fromCountry', toCountry, { shouldDirty: true, shouldValidate: true });
    setValue('toCountry', fromCountry, { shouldDirty: true, shouldValidate: true });
  };

  const handlePillClick = (flightNumber: string) => {
    setValue('flightNumber', flightNumber, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* Flight Number */}
      <FormField
        control={control}
        name="flightNumber"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[#0B3A8E] font-semibold text-sm">
              Flight Number <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., BG-0306"
                className="h-11 bg-white border-[#e2e8f0] text-slate-700 rounded-lg uppercase"
                {...field}
              />
            </FormControl>
            {recentFlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-slate-400 font-medium mr-1">Recently used:</span>
                {recentFlights.map((flight) => (
                  <button
                    key={flight}
                    type="button"
                    onClick={() => handlePillClick(flight)}
                    className="px-3 py-1 text-xs rounded-full border border-slate-200 hover:border-orange-500 hover:text-orange-500 transition-colors font-medium bg-slate-50 text-slate-600"
                  >
                    {flight}
                  </button>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* From and To Countries */}
      <div className="flex flex-col md:flex-row items-end gap-3 w-full">
        <FormField
          control={control}
          name="fromCountry"
          render={({ field }) => (
            <FormItem className="flex-1 w-full space-y-1.5">
              <FormLabel className="text-[#0B3A8E] font-semibold text-sm">
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
                      <SelectValue placeholder="Departure country" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" className="max-h-[300px]">
                  {COUNTRIES.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      disabled={country.code === toCountry}
                    >
                      <CountryFlag code={country.code} className="h-4 w-6 mr-2" />
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex-none h-11 flex items-center justify-center self-center md:self-end">
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
            <FormItem className="flex-1 w-full space-y-1.5">
              <FormLabel className="text-[#0B3A8E] font-semibold text-sm">
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
                      <SelectValue placeholder="Destination country" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" className="max-h-[300px]">
                  {COUNTRIES.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      disabled={country.code === fromCountry}
                    >
                      <CountryFlag code={country.code} className="h-4 w-6 mr-2" />
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

      {/* Flight Schedule Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Departure Date */}
        <FormField
          control={control}
          name="flightDate"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[#0B3A8E] font-semibold text-sm">
                Departure Date <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select departure date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Departure Time */}
        <FormField
          control={control}
          name="flightTime"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[#0B3A8E] font-semibold text-sm">
                Departure Time <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <TimePicker
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Select departure time"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Airport Arrival Time */}
        <FormField
          control={control}
          name="airportArrivalTime"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[#0B3A8E] font-semibold text-sm">
                Airport Arrival Time
              </FormLabel>
              <FormControl>
                <TimePicker
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Select arrival time"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
