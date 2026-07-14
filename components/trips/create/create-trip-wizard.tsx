'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { TRIP_WIZARD_STEPS } from '@/lib/constants/wizard-steps';
import { tripSchema, STEP_FIELDS, type CreateTripValues } from '@/lib/validations/trip';
import { useCreateTripStore } from '@/store/create-trip-store';
import { useCreateTrip } from '@/hooks/use-create-trip';
import { ROUTES } from '@/config/routes';

import { WizardCard } from './wizard-card';
import { DiscardDraftDialog } from './discard-draft-dialog';
import { FlightDetailsStep } from './steps/flight-details-step';
import { UploadTicketStep } from './steps/upload-ticket-step';
import { LuggageCapacityStep } from './steps/luggage-capacity-step';
import { ReviewStep } from './steps/review-step';
import { SuccessStep } from './steps/success-step';

export function CreateTripWizard() {
  const router = useRouter();
  const { step, completedSteps, formData, setStep, updateFormData, markStepComplete, resetWizard } =
    useCreateTripStore();

  const { mutateAsync: createTripApi, isPending } = useCreateTrip();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [mounted, setMounted] = useState(false);

  // Initialize React Hook Form
  const methods = useForm<CreateTripValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      flightNumber: formData.flightNumber || '',
      fromCountry: formData.fromCountry || '',
      toCountry: formData.toCountry || '',
      flightDate: formData.flightDate ? new Date(formData.flightDate) : undefined,
      flightTime: formData.flightTime || '',
      airportArrivalTime: formData.airportArrivalTime || '',
      ticketPhoto: formData.ticketPhoto || '',
      cabinBagCapacity: formData.cabinBagCapacity ?? 0,
      checkInBagCapacity: formData.checkInBagCapacity ?? 0,
    },
  });

  const { trigger, handleSubmit } = methods;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync form state changes back to Zustand persisted store
  useEffect(() => {
    const subscription = methods.watch((data) => {
      updateFormData(data as any);
    });
    return () => subscription.unsubscribe();
  }, [methods, updateFormData]);

  if (!mounted) {
    return null;
  }

  const activeStep = TRIP_WIZARD_STEPS.find((s) => s.id === step) || TRIP_WIZARD_STEPS[0];

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      markStepComplete(step);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleJumpToStep = async (targetStep: number) => {
    // Only allow jumping back to completed or current steps
    if (targetStep < step || completedSteps.includes(targetStep - 1)) {
      setStep(targetStep);
    }
  };

  const handleClose = () => {
    setShowDiscardDialog(true);
  };

  const handleConfirmDiscard = () => {
    resetWizard();
    setShowDiscardDialog(false);
    router.push(ROUTES.MY_TRIPS);
  };

  const onSubmit = async (values: CreateTripValues) => {
    try {
      const payload = {
        flightNumber: values.flightNumber.toUpperCase(),
        fromCountry: values.fromCountry,
        toCountry: values.toCountry,
        flightDate: values.flightDate.toISOString().split('T')[0], // YYYY-MM-DD format for flightDate
        flightTime: values.flightTime,
        airportArrivalTime: values.airportArrivalTime || undefined,
        ticketPhoto: values.ticketPhoto,
        cabinBagCapacity: Number(values.cabinBagCapacity),
        checkInBagCapacity: Number(values.checkInBagCapacity),
      };

      await createTripApi(payload);
      
      // Save to localStorage recent_flights
      try {
        const existing = localStorage.getItem('recent_flights');
        let flights: string[] = existing ? JSON.parse(existing) : [];
        flights = flights.filter((f) => f !== payload.flightNumber);
        flights.unshift(payload.flightNumber);
        flights = flights.slice(0, 4);
        localStorage.setItem('recent_flights', JSON.stringify(flights));
      } catch (e) {
        console.error('Error saving recent flight to localStorage:', e);
      }

      toast.success('Trip submitted successfully');
      resetWizard();
      setIsSuccess(true);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to submit flight trip details';
      toast.error(errorMsg);
    }
  };

  if (isSuccess) {
    return <SuccessStep />;
  }

  return (
    <div className="mx-auto max-w-[850px]">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <WizardCard
            step={activeStep}
            currentStep={step}
            completedSteps={completedSteps}
            onClose={handleClose}
            onBack={handleBack}
            onContinue={handleNext}
            isPending={isPending}
            isFirstStep={step === 1}
            isReviewStep={step === 4}
          >
            {step === 1 && <FlightDetailsStep />}
            {step === 2 && <UploadTicketStep />}
            {step === 3 && <LuggageCapacityStep />}
            {step === 4 && <ReviewStep onJumpToStep={handleJumpToStep} />}
          </WizardCard>
        </form>
      </FormProvider>

      <DiscardDraftDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleConfirmDiscard}
      />
    </div>
  );
}
