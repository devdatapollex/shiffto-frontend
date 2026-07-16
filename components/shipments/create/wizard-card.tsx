'use client';

import type { ReactNode } from 'react';
import { X, Package } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import type { WizardStep } from '@/lib/constants/wizard-steps';
import { Stepper } from './stepper';

interface WizardCardProps {
  step: WizardStep;
  currentStep: number;
  completedSteps: number[];
  onClose: () => void;
  onBack?: () => void;
  onContinue?: () => void;
  isPending?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isSubmitStep?: boolean;
  submitDisabled?: boolean;
  continueLabel?: string;
  submitLabel?: string;
  children: ReactNode;
}

export function WizardCard({
  step,
  currentStep,
  completedSteps,
  onClose,
  onBack,
  onContinue,
  isPending = false,
  isFirstStep = false,
  isLastStep = false,
  isSubmitStep = false,
  submitDisabled = false,
  continueLabel = 'Continue',
  submitLabel = 'Create Shipment',
  children,
}: WizardCardProps) {
  return (
    <div className="space-y-6">
      <Stepper currentStep={currentStep} completedSteps={completedSteps} />

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 px-6 pt-6 pb-5 space-y-0">
          <div className="flex w-full items-center justify-between">
            <Package className="h-10 w-10 text-primary stroke-[1.5]" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-transparent shrink-0"
            >
              <X className="size-6 stroke-[3]" />
            </Button>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-[#0B3A8E] tracking-tight">
              Create a new shipment
            </CardTitle>
            <CardDescription className="text-[#6B7280] text-sm md:text-base font-normal mt-1">
              {step.subtitle}
            </CardDescription>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="py-6">{children}</CardContent>

        <Separator />

        <CardFooter className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep || isPending}
          >
            Back
          </Button>

          {isSubmitStep ? (
            <Button key="submit-btn" type="submit" disabled={isPending || submitDisabled}>
              {isPending ? 'Verifying...' : submitLabel}
            </Button>
          ) : (
            <Button key="continue-btn" type="button" onClick={onContinue} disabled={isPending}>
              {continueLabel}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
