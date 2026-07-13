'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getCountryByCode } from '@/lib/constants/countries';
import { useCategories } from '@/hooks/use-categories';

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
import { useShipmentOtp } from '@/hooks/use-shipment-otp';

import { WizardCard } from '@/components/shipments/create/wizard-card';
import { DiscardDraftDialog } from '@/components/shipments/create/discard-draft-dialog';
import { ItemDetailsStep } from '@/components/shipments/create/steps/item-details-step';
import { RoutePricingStep } from '@/components/shipments/create/steps/route-pricing-step';
import { ReceiverDetailsStep } from '@/components/shipments/create/steps/receiver-details-step';
import { ReviewStep } from '@/components/shipments/create/steps/review-step';
import { OtpVerificationStep } from '@/components/shipments/create/steps/otp-verification-step';

function WizardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B3A8E] rounded-xl p-4 md:p-6 flex justify-between gap-4 w-full animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="h-3 w-20 bg-white/20 rounded animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/20 animate-pulse" />
            <div className="h-2 w-full rounded-full bg-white/10 animate-pulse" />
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
  const { data: categories } = useCategories();
  const { sendOtp, isSending: isSendingOtp, cooldown } = useShipmentOtp();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const subscription = form.watch((data) => {
      const { otp: _otp, ...rest } = data;
      updateFormData(rest as Partial<CreateShipmentValues>);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const currentStep = WIZARD_STEPS.find((s) => s.id === step) ?? WIZARD_STEPS[0];
  const isFirstStep = step === 1;
  const isReviewStep = step === 4;
  const isOtpStep = step === 5;
  const otpValue = form.watch('otp') ?? '';
  const otpComplete = otpValue.length === 6;

  const handleContinue = async () => {
    const fields = STEP_FIELDS[step] ?? [];
    const valid = await form.trigger(fields);
    if (!valid) return;

    if (step === 1) {
      const categoryId = form.getValues('categoryId');
      const weight = form.getValues('weight');
      const quantity = form.getValues('quantity');
      const category = categories?.find((c) => c.id === categoryId);
      if (category) {
        if (
          typeof weight === 'number' &&
          weight > 0 &&
          category.maxWeight !== null &&
          weight > category.maxWeight
        ) {
          form.setError('weight', {
            type: 'manual',
            message: `Weight cannot exceed ${category.maxWeight}kg for this category`,
          });
          return;
        }
        if (
          typeof quantity === 'number' &&
          quantity > 0 &&
          category.maxQuantity !== null &&
          quantity > category.maxQuantity
        ) {
          form.setError('quantity', {
            type: 'manual',
            message: `Quantity cannot exceed ${category.maxQuantity} for this category`,
          });
          return;
        }
      }
    }

    if (step === 2) {
      const categoryId = form.getValues('categoryId');
      const pricePerKg = form.getValues('pricePerKg');
      const category = categories?.find((c) => c.id === categoryId);
      if (category && typeof pricePerKg === 'number' && pricePerKg > 0) {
        const { minPrice, maxPrice } = category;
        const below = minPrice !== null && pricePerKg < minPrice;
        const above = maxPrice !== null && pricePerKg > maxPrice;
        if (below || above) {
          const minStr = minPrice !== null ? `$${minPrice}` : '$0';
          const maxStr = maxPrice !== null ? `$${maxPrice}` : 'any amount';
          form.setError('pricePerKg', {
            type: 'manual',
            message: `Price must be between ${minStr} and ${maxStr}`,
          });
          return;
        }
      }
    }

    if (step === 4) {
      const sent = await sendOtp(false);
      if (!sent) return;
    }

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
    const { notRestrictedConfirmation: _, receiverPhoneExt, receiverPhoneNum, ...rest } = values;

    const country = getCountryByCode(receiverPhoneExt || '');
    const callingCode = country?.callingCode ?? '';
    const mergedPhone = `${callingCode}${receiverPhoneNum || ''}`;

    const payload: CreateShipmentPayload = {
      ...rest,
      receiverPhone: mergedPhone,
    };

    try {
      await mutateAsync(payload);
      toast.success('Shipment created successfully!');
      resetWizard();
      router.push(ROUTES.MY_SHIPMENTS);
      router.refresh();
    } catch (error) {
      const message = (error as { message?: string })?.message;
      if (message) toast.error(message);
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
      case 5:
        return (
          <OtpVerificationStep
            sendOtp={sendOtp}
            isSending={isSendingOtp}
            cooldown={cooldown}
            isSubmitting={isPending}
          />
        );
      default:
        return null;
    }
  };

  if (!mounted) {
    return <WizardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[850px]">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <WizardCard
            step={currentStep}
            currentStep={step}
            completedSteps={completedSteps}
            onClose={handleClose}
            onBack={handleBack}
            onContinue={handleContinue}
            isPending={isPending || isSendingOtp}
            isFirstStep={isFirstStep}
            isSubmitStep={isOtpStep}
            submitDisabled={!otpComplete}
            continueLabel={isReviewStep ? 'Proceed to verification' : 'Continue'}
            submitLabel="Verify & Create"
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
    </div>
  );
}
