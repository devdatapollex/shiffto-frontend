import { z } from 'zod';

export const shipmentSchema = z
  .object({
    itemName: z.string().min(2, 'Item name is required'),
    categoryId: z.string().min(1, 'Select a category'),
    weight: z.number({ message: 'Weight is required' }).positive('Weight must be greater than 0'),
    quantity: z
      .number({ message: 'Quantity is required' })
      .int('Quantity must be a whole number')
      .positive('Quantity must be at least 1'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description is too long'),
    itemPhotos: z
      .array(z.string())
      .min(1, 'At least 1 photo is required')
      .max(5, 'Maximum 5 photos'),
    instructions: z.string().max(500, 'Instructions are too long'),

    fromCountry: z.string().min(1, 'Select origin country'),
    toCountry: z.string().min(1, 'Select destination country'),
    pricePerKg: z
      .number({ message: 'Price is required' })
      .positive('Price must be greater than $0'),
    notRestrictedConfirmation: z.boolean().refine((v) => v === true, {
      message: 'You must confirm items are not restricted',
    }),

    receiverName: z.string().min(2, 'Receiver name is required'),
    receiverPhone: z.string().min(1, 'Phone number is required'),
    receiverPhoneExt: z.string().min(1, 'Extension is required'),
    receiverPhoneNum: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\d{5,15}$/, 'Enter a valid phone number'),
    receiverAddress: z.string().min(10, 'Address must be at least 10 characters'),

    otp: z.string().length(6, 'Enter the 6-digit code'),
  })
  .refine((data) => data.fromCountry !== data.toCountry, {
    message: 'Origin and destination must be different',
    path: ['toCountry'],
  });

export type CreateShipmentValues = z.infer<typeof shipmentSchema>;

export const STEP_FIELDS: Record<number, (keyof CreateShipmentValues)[]> = {
  1: ['itemName', 'categoryId', 'weight', 'quantity', 'description', 'itemPhotos', 'instructions'],
  2: ['fromCountry', 'toCountry', 'pricePerKg', 'notRestrictedConfirmation'],
  3: ['receiverName', 'receiverPhoneExt', 'receiverPhoneNum', 'receiverAddress'],
  4: [],
  5: ['otp'],
};

export type CreateShipmentPayload = Omit<
  CreateShipmentValues,
  'notRestrictedConfirmation' | 'receiverPhoneExt' | 'receiverPhoneNum'
>;
