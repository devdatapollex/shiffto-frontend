'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { Card, CardContent } from '@/components/ui/card';

export function SuccessStep() {
  const router = useRouter();

  return (
    <Card className="border border-[#e2e8f0] rounded-2xl bg-white shadow-xs max-w-lg mx-auto">
      <CardContent className="flex flex-col items-center justify-center text-center p-8 md:p-10 space-y-6">
        <div className="rounded-full bg-emerald-50 p-5 text-emerald-500 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="h-16 w-16 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#0B3A8E] tracking-tight">
            Trip submitted for review!
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Your flight trip has been successfully submitted to the Admin team. Once verified and approved, it will become active and visible to Senders.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
          <Button
            type="button"
            onClick={() => router.push(ROUTES.MY_TRIPS)}
            className="flex-1 bg-[#F16522] hover:bg-[#d9541b] text-white font-semibold rounded-xl h-11 transition-colors"
          >
            View My Trips
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className="flex-1 border-[#e2e8f0] text-slate-700 hover:bg-slate-50 font-semibold rounded-xl h-11 transition-colors"
          >
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
