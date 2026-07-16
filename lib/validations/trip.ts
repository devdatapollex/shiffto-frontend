import { z } from 'zod';

export const tripSchema = z
  .object({
    flightNumber: z
      .string()
      .min(2, 'Flight number is required')
      .regex(/^[A-Z0-9-\s]+$/i, 'Invalid flight number format'),
    fromCountry: z.string().min(1, 'Select origin country'),
    toCountry: z.string().min(1, 'Select destination country'),
    flightDate: z.date({
      error: 'Departure date is required',
    }),
    flightTime: z.string().min(1, 'Departure time is required'),
    airportArrivalTime: z.string().optional(),
    ticketPhoto: z.string().optional(),
    cabinBagCapacity: z
      .number({
        error: (iss) =>
          iss.input === undefined
            ? 'Cabin bag capacity is required'
            : 'Cabin bag capacity must be a number',
      })
      .nonnegative('Capacity must be 0 or more'),
    checkInBagCapacity: z
      .number({
        error: (iss) =>
          iss.input === undefined
            ? 'Check-in bag capacity is required'
            : 'Check-in bag capacity must be a number',
      })
      .nonnegative('Capacity must be 0 or more'),
  })
  .refine((data) => data.fromCountry !== data.toCountry, {
    message: 'Origin and destination must be different',
    path: ['toCountry'],
  });

export type CreateTripValues = z.infer<typeof tripSchema>;

export const STEP_FIELDS: Record<number, (keyof CreateTripValues)[]> = {
  1: ['flightNumber', 'fromCountry', 'toCountry', 'flightDate', 'flightTime', 'airportArrivalTime'],
  2: ['ticketPhoto'],
  3: ['cabinBagCapacity', 'checkInBagCapacity'],
  4: [],
};

export type CreateTripPayload = {
  flightNumber: string;
  fromCountry: string;
  toCountry: string;
  flightDate: string; // ISO string for backend
  flightTime: string;
  airportArrivalTime?: string;
  ticketPhoto?: string;
  cabinBagCapacity: number;
  checkInBagCapacity: number;
};
