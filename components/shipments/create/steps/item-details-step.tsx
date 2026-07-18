'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/use-categories';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { PhotoDropzone } from '../photo-dropzone';
import type { CreateShipmentValues } from '@/lib/validations/shipment';

export function ItemDetailsStep() {
  const { control, watch, setError, clearErrors } = useFormContext<CreateShipmentValues>();
  const { data: categories, isLoading } = useCategories();

  const categoryId = watch('categoryId');
  const weight = watch('weight');
  const quantity = watch('quantity');

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const maxWeight = selectedCategory?.maxWeight ?? null;
  const maxQuantity = selectedCategory?.maxQuantity ?? null;

  useEffect(() => {
    if (typeof weight !== 'number' || weight <= 0) {
      clearErrors('weight');
      return;
    }
    if (!selectedCategory || maxWeight === null) {
      return;
    }
    if (weight > maxWeight) {
      setError('weight', {
        type: 'manual',
        message: `Weight cannot exceed ${maxWeight}kg for this category`,
      });
    } else {
      clearErrors('weight');
    }
  }, [weight, selectedCategory, maxWeight, setError, clearErrors]);

  useEffect(() => {
    if (typeof quantity !== 'number' || quantity <= 0) {
      clearErrors('quantity');
      return;
    }
    if (!selectedCategory || maxQuantity === null) {
      return;
    }
    if (quantity > maxQuantity) {
      setError('quantity', {
        type: 'manual',
        message: `Quantity cannot exceed ${maxQuantity} for this category`,
      });
    } else {
      clearErrors('quantity');
    }
  }, [quantity, selectedCategory, maxQuantity, setError, clearErrors]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Item Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. iPhone 15 Pro Max" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isLoading ? 'Loading categories...' : 'Select category'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  {isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="weight"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>
                Weight <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
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
                    className="pr-10"
                    {...field}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    kg
                  </span>
                </div>
              </FormControl>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 select-none">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {selectedCategory
                    ? maxWeight !== null
                      ? `Allowed range: 0.01 - ${maxWeight} kg`
                      : 'Any weight allowed'
                    : 'Select a category to see allowed weight range'}
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="quantity"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>
                Quantity <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={value === 0 ? '' : String(value)}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange(
                      v === '' || /^\d*$/.test(v) ? (v === '' ? 0 : parseInt(v, 10)) : value
                    );
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Description <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your item (condition, brand, specifications...)"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>Min 10 characters, max 500 characters</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="itemPhotos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Item Photos <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <PhotoDropzone value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormDescription>At least 1 photo required, max 5 images</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Special Instructions{' '}
              <span className="text-muted-foreground font-light">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any special handling or delivery instructions..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
