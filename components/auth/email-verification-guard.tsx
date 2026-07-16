'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { ROUTES } from '@/config/routes';

export function EmailVerificationGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user && !session.user.emailVerified) {
      const email = session.user.email;
      router.replace(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`);
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session?.user && !session.user.emailVerified) {
    return null;
  }

  return <>{children}</>;
}
