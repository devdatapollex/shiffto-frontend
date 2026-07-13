import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreateShipmentValues } from '@/lib/validations/shipment';

const INITIAL_FORM_DATA: Partial<CreateShipmentValues> = {
  itemName: '',
  categoryId: '',
  weight: 0,
  quantity: 1,
  description: '',
  itemPhotos: [],
  instructions: '',
  fromCountry: '',
  toCountry: '',
  pricePerKg: 0,
  notRestrictedConfirmation: false,
  receiverName: '',
  receiverPhone: '',
  receiverPhoneExt: '',
  receiverPhoneNum: '',
  receiverAddress: '',
  otp: '',
};

interface CreateShipmentState {
  step: number;
  completedSteps: number[];
  formData: Partial<CreateShipmentValues>;

  setStep: (step: number) => void;
  updateFormData: (data: Partial<CreateShipmentValues>) => void;
  markStepComplete: (step: number) => void;
  resetWizard: () => void;
}

export const useCreateShipmentStore = create<CreateShipmentState>()(
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
      name: 'shiffto:create-shipment',
    }
  )
);
