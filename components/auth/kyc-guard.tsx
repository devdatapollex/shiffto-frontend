'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import { useSession } from '@/lib/auth-client';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight, Home, Loader2 } from 'lucide-react';

export function KycGuard({ children }: { children: ReactNode }) {
  const { data: profile, isLoading } = useProfile();
  const { data: session, isPending: sessionPending } = useSession();
  const router = useRouter();

  if (isLoading || sessionPending) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#0B3A8E]" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Checking verification status...
        </p>
      </div>
    );
  }

  const role = session?.user?.role;
  const kycStatus = profile?.kyc?.status || 'NOT_SUBMITTED';

  // Allow access if user is admin or KYC status is APPROVED
  if (role === 'admin' || kycStatus === 'APPROVED') {
    return <>{children}</>;
  }

  // Otherwise, render a premium block screen in place of the page content
  return (
    <div className="mx-auto max-w-[600px] py-12 px-4">
      <div className="relative overflow-hidden rounded-lg border border-primary/10 bg-card p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Icon Container matching modal */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100 mb-6">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-bold text-primary mb-3">KYC Verification Required</h2>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-8">
            To maintain a secure and trusted community, we require all users to complete their
            identity verification before creating trips or shipments. This helps us ensure safety,
            trust, and compliance across the platform.
          </p>

          {/* Verification Status Banner if pending/rejected */}
          {kycStatus !== 'NOT_SUBMITTED' && (
            <div className="w-full mb-8 rounded-lg p-3 bg-muted/50 border border-border text-xs flex items-center justify-center gap-2 font-medium">
              <span>Current Status:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  kycStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {kycStatus}
              </span>
            </div>
          )}

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.DASHBOARD)}
              className="w-full border-primary! text-primary! sm:w-auto flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push(`${ROUTES.PROFILE}?tab=kyc`)}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Verify Identity
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
