'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { COUNTRIES } from '@/lib/constants/countries';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchableCountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabledCode?: string;
  showCallingCode?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function SearchableCountrySelect({
  value,
  onValueChange,
  placeholder = 'Select country',
  disabledCode,
  showCallingCode = false,
  triggerClassName,
}: SearchableCountrySelectProps) {
  const [open, setOpen] = useState(false);

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find((c) => c.code === value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full h-11 justify-between bg-white border-[#e2e8f0] text-slate-700 rounded-lg px-3 font-normal hover:bg-slate-50 cursor-pointer overflow-hidden',
            !value && 'text-slate-400',
            triggerClassName
          )}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2 min-w-0 overflow-hidden">
              <CountryFlag code={selectedCountry.code} className="h-4 w-6 shrink-0" />
              <span className="truncate">{selectedCountry.name}</span>
              {showCallingCode && (
                <span className="text-slate-400 text-xs shrink-0">
                  ({selectedCountry.callingCode})
                </span>
              )}
            </span>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[200px] max-w-[calc(100vw-2rem)] p-0 bg-white shadow-md border border-slate-200"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-[220px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => {
                const isDisabled = country.code === disabledCode;
                const isSelected = country.code === value;
                const searchKey = `${country.name} ${country.code} ${country.callingCode}`;
                return (
                  <CommandItem
                    key={country.code}
                    value={searchKey}
                    disabled={isDisabled}
                    onSelect={() => {
                      onValueChange(country.code);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-2 text-sm rounded-md transition-colors cursor-pointer',
                      isDisabled && 'opacity-40 cursor-not-allowed',
                      isSelected && 'font-semibold'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <CountryFlag code={country.code} className="h-4 w-6 shrink-0" />
                      <span className="truncate">{country.name}</span>
                      {showCallingCode && (
                        <span className="text-slate-400 text-xs shrink-0">
                          {country.callingCode}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
