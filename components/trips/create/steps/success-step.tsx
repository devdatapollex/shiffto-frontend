'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';

export function SuccessStep() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-6 max-w-md mx-auto">
      <div className="rounded-full bg-green-50 p-6 text-green-500 animate-bounce">
        <CheckCircle2 className="h-16 w-16 stroke-[1.5]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[#0B3A8E] tracking-tight">
          Trip Submitted Successfully!
        </h2>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Your flight trip has been submitted to the Admin team for review. You will be notified via in-app notification and email once it has been approved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
        <Button
          type="button"
          onClick={() => router.push(ROUTES.MY_TRIPS)}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg h-11"
        >
          View My Trips
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="flex-1 border-[#e2e8f0] text-slate-700 hover:bg-slate-50 font-semibold rounded-lg h-11"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
