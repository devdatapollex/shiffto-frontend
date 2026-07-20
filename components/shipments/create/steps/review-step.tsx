'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Package, Plane, Pencil, CheckCircle2 } from 'lucide-react';
import { getCountryByCode } from '@/lib/constants/countries';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { CountryFlag } from '../country-flag';
import { useCategories } from '@/hooks/use-categories';
import type { CreateShipmentValues } from '@/lib/validations/shipment';

interface ReviewStepProps {
  onEdit: (step: number) => void;
}

export function ReviewStep({ onEdit }: ReviewStepProps) {
  const { getValues } = useFormContext<CreateShipmentValues>();
  const { data: categories } = useCategories();

  const values = getValues();

  const totalPrice = useMemo(() => {
    const p = Number(values.pricePerKg) || 0;
    const w = Number(values.weight) || 0;
    return (p * w).toFixed(2);
  }, [values.pricePerKg, values.weight]);

  const fromCountry = getCountryByCode(values.fromCountry);
  const toCountry = getCountryByCode(values.toCountry);

  const category = categories?.find((c) => c.id === values.categoryId);
  const categoryLabel = category?.name ?? 'Unknown';

  return (
    <div className="space-y-6">
      {/* Product Details Card */}
      <div className="relative bg-[#F8FAFC] border border-[#e2e8f0] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#8292a1] text-lg font-medium">Product details</h3>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-0 cursor-pointer p-1 -m-1"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-6 items-start">
          <div className="h-[120px] w-[120px] shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-[#E2E8F0]/40 flex items-center justify-center">
            {values.itemPhotos.length > 0 ? (
              <Image
                src={toRelativeImageUrl(values.itemPhotos[0])}
                alt={values.itemName}
                className="h-full w-full object-cover"
                width={120}
                height={120}
              />
            ) : (
              <Package className="h-10 w-10 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-[#F5F3FF] border border-[#E9D5FF] text-[#7C3AED] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {categoryLabel}
              </span>
              <span className="bg-[#ECFDF5] border border-[#D1FAE5] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                Non-restricted
              </span>
            </div>

            <h4 className="text-[#0B3A8E] text-lg font-bold mt-2 truncate">{values.itemName}</h4>

            <p className="text-slate-400 text-sm font-medium mt-1">
              {Number(values.weight)} Kg &bull; {Number(values.quantity)}pcs
            </p>

            <p className="text-slate-500 text-sm leading-relaxed mt-2 line-clamp-3 text-slate-600">
              {values.description}
            </p>
          </div>
        </div>

        {values.instructions && (
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-[#EA580C] text-sm font-semibold">
            Special instructions: {values.instructions}
          </div>
        )}
      </div>

      {/* Route & Pricing Card */}
      <div className="relative bg-[#F8FAFC] border border-[#e2e8f0] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#8292a1] text-lg font-medium">Route &amp; pricing</h3>
          <button
            type="button"
            onClick={() => onEdit(2)}
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
              <CountryFlag
                code={values.fromCountry}
                className="h-6 w-9 rounded-md shadow-xs border border-slate-100"
              />
              <span className="text-[#0B3A8E] font-bold text-lg truncate">
                {fromCountry?.name ?? 'Select origin'}
              </span>
            </div>
          </div>

          {/* Dotted Flight Line */}
          <div className="flex-1 flex items-center px-4 relative self-end mb-2.5">
            <div className="border-t-2 border-dashed border-[#F16522] flex-1 opacity-70" />
            <div className="flex items-center justify-center mx-3 shrink-0">
              <Plane className="h-6 w-6 text-black fill-black rotate-45" />
            </div>
            <div className="border-t-2 border-dashed border-[#F16522] flex-1 opacity-70" />
          </div>

          {/* Destination */}
          <div className="flex flex-col items-end min-w-0">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-right">
              Destination
            </span>
            <div className="flex items-center gap-2.5 mt-2 justify-end">
              <CountryFlag
                code={values.toCountry}
                className="h-6 w-9 rounded-md shadow-xs border border-slate-100"
              />
              <span className="text-[#0B3A8E] font-bold text-lg truncate text-right">
                {toCountry?.name ?? 'Select destination'}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl py-3 px-5 flex items-center justify-between mt-6">
          <span className="text-[#8292a1] text-sm font-medium">
            ${Number(values.pricePerKg || 0).toFixed(2)}/kg
          </span>
          <span className="text-[#0b3a8e] font-bold text-base">Total price : ${totalPrice}</span>
        </div>
      </div>

      {/* Identity & KYC Notice */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 flex gap-3 text-xs md:text-sm text-slate-600">
        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 mb-0.5">Identity &amp; KYC verification</p>
          Creating a shipment requires an approved KYC Verification. Once verified, your shipment
          will be active and visible to Travelers on your route.
        </div>
      </div>
    </div>
  );
}
