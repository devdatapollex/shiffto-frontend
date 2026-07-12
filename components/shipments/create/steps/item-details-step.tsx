'use client';

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
import { Loader2 } from 'lucide-react';
import { PhotoDropzone } from '../photo-dropzone';
import type { CreateShipmentValues } from '@/lib/validations/shipment';

export function ItemDetailsStep() {
  const { control } = useFormContext<CreateShipmentValues>();
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isLoading ? 'Loading categories...' : 'Select category'}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={value === 0 ? '' : String(value)}
                    onChange={(e) => {
                      const v = e.target.value;
                      onChange(v === '' ? 0 : parseFloat(v));
                    }}
                    className="pr-10"
                    {...field}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    kg
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="quantity"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  value={value === 0 ? '' : String(value)}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange(v === '' ? 0 : parseInt(v, 10));
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
            <FormLabel>Description</FormLabel>
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
            <FormLabel>Item Photos</FormLabel>
            <FormControl>
              <PhotoDropzone value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormDescription>Upload up to 10 images of your item</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Special Instructions</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any special handling or delivery instructions..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>Optional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
