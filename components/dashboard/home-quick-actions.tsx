'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, PlaneTakeoff, ArrowLeftRight, ChevronRight } from 'lucide-react';
import { COUNTRIES, getCountryByCode } from '@/lib/constants/countries';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import { useCategories } from '@/hooks/use-categories';
import { useCreateShipmentStore } from '@/store/create-shipment-store';
import { useCreateTripStore } from '@/store/create-trip-store';
import { DatePicker } from '@/components/ui/custom-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type QuickTab = 'shipment' | 'trip';

export function HomeQuickActions() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QuickTab>('shipment');

  // Shipment State
  const [shipmentFrom, setShipmentFrom] = useState<string>('');
  const [shipmentTo, setShipmentTo] = useState<string>('');
  const [shipmentCategory, setShipmentCategory] = useState<string>('');

  // Trip State
  const [tripFrom, setTripFrom] = useState<string>('');
  const [tripTo, setTripTo] = useState<string>('');
  const [tripDate, setTripDate] = useState<Date | undefined>(undefined);

  const { data: categories } = useCategories();

  const handleSwapShipmentCountries = () => {
    const temp = shipmentFrom;
    setShipmentFrom(shipmentTo);
    setShipmentTo(temp);
  };

  const handleSwapTripCountries = () => {
    const temp = tripFrom;
    setTripFrom(tripTo);
    setTripTo(temp);
  };

  const handleContinueShipment = () => {
    if (!shipmentFrom || !shipmentTo) {
      toast.error('Please select both departure and arrival countries');
      return;
    }
    useCreateShipmentStore.getState().updateFormData({
      fromCountry: shipmentFrom,
      toCountry: shipmentTo,
      categoryId: shipmentCategory || undefined,
    });
    router.push('/dashboard/shipments/create');
  };

  const handleContinueTrip = () => {
    if (!tripFrom || !tripTo) {
      toast.error('Please select both departure and arrival countries');
      return;
    }
    useCreateTripStore.getState().updateFormData({
      fromCountry: tripFrom,
      toCountry: tripTo,
      flightDate: tripDate || undefined,
    });
    router.push('/dashboard/trips/create');
  };

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('shipment')}
          className={cn(
            'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
            activeTab === 'shipment'
              ? 'bg-[#eef4ff] text-[#0B3A8E]'
              : 'text-slate-600 hover:text-[#0B3A8E] hover:bg-slate-50'
          )}
        >
          <Package className="h-4.5 w-4.5" />
          <span>Send a shipment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trip')}
          className={cn(
            'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
            activeTab === 'trip'
              ? 'bg-[#eef4ff] text-[#0B3A8E]'
              : 'text-slate-600 hover:text-[#0B3A8E] hover:bg-slate-50'
          )}
        >
          <PlaneTakeoff className="h-4.5 w-4.5" />
          <span>Add a trip</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'shipment' ? (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full">
          {/* From Country */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <label className="text-[#0B3A8E] font-semibold text-xs sm:text-sm block">
              From <span className="text-red-500">*</span>
            </label>
            <Select value={shipmentFrom} onValueChange={setShipmentFrom}>
              <SelectTrigger className="w-full h-11 bg-white border-slate-200 text-slate-700 rounded-lg">
                {shipmentFrom ? (
                  <span className="flex items-center gap-2 truncate">
                    <CountryFlag code={shipmentFrom} className="h-4 w-6 shrink-0" />
                    <span className="truncate">{getCountryByCode(shipmentFrom)?.name}</span>
                  </span>
                ) : (
                  <SelectValue placeholder="Select country of departure" />
                )}
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[var(--radix-select-trigger-width)] max-h-[280px]"
              >
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} disabled={c.code === shipmentTo}>
                    <div className="flex items-center gap-2">
                      <CountryFlag code={c.code} className="h-4 w-6 shrink-0" />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center shrink-0 self-center lg:self-end">
            <button
              type="button"
              onClick={handleSwapShipmentCountries}
              title="Swap countries"
              className="h-11 w-11 rounded-full bg-[#fff5f0] border border-[#ffedd5] text-[#FF6F3F] hover:bg-[#ffe8dc] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* To Country */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <label className="text-[#0B3A8E] font-semibold text-xs sm:text-sm block">
              To <span className="text-red-500">*</span>
            </label>
            <Select value={shipmentTo} onValueChange={setShipmentTo}>
              <SelectTrigger className="w-full h-11 bg-white border-slate-200 text-slate-700 rounded-lg">
                {shipmentTo ? (
                  <span className="flex items-center gap-2 truncate">
                    <CountryFlag code={shipmentTo} className="h-4 w-6 shrink-0" />
                    <span className="truncate">{getCountryByCode(shipmentTo)?.name}</span>
                  </span>
                ) : (
                  <SelectValue placeholder="Select country of arrival" />
                )}
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[var(--radix-select-trigger-width)] max-h-[280px]"
              >
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} disabled={c.code === shipmentFrom}>
                    <div className="flex items-center gap-2">
                      <CountryFlag code={c.code} className="h-4 w-6 shrink-0" />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <label className="text-[#0B3A8E] font-semibold text-xs sm:text-sm block">
              Category
            </label>
            <Select value={shipmentCategory} onValueChange={setShipmentCategory}>
              <SelectTrigger className="w-full h-11 bg-white border-slate-200 text-slate-700 rounded-lg">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[var(--radix-select-trigger-width)] max-h-[280px]"
              >
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Button */}
          <div className="shrink-0 lg:self-end">
            <Button
              variant="default"
              onClick={handleContinueShipment}
              className="w-full lg:w-auto h-11 px-6 bg-foreground hover:bg-foreground/90 font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full">
          {/* From Country */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <label className="text-[#0B3A8E] font-semibold text-xs sm:text-sm block">
              From <span className="text-red-500">*</span>
            </label>
            <Select value={tripFrom} onValueChange={setTripFrom}>
              <SelectTrigger className="w-full h-11 bg-white border-slate-200 text-slate-700 rounded-lg">
                {tripFrom ? (
                  <span className="flex items-center gap-2 truncate">
                    <CountryFlag code={tripFrom} className="h-4 w-6 shrink-0" />
                    <span className="truncate">{getCountryByCode(tripFrom)?.name}</span>
                  </span>
                ) : (
                  <SelectValue placeholder="Select country of departure" />
                )}
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[var(--radix-select-trigger-width)] max-h-[280px]"
              >
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} disabled={c.code === tripTo}>
                    <div className="flex items-center gap-2">
                      <CountryFlag code={c.code} className="h-4 w-6 shrink-0" />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center shrink-0 self-center lg:self-end">
            <button
              type="button"
              onClick={handleSwapTripCountries}
              title="Swap countries"
              className="h-11 w-11 rounded-full bg-[#fff5f0] border border-[#ffedd5] text-[#FF6F3F] hover:bg-[#ffe8dc] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* To Country */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <label className="text-[#0B3A8E] font-semibold text-xs sm:text-sm block">
              To <span className="text-red-500">*</span>
            </label>
            <Select value={tripTo} onValueChange={setTripTo}>
              <SelectTrigger className="w-full h-11 bg-white border-slate-200 text-slate-700 rounded-lg">
                {tripTo ? (
                  <span className="flex items-center gap-2 truncate">
                    <CountryFlag code={tripTo} className="h-4 w-6 shrink-0" />
                    <span className="truncate">{getCountryByCode(tripTo)?.name}</span>
                  </span>
                ) : (
                  <SelectValue placeholder="Select country of arrival" />
                )}
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-[var(--radix-select-trigger-width)] max-h-[280px]"
              >
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} disabled={c.code === tripFrom}>
                    <div className="flex items-center gap-2">
                      <CountryFlag code={c.code} className="h-4 w-6 shrink-0" />
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Departure Date */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <label className="text-[#0B3A8E] font-semibold text-xs sm:text-sm block">
              Departure date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={tripDate}
              onChange={setTripDate}
              placeholder="Select date of departure"
            />
          </div>

          {/* Action Button */}
          <div className="shrink-0 lg:self-end">
            <button
              type="button"
              onClick={handleContinueTrip}
              className="w-full lg:w-auto h-11 px-6 rounded-lg bg-[#0B3A8E] hover:bg-[#082a69] text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
