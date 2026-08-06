'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, PlaneTakeoff, ArrowLeftRight, ChevronRight } from 'lucide-react';
import { SearchableCountrySelect } from '@/components/ui/searchable-country-select';
import { DatePicker } from '@/components/ui/custom-picker';
import { useCategories } from '@/hooks/use-categories';
import { useCreateShipmentStore } from '@/store/create-shipment-store';
import { useCreateTripStore } from '@/store/create-trip-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Button } from '../ui/button';

type QuickTab = 'shipment' | 'trip';

export function HowItWorksForm() {
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
    <div className="bg-white border border-input rounded-2xl p-4 sm:p-6 flex flex-col gap-5 w-full drop-shadow-md">
      {/* Form Tabs Header */}
      <div className="flex w-full border-b border-input gap-1 sm:gap-2 pb-0">
        <button
          type="button"
          onClick={() => setActiveTab('shipment')}
          className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 -mb-px border-b-2 cursor-pointer font-medium text-xs min-[380px]:text-sm sm:text-base transition-colors duration-200 select-none ${
            activeTab === 'shipment'
              ? 'border-foreground text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
          }`}
        >
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate min-[380px]:whitespace-nowrap">Send a shipment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trip')}
          className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 -mb-px border-b-2 cursor-pointer font-medium text-xs min-[380px]:text-sm sm:text-base transition-colors duration-200 select-none ${
            activeTab === 'trip'
              ? 'border-foreground text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
          }`}
        >
          <PlaneTakeoff className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate min-[380px]:whitespace-nowrap">Add a trip</span>
        </button>
      </div>

      {/* Tab 1: Shipment Form */}
      {activeTab === 'shipment' ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinueShipment();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-1.5 sm:gap-3 items-end">
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium">
                From <span className="text-red-500">*</span>
              </label>
              <SearchableCountrySelect
                value={shipmentFrom}
                onValueChange={setShipmentFrom}
                placeholder="Select country of departure"
                disabledCode={shipmentTo}
              />
            </div>

            <div className="flex items-end justify-between sm:justify-center shrink-0 sm:h-11 sm:self-end">
              <label className="text-sm font-medium sm:hidden">
                To <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSwapShipmentCountries}
                title="Swap countries"
                className="h-9 w-9 rounded-full border cursor-pointer bg-[#FFF0E7] hover:bg-[#ffe4d6] transition-colors flex items-center justify-center shadow-xs self-center"
              >
                <ArrowLeftRight className="h-4 w-4 text-primary" />
              </button>
              <div className="w-6 sm:hidden" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium hidden sm:block">
                To <span className="text-red-500">*</span>
              </label>
              <SearchableCountrySelect
                value={shipmentTo}
                onValueChange={setShipmentTo}
                placeholder="Select country of arrival"
                disabledCode={shipmentFrom}
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-sm font-medium">Category</label>
            <Select value={shipmentCategory} onValueChange={setShipmentCategory}>
              <SelectTrigger className="w-full h-10 border rounded-md cursor-pointer">
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

          <Button
            type="submit"
            className="w-full px-5 py-3 text-sm font-medium rounded-md border mt-2 flex items-center justify-center gap-2 bg-foreground"
          >
            <span>Continue</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        /* Tab 2: Trip Form */
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinueTrip();
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2.5 sm:gap-3 items-end">
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium">
                From <span className="text-red-500">*</span>
              </label>
              <SearchableCountrySelect
                value={tripFrom}
                onValueChange={setTripFrom}
                placeholder="Select country of departure"
                disabledCode={tripTo}
              />
            </div>

            <div className="flex items-end justify-between sm:justify-center shrink-0 sm:h-11 sm:self-end">
              <label className="text-sm font-medium sm:hidden pb-1">
                To <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSwapTripCountries}
                title="Swap countries"
                className="h-9 w-9 rounded-full border cursor-pointer bg-[#FFF0E7] hover:bg-[#ffe4d6] transition-colors flex items-center justify-center shadow-xs self-center"
              >
                <ArrowLeftRight className="h-4 w-4 text-primary" />
              </button>
              <div className="w-6 sm:hidden" aria-hidden="true" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-sm font-medium hidden sm:block">
                To <span className="text-red-500">*</span>
              </label>
              <SearchableCountrySelect
                value={tripTo}
                onValueChange={setTripTo}
                placeholder="Select country of arrival"
                disabledCode={tripFrom}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Departure date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={tripDate}
              onChange={setTripDate}
              placeholder="Select date of departure"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-md border mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
