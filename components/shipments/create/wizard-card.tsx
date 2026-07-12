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
  isReviewStep?: boolean;
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
  isReviewStep = false,
  children,
}: WizardCardProps) {
  return (
    <div className="space-y-6">
      <Stepper currentStep={currentStep} completedSteps={completedSteps} />

      <Card className="shadow-sm">
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Create a new shipment</CardTitle>
              <CardDescription className="mt-1">{step.subtitle}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
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

          {isReviewStep ? (
            <Button key="submit-btn" type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Shipment'}
            </Button>
          ) : (
            <Button key="continue-btn" type="button" onClick={onContinue} disabled={isPending}>
              Continue
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
