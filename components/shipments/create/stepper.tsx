'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIZARD_STEPS, type WizardStep } from '@/lib/constants/wizard-steps';

interface StepperProps {
  currentStep: number;
  completedSteps: number[];
}

function StepperNode({
  step,
  isCompleted,
  isCurrent,
  isInactive,
}: {
  step: WizardStep;
  isCompleted: boolean;
  isCurrent: boolean;
  isInactive: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 flex-1 min-w-0',
        isInactive && 'opacity-40'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
          isCompleted && 'bg-primary text-primary-foreground',
          isCurrent && 'border-2 border-primary bg-primary/10 text-primary',
          !isCompleted && !isCurrent && 'border border-border text-muted-foreground'
        )}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : step.id}
      </div>
      <span
        className={cn(
          'text-xs text-center hidden sm:block',
          isCurrent && 'text-primary font-medium',
          isCompleted && 'text-foreground',
          !isCompleted && !isCurrent && 'text-muted-foreground'
        )}
      >
        {step.name}
      </span>
    </div>
  );
}

function ProgressLine({ isFilled }: { isFilled: boolean }) {
  return (
    <div className="flex-1 px-1 mt-[-10px]">
      <div className={cn('h-0.5 rounded-full', isFilled ? 'bg-primary' : 'bg-border')} />
    </div>
  );
}

export function Stepper({ currentStep, completedSteps }: StepperProps) {
  return (
    <div className="flex items-start justify-between gap-0.5">
      {WIZARD_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isInactive = step.inactive;
        const isLast = index === WIZARD_STEPS.length - 1;
        const showLine = !isLast && !step.inactive;

        return (
          <div key={step.id} className="flex items-start flex-1 min-w-0">
            <StepperNode
              step={step}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isInactive={isInactive}
            />
            {showLine && <ProgressLine isFilled={isCompleted || isCurrent} />}
          </div>
        );
      })}
    </div>
  );
}
