'use client';

import type { ReactNode } from 'react';
import { X, PlaneTakeoff, ChevronLeft, ChevronRight } from 'lucide-react';
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
  isReviewStep = false,
  children,
}: WizardCardProps) {
  return (
    <div className="space-y-6">
      <Stepper currentStep={currentStep} completedSteps={completedSteps} />

      <Card className="shadow-sm border-0 md:border md:shadow-md bg-white">
        <CardHeader className="flex flex-col gap-4 px-6 pt-6 pb-5 space-y-0 relative">
          <div className="flex w-full items-center justify-between">
            <div className="rounded-full bg-orange-50 p-2 text-orange-500">
              <PlaneTakeoff className="h-10 w-10 stroke-[1.5]" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-transparent absolute top-6 right-6 shrink-0"
            >
              <X className="size-6 stroke-[3]" />
            </Button>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#0B3A8E] tracking-tight">
              Add a new trip
            </CardTitle>
            <CardDescription className="text-[#6B7280] text-sm md:text-base font-normal mt-1">
              {step.subtitle}
            </CardDescription>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="py-6 px-6">{children}</CardContent>

        <Separator />

        <CardFooter className="flex items-center justify-between pt-6 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep || isPending}
            className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 font-semibold flex items-center gap-1 rounded-md px-6 py-5 h-9"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {isReviewStep ? (
            <Button
              key="submit-btn"
              type="submit"
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-1 rounded-md px-6 py-5 h-9"
            >
              {isPending ? 'Confirming...' : 'Confirm and submit'} <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              key="continue-btn"
              type="button"
              onClick={onContinue}
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-1 rounded-md px-6 py-5 h-9"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
