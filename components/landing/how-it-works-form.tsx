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
    <div className="border rounded-xl p-6 flex flex-col gap-6 w-full">
      {/* Form Tabs Header */}
      <div className="flex border-b pb-4 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('shipment')}
          className={`flex items-center gap-2 font-medium pb-2 border-b-2 cursor-pointer ${
            activeTab === 'shipment' ? 'border-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Send a shipment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trip')}
          className={`flex items-center gap-2 font-medium pb-2 border-b-2 cursor-pointer ${
            activeTab === 'trip' ? 'border-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          <PlaneTakeoff className="h-4 w-4" />
          <span>Add a trip</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div className="flex flex-col gap-1">
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

            <div className="flex justify-center pb-1">
              <button
                type="button"
                onClick={handleSwapShipmentCountries}
                title="Swap countries"
                className="p-2 border rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
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
          <div className="flex flex-col gap-1">
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

          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-md border mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue</span>
            <ChevronRight className="h-4 w-4" />
          </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div className="flex flex-col gap-1">
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

            <div className="flex justify-center pb-1">
              <button
                type="button"
                onClick={handleSwapTripCountries}
                title="Swap countries"
                className="p-2 border rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
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
