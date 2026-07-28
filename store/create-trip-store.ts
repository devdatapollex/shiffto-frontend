import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreateTripValues } from '@/lib/validations/trip';

const INITIAL_FORM_DATA: Partial<CreateTripValues> = {
  flightNumber: '',
  fromCountry: '',
  toCountry: '',
  flightDate: undefined,
  flightTime: '',
  ticketPhoto: '',
  cabinBagCapacity: undefined,
  checkInBagCapacity: undefined,
};

interface CreateTripState {
  step: number;
  completedSteps: number[];
  formData: Partial<CreateTripValues>;

  setStep: (step: number) => void;
  updateFormData: (data: Partial<CreateTripValues>) => void;
  markStepComplete: (step: number) => void;
  resetWizard: () => void;
}

export const useCreateTripStore = create<CreateTripState>()(
  persist(
    (set) => ({
      step: 1,
      completedSteps: [],
      formData: INITIAL_FORM_DATA,

      setStep: (step) => set({ step }),
      updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),
      resetWizard: () => set({ step: 1, completedSteps: [], formData: INITIAL_FORM_DATA }),
    }),
    {
      name: 'shiffto:create-trip',
    }
  )
);
