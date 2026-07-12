'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  shipmentSchema,
  STEP_FIELDS,
  type CreateShipmentValues,
  type CreateShipmentPayload,
} from '@/lib/validations/shipment';
import { WIZARD_STEPS } from '@/lib/constants/wizard-steps';
import { ROUTES } from '@/config/routes';
import { useCreateShipmentStore } from '@/store/create-shipment-store';
import { useCreateShipment } from '@/hooks/use-create-shipment';

import { WizardCard } from '@/components/shipments/create/wizard-card';
import { DiscardDraftDialog } from '@/components/shipments/create/discard-draft-dialog';
import { ItemDetailsStep } from '@/components/shipments/create/steps/item-details-step';
import { RoutePricingStep } from '@/components/shipments/create/steps/route-pricing-step';
import { ReceiverDetailsStep } from '@/components/shipments/create/steps/receiver-details-step';
import { ReviewStep } from '@/components/shipments/create/steps/review-step';

function WizardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded hidden sm:block" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="border-t" />
        <div className="space-y-4">
          <div className="h-9 w-full bg-muted animate-pulse rounded" />
          <div className="h-9 w-full bg-muted animate-pulse rounded" />
          <div className="h-24 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="border-t pt-6 flex items-center justify-between">
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export function CreateShipmentWizard() {
  const [mounted, setMounted] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const router = useRouter();

  const store = useCreateShipmentStore();
  const { step, completedSteps, formData, setStep, updateFormData, markStepComplete, resetWizard } =
    store;

  const form = useForm<CreateShipmentValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: formData as CreateShipmentValues,
  });

  const { mutateAsync, isPending } = useCreateShipment();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const subscription = form.watch((data) => {
      updateFormData(data as Partial<CreateShipmentValues>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const currentStep = WIZARD_STEPS.find((s) => s.id === step) ?? WIZARD_STEPS[0];
  const isFirstStep = step === 1;
  const isReviewStep = step === 4;

  const handleContinue = async () => {
    const fields = STEP_FIELDS[step] ?? [];
    const valid = await form.trigger(fields);
    if (!valid) return;
    markStepComplete(step);
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleEdit = (targetStep: number) => {
    setStep(targetStep);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const { notRestrictedConfirmation: _, ...payload } = values;

    try {
      await mutateAsync(payload);
      toast.success('Shipment created successfully!');
      resetWizard();
      router.push(ROUTES.MY_SHIPMENTS);
      router.refresh();
    } catch (error) {
      toast.error((error as { message?: string }).message || 'Failed to create shipment');
    }
  });

  const handleClose = useCallback(() => {
    if (form.formState.isDirty) {
      setShowDiscardDialog(true);
    } else {
      resetWizard();
      router.push(ROUTES.DASHBOARD);
    }
  }, [form.formState.isDirty, resetWizard, router]);

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    resetWizard();
    router.push(ROUTES.DASHBOARD);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ItemDetailsStep />;
      case 2:
        return <RoutePricingStep />;
      case 3:
        return <ReceiverDetailsStep />;
      case 4:
        return <ReviewStep onEdit={handleEdit} />;
      default:
        return null;
    }
  };

  if (!mounted) {
    return <WizardSkeleton />;
  }

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <WizardCard
            step={currentStep}
            currentStep={step}
            completedSteps={completedSteps}
            onClose={handleClose}
            onBack={handleBack}
            onContinue={handleContinue}
            isPending={isPending}
            isFirstStep={isFirstStep}
            isReviewStep={isReviewStep}
          >
            {renderStep()}
          </WizardCard>
        </form>
      </FormProvider>

      <DiscardDraftDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleConfirmDiscard}
      />
    </>
  );
}
