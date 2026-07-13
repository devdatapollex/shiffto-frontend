'use client';

import { useFormContext } from 'react-hook-form';
import { getCountryByCode } from '@/lib/constants/countries';
import { CountryFlag } from '@/components/shipments/create/country-flag';
import type { CreateTripValues } from '@/lib/validations/trip';
import { Plane, Calendar, Clock, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

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

  const isPdf = values.ticketPhoto?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-6">
      {/* Route and Flight Summary */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[#0B3A8E] font-bold text-sm uppercase tracking-wide">Route & Schedule</h3>
          <button
            type="button"
            onClick={() => onJumpToStep(1)}
            className="text-orange-500 hover:text-orange-600 text-xs font-semibold hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-semibold text-lg text-slate-800">
            {fromCountry && (
              <span className="flex items-center gap-2">
                <CountryFlag code={fromCountry.code} className="h-5 w-7" />
                <span>{fromCountry.name}</span>
              </span>
            )}
            <ArrowRight className="h-4 w-4 text-slate-400" />
            {toCountry && (
              <span className="flex items-center gap-2">
                <CountryFlag code={toCountry.code} className="h-5 w-7" />
                <span>{toCountry.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-orange-500" />
            <span>Flight: <strong>{values.flightNumber || 'N/A'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>Date: <strong>{formattedDate || 'N/A'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>Time: <strong>{values.flightTime || 'N/A'}</strong></span>
          </div>
        </div>
      </div>

      {/* Ticket Verification Summary */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[#0B3A8E] font-bold text-sm uppercase tracking-wide">Flight Ticket</h3>
          <button
            type="button"
            onClick={() => onJumpToStep(2)}
            className="text-orange-500 hover:text-orange-600 text-xs font-semibold hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        {values.ticketPhoto ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 bg-slate-50/50">
            {isPdf ? (
              <FileText className="h-10 w-10 text-red-500 shrink-0" />
            ) : (
              <img
                src={values.ticketPhoto}
                alt="Ticket preview"
                className="h-10 w-10 object-cover rounded border bg-white shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {isPdf ? 'Flight_Ticket.pdf' : 'Flight_Ticket.png'}
              </p>
              <p className="text-xs text-slate-400">Verification file ready</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">Ticket file is required</p>
        )}
      </div>

      {/* Luggage Capacity Details */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[#0B3A8E] font-bold text-sm uppercase tracking-wide">Luggage Capacity</h3>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="text-orange-500 hover:text-orange-600 text-xs font-semibold hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/30 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Cabin Bag Capacity</span>
            <strong className="text-[#0B3A8E] text-base">{values.cabinBagCapacity || 0} KG</strong>
          </div>
          <div className="rounded-lg border border-slate-100 p-3 bg-slate-50/30 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Check-In Bag Capacity</span>
            <strong className="text-[#0B3A8E] text-base">{values.checkInBagCapacity || 0} KG</strong>
          </div>
        </div>
      </div>

      {/* Admin Verification Notice */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex gap-3 text-xs md:text-sm text-slate-600">
        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 mb-0.5">Admin approval verification</p>
          Your trip will be submitted to the Admin team for KYC Verification. Once verified and approved, it will become active and visible to Senders looking to ship luggage cargo on your flight route.
        </div>
      </div>
    </div>
  );
}
