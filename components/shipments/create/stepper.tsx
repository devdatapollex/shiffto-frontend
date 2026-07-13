'use client';

import { cn } from '@/lib/utils';
import { WIZARD_STEPS } from '@/lib/constants/wizard-steps';

interface StepperProps {
  currentStep: number;
  completedSteps: number[];
}

export function Stepper({ currentStep, completedSteps }: StepperProps) {
  // Only show active wizard steps (e.g. filter out Payment which is inactive)
  const stepsToShow = WIZARD_STEPS.filter((step) => !step.inactive);

  return (
    <div className="bg-[#0B3A8E] rounded-xl p-4 md:p-6 flex items-center justify-between gap-4 w-full">
      {stepsToShow.map((step) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;

        // Custom colors for state transitions matching the mock-up:
        // - Completed step: Green text, Green dot, Green line
        // - Current step: White text, White dot, White line
        // - Upcoming step: Muted gray-blue text, dot, line
        let textColorClass = 'text-[#7A94C6]';
        let dotColorClass = 'bg-[#7A94C6]';
        let barColorClass = 'bg-[#2D5299]';

        if (isCompleted) {
          textColorClass = 'text-[#00E575]';
          dotColorClass = 'bg-[#00E575]';
          barColorClass = 'bg-[#00E575]';
        } else if (isCurrent) {
          textColorClass = 'text-white';
          dotColorClass = 'bg-white';
          barColorClass = 'bg-white';
        }

        return (
          <div key={step.id} className="flex-1 flex flex-col items-center gap-2">
            <span
              className={cn(
                'text-xs font-semibold tracking-wide text-center transition-colors duration-200',
                textColorClass
              )}
            >
              {step.name}
            </span>
            <div
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors duration-200',
                dotColorClass
              )}
            />
            <div
              className={cn(
                'h-2 w-full rounded-full transition-colors duration-200',
                barColorClass
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
