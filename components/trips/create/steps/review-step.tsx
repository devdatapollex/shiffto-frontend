'use client';

import { useFormContext } from 'react-hook-form';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import type { CreateTripValues } from '@/lib/validations/trip';
import { Plane, FileText, CheckCircle2, Pencil } from 'lucide-react';

interface ReviewStepProps {
  onJumpToStep: (step: number) => void;
}

export function ReviewStep({ onJumpToStep }: ReviewStepProps) {
  const { watch } = useFormContext<CreateTripValues>();

  const values = watch();
  const fromCountry = getCountryByCode(values.fromCountry);
  const toCountry = getCountryByCode(values.toCountry);

  const formattedDate = values.flightDate
    ? new Date(values.flightDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const formatTimeString = (timeStr: string | null | undefined) => {
    if (!timeStr) return 'Not specified';
    try {
      const [hoursStr, minutesStr] = timeStr.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      if (isNaN(hours) || isNaN(minutes)) return timeStr;

      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const isPdf = values.ticketPhoto?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-6">
      {/* Flight Details Card */}
      <div className="relative bg-[#F8FAFC] border border-[#e2e8f0] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#8292a1] text-lg font-medium">Flight details</h3>
          <button
            type="button"
            onClick={() => onJumpToStep(1)}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 cursor-pointer p-1 -m-1"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Origin */}
          <div className="flex flex-col items-start min-w-0">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Origin
            </span>
            <div className="flex items-center gap-2.5 mt-2">
              {values.fromCountry && (
                <CountryFlag
                  code={values.fromCountry}
                  className="h-6 w-9 rounded-md shadow-xs border border-slate-100"
                />
              )}
              <span className="text-[#0B3A8E] font-bold text-lg truncate">
                {fromCountry?.name ?? 'Select origin'}
              </span>
            </div>
          </div>

          {/* Dotted Flight Line */}
          <div className="flex-1 flex items-center px-4 relative self-end mb-2.5">
            <div className="border-t-2 border-dashed border-[#F16522] flex-1 opacity-70" />
            <div className="flex items-center justify-center mx-3 shrink-0">
              <Plane className="h-6 w-6 text-black rotate-45" />
            </div>
            <div className="border-t-2 border-dashed border-[#F16522] flex-1 opacity-70" />
          </div>

          {/* Destination */}
          <div className="flex flex-col items-end min-w-0">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-right">
              Destination
            </span>
            <div className="flex items-center gap-2.5 mt-2 justify-end">
              {values.toCountry && (
                <CountryFlag
                  code={values.toCountry}
                  className="h-6 w-9 rounded-md shadow-xs border border-slate-100"
                />
              )}
              <span className="text-[#0B3A8E] font-bold text-lg truncate text-right">
                {toCountry?.name ?? 'Select destination'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-200/60 text-sm text-slate-600">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold">Flight number</span>
            <strong className="text-slate-700 font-semibold mt-1">
              {values.flightNumber || 'N/A'}
            </strong>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold">Flight date</span>
            <strong className="text-slate-700 font-semibold mt-1">{formattedDate || 'N/A'}</strong>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold">Flight time</span>
            <strong className="text-slate-700 font-semibold mt-1">
              {formatTimeString(values.flightTime)}
            </strong>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold">Arrival time</span>
            <strong className="text-slate-700 font-semibold mt-1">
              {formatTimeString(values.airportArrivalTime)}
            </strong>
          </div>
        </div>
      </div>

      {/* Flight Ticket Card */}
      <div className="relative bg-[#F8FAFC] border border-[#e2e8f0] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#8292a1] text-lg font-medium">Flight ticket</h3>
          <button
            type="button"
            onClick={() => onJumpToStep(2)}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 cursor-pointer p-1 -m-1"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>

        {values.ticketPhoto ? (
          <div className="flex gap-6 items-start">
            <div className="h-[120px] w-[120px] shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-[#E2E8F0]/40 flex items-center justify-center">
              {isPdf ? (
                <FileText className="h-10 w-10 text-red-500 shrink-0" />
              ) : (
                <Image
                  src={toRelativeImageUrl(values.ticketPhoto)}
                  alt="Ticket preview"
                  className="h-full w-full object-cover"
                  width={120}
                  height={120}
                />
              )}
            </div>
            <div className="flex-1 min-w-0 self-center">
              <span className="bg-[#ECFDF5] border border-[#D1FAE5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                Verification file ready
              </span>
              <h4 className="text-[#0B3A8E] text-lg font-bold mt-2 truncate">
                {isPdf ? 'Flight_Ticket.pdf' : 'Flight_Ticket.png'}
              </h4>
              <p className="text-slate-400 text-sm mt-1">Uploaded successfully</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-6 items-start">
            <div className="h-[120px] w-[120px] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
              <FileText className="h-10 w-10 text-slate-300 shrink-0" />
            </div>
            <div className="flex-1 min-w-0 self-center">
              <span className="bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                No file uploaded
              </span>
              <h4 className="text-slate-500 text-lg font-bold mt-2 truncate">No ticket attached</h4>
              <p className="text-slate-400 text-sm mt-1">
                You did not upload a flight ticket. Admin verification will proceed using flight
                details.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Luggage Capacity Card */}
      <div className="relative bg-[#F8FAFC] border border-[#e2e8f0] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#8292a1] text-lg font-medium">Luggage capacity</h3>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 cursor-pointer p-1 -m-1"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-lg py-3 px-5 flex items-center justify-between">
            <span className="text-[#8292a1] text-sm font-medium">Cabin Bag Capacity</span>
            <strong className="text-[#0B3A8E] text-base">{values.cabinBagCapacity || 0} KG</strong>
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-lg py-3 px-5 flex items-center justify-between">
            <span className="text-[#8292a1] text-sm font-medium">Check-In Bag Capacity</span>
            <strong className="text-[#0B3A8E] text-base">
              {values.checkInBagCapacity || 0} KG
            </strong>
          </div>
        </div>
      </div>

      {/* Admin Verification Notice */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex gap-3 text-xs md:text-sm text-slate-600">
        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 mb-0.5">Admin approval verification</p>
          Your trip will be submitted to the Admin team for KYC Verification. Once verified and
          approved, it will become active and visible to Senders looking to ship luggage cargo on
          your flight route.
        </div>
      </div>
    </div>
  );
}
