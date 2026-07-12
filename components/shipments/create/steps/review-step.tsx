'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Package, Plane } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCountryByCode } from '@/lib/constants/countries';
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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Product Details</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(1)}>
            Edit
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-3">
          <div className="flex gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-muted">
              {values.itemPhotos.length > 0 ? (
                <img
                  src={values.itemPhotos[0]}
                  alt={values.itemName}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{categoryLabel}</Badge>
                <Badge variant="secondary">&check; Not Restricted</Badge>
              </div>

              <h3 className="font-semibold text-lg">{values.itemName}</h3>

              <p className="text-sm text-muted-foreground">
                {Number(values.weight)} Kg &bull; {Number(values.quantity)} pcs
              </p>

              <p className="text-sm text-muted-foreground line-clamp-3">{values.description}</p>

              {values.instructions && (
                <p className="mt-2 text-sm text-muted-foreground italic">
                  &quot;{values.instructions}&quot;
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Route &amp; Pricing</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(2)}>
            Edit
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-3 space-y-4">
          <div className="flex items-center justify-center gap-0">
            <div className="flex flex-col items-center text-center min-w-0 flex-1">
              <span className="text-xs text-muted-foreground">From</span>
              <span className="text-2xl mt-1">{fromCountry?.flag ?? '🌍'}</span>
              <span className="text-sm font-medium mt-0.5 truncate max-w-full">
                {fromCountry?.name ?? 'Select origin'}
              </span>
            </div>

            <div className="flex items-center flex-1 px-2">
              <div className="border-t border-dashed border-border flex-1" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div className="border-t border-dashed border-border flex-1" />
            </div>

            <div className="flex flex-col items-center text-center min-w-0 flex-1">
              <span className="text-xs text-muted-foreground">To</span>
              <span className="text-2xl mt-1">{toCountry?.flag ?? '🌍'}</span>
              <span className="text-sm font-medium mt-0.5 truncate max-w-full">
                {toCountry?.name ?? 'Select destination'}
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2">
            <div>
              <span className="text-xs text-muted-foreground">Price per Kg</span>
              <p className="font-medium">${Number(values.pricePerKg || 0).toFixed(2)}/kg</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Total price</span>
              <p className="font-semibold text-lg">${totalPrice}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
